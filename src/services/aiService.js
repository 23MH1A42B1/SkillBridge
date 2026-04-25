import { logTokenUsage } from './analyticsService';
import { useAuth } from '../auth/AuthContext';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateLinkedInPost = async (userSkills) => {
  if (!GROQ_API_KEY) {
    throw new Error("Missing Groq API Key");
  }

  const prompt = `
    You are a professional LinkedIn branding expert. 
    Write a high-engagement, professional LinkedIn post for a candidate with the following skill profile:
    Full Name: ${userSkills.fullName || 'Candidate'}
    Top Technical Skills: ${userSkills.skills?.technical?.join(', ')}
    Soft Skills: ${userSkills.skills?.soft?.join(', ')}
    ATS Score: ${userSkills.atsScore?.total}%
    
    The post should:
    1. Sound confident and professional.
    2. Mention their key skills and high ATS readiness.
    3. Include 3-5 relevant hashtags.
    4. Have a clear call to action (e.g., "Open to new opportunities" or "Let's connect").
    5. Use line breaks for readability.
    
    Write only the post content.
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
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error("Groq API request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Log token usage if possible
    if (data.usage) {
      // In User Portal analyticsService, logTokenUsage expects (userId, model, tokensUsed)
      // Since we don't have userId easily here without passing it, we'll log as 'system' or 'anonymous'
      // or we can just skip it if we don't want to complicate the signature
      logTokenUsage('system', 'llama-3.1-8b-instant', data.usage.total_tokens);
    }

    return content;
  } catch (error) {
    console.error("LinkedIn post generation failed:", error);
    throw error;
  }
};
