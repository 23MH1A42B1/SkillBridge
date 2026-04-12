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

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are an Elite Executive Talent Auditor. Analyze the resume text to extract deep technical skills, implicit soft skills, and business impact metrics. Look for 'leadership signals' and 'problem-solving depth'. Output in JSON format only." 
          },
          { 
            role: "user", 
            content: `Resume Text: ${resumeText}\nDesired Role: ${desiredRole}\n\nStrict JSON Format:\n{\n  "fullName": "...",\n  "spamAnalysis": { "isJunk": boolean, "reason": "why is this junk or blank" },\n  "skills": {\n    "technical": ["Deep Tech 1", "..."],\n    "tools": ["Tool 1", "..."],\n    "soft": ["Implicit Skill 1", "..."]\n  },\n  "experienceYears": number,\n  "atsScore": {\n    "total": 0-100,\n    "breakdown": { "formatting": 0-100, "keywords": 0-100, "impact": 0-100 }\n  },\n  "executiveSummary": "1-sentence high-impact pitch",\n  "topStrengths": ["Strength 1", "..."]\n}` 
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    const tokensUsed = data.usage?.total_tokens || 0;
    const model = data.model || "llama-3.1-8b-instant";
    
    // Log token usage async
    import('./analyticsService').then(m => m.logTokenUsage('system', model, tokensUsed)).catch(console.error);

    const result = JSON.parse(data.choices[0].message.content);
    return result;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze resume with AI. Check API Key and format.");
  }
};

export const saveUserSkills = async (userId, analysis, resumeUrl, resumeText = "", resumeName = "Primary") => {
  const docRef = doc(db, 'userSkills', userId);
  const docSnap = await getDoc(docRef);
  
  const newResume = {
    id: Date.now().toString(),
    name: resumeName,
    url: resumeUrl,
    text: resumeText,
    analysis,
    timestamp: new Date().toISOString()
  };

  let resumes = [];
  if (docSnap.exists()) {
    resumes = docSnap.data().resumes || [];
  }
  
  resumes.push(newResume);

  const data = {
    ...analysis,
    resumeUrl,
    resumeText,
    resumes,
    activeResumeId: newResume.id,
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, data);
  return data;
};

export const setActiveResume = async (userId, resumeId) => {
  const docRef = doc(db, 'userSkills', userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const data = docSnap.data();
  const selected = data.resumes.find(r => r.id === resumeId);
  if (!selected) return;

  await setDoc(docRef, {
    ...data,
    ...selected.analysis,
    resumeUrl: selected.url,
    resumeText: selected.text,
    activeResumeId: resumeId,
    updatedAt: new Date().toISOString()
  });
};

export const deleteResumeFromPortfolio = async (userId, resumeId) => {
  const docRef = doc(db, 'userSkills', userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const data = docSnap.data();
  const updatedResumes = data.resumes.filter(r => r.id !== resumeId);
  
  await setDoc(docRef, { ...data, resumes: updatedResumes });
};

export const getUserSkills = async (userId) => {
  const docRef = doc(db, 'userSkills', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateResumeText = async (userId, newText) => {
  const docRef = doc(db, 'userSkills', userId);
  await setDoc(docRef, { 
    resumeText: newText,
    updatedAt: new Date().toISOString() 
  }, { merge: true });
};

export const updateResumeAnalysis = async (userId, newAnalysis) => {
  const docRef = doc(db, 'userSkills', userId);
  await setDoc(docRef, { 
    ...newAnalysis,
    updatedAt: new Date().toISOString() 
  }, { merge: true });
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
    const saved = await timeout(saveUserSkills(userId, analysis, webUrl, text), 5000, "Firestore database save timed out. Database rules might be blocking.");
    
    // Also update the user's main profile with the desired role
    try {
      const { updateUserProfile } = await import('./userService');
      await updateUserProfile(userId, { desiredRole });
    } catch (profileErr) {
      console.warn("Failed to update desiredRole in user profile:", profileErr.message);
    }
    
    return { upload: { webUrl }, analysis, saved };
  } catch (err) {
    console.error("Pipeline Error:", err);
    throw err;
  }
};
