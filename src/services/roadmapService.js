import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateLearningRoadmap = async (missingSkills = [], jobTitle) => {
  if (!GROQ_API_KEY) {
    throw new Error("Missing AI API Key for roadmap generation.");
  }
  if (missingSkills.length === 0) {
    return { steps: [{ title: "You're Ready!", description: "You already have all the required skills for this role. Focus on practicing your behavioral interview questions.", resources: [] }] };
  }

  const prompt = `
You are a career coach. A candidate wants to become a "${jobTitle}" but is missing these specific skills: ${missingSkills.join(', ')}.

Create a structured, step-by-step learning roadmap to master these skills efficiently.
Format your response as a strictly valid JSON object. Do NOT include markdown code blocks.
Structure:
{
  "summary": "Short encouraging summary...",
  "steps": [
    {
      "title": "Master [Skill Name]",
      "description": "What specifically to learn...",
      "estimatedTime": "e.g. 1-2 weeks",
      "resources": [
        { "name": "Recommended Resource", "type": "Video/Docs/Course", "searchUrl": "https://www.youtube.com/results?search_query=..." }
      ]
    }
  ]
}

Provide 1-2 clear steps for EVERY missing skill.
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
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error("Roadmap API error");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    throw new Error("Failed to generate AI Roadmap.");
  }
};

export const saveRoadmap = async (userId, jobId, roadmap) => {
  await setDoc(doc(db, 'roadmaps', `${userId}_${jobId}`), {
    userId,
    jobId,
    roadmap,
    updatedAt: new Date().toISOString()
  });
};

export const getRoadmap = async (userId, jobId) => {
  const docSnap = await getDoc(doc(db, 'roadmaps', `${userId}_${jobId}`));
  return docSnap.exists() ? docSnap.data().roadmap : null;
};
