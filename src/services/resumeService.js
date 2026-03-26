import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import * as pdfjsLib from 'pdfjs-dist';

// Use local worker via Vite's ?url to avoid CDN CORS or version mismatch issues
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const uploadResume = async (userId, file) => {
  const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const webUrl = await getDownloadURL(snapshot.ref);
  return { webUrl, name: file.name, size: file.size };
};

export const extractTextFromFile = async (file) => {
  if (file.type !== 'application/pdf') {
     console.warn("Only PDF text extraction is supported natively in the browser currently. Proceeding with limited scope.");
     return "Applicant submitted a DOCX. No text extracted. Assess blindly or prompt user to convert.";
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
    }
    
    // Limit text length to prevent breaking context windows unnecessarily
    return fullText.slice(0, 15000);
  } catch (error) {
    console.error("PDF Parsing error:", error);
    throw new Error("Failed to extract text from PDF.");
  }
};

export const analyzeResumeWithAI = async (resumeText, desiredRole) => {
  if(!GROQ_API_KEY) {
     throw new Error("Missing VITE_GROQ_API_KEY in .env file.");
  }

  const prompt = `
You are an expert AI Technical Recruiter & ATS System. 
Analyze the following resume text against the desired role: "${desiredRole}".

You MUST format your ONLY response as a strictly valid JSON object. Do NOT include markdown code blocks. Do NOT include any accompanying text.
Structure exactly like this:
{
  "skills": {
    "technical": ["React", "JavaScript", "etc"],
    "tools": ["Git", "Docker", "etc"],
    "soft": ["Communication", "Leadership"],
    "certifications": ["AWS Certified"]
  },
  "profileScore": 85, 
  "atsScore": {
    "total": 82,
    "readability": 90,
    "impact": 75,
    "keywords": 88,
    "formatting": 80,
    "brevity": 85,
    "grammar": 95
  },
  "summary": "AI generated 2 sentence professional summary of the candidate's strengths targeting the desired role."
}

Resume Text:
${resumeText}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze resume with AI. Check API Key and format.");
  }
};

export const saveUserSkills = async (userId, analysis, resumeUrl) => {
  const data = {
    ...analysis,
    resumeUrl,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'userSkills', userId), data);
  return data;
};

export const getUserSkills = async (userId) => {
  const docRef = doc(db, 'userSkills', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const timeout = (prom, time, msg) => Promise.race([prom, new Promise((_, r) => setTimeout(() => r(new Error(msg)), time))]);

export const analyzeAndSave = async (userId, file, desiredRole) => {
  try {
    console.log("Step 1: Uploading to Storage...");
    let webUrl = "upload_failed_no_bucket";
    try {
      const upload = await timeout(uploadResume(userId, file), 8000, "Storage timeout");
      webUrl = upload.webUrl;
    } catch (uploadErr) {
      console.warn("Storage Upload Failed (Continuing to AI Parse anyway):", uploadErr.message);
    }
    
    console.log("Step 2: Parsing PDF...");
    const text = await timeout(extractTextFromFile(file), 10000, "PDF parsing timed out. The PDF worker might be blocked by your network/adblocker.");
    
    console.log("Step 3: Calling Groq AI...");
    const analysis = await timeout(analyzeResumeWithAI(text, desiredRole), 15000, "Groq AI timed out. API might be unreachable.");
    
    console.log("Step 4: Saving to Database...");
    const saved = await timeout(saveUserSkills(userId, analysis, webUrl), 5000, "Firestore database save timed out. Database rules might be blocking.");
    
    return { upload: { webUrl }, analysis, saved };
  } catch (err) {
    console.error("Pipeline Error:", err);
    throw err;
  }
};
