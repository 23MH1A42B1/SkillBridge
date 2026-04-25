import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getPersona } from '../data/personas';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateInterviewQuestions = async (jobTitle, company, jobDescription, userSkills = [], personaId = 'mentor') => {
  const persona = getPersona(personaId);
  if (!GROQ_API_KEY) {
    throw new Error("Missing VITE_GROQ_API_KEY for interview prep.");
  }

  const prompt = `
${persona.promptMod}

Generate a set of high-quality interview questions for a candidate applying for the position of "${jobTitle}" at "${company}".

The candidate has the following skills: ${userSkills.join(', ')}.
Job Details: ${jobDescription}

You MUST format your response as a strictly valid JSON object. Do NOT include markdown code blocks or any other text.
Structure:
{
  "behavioral": [
    { "question": "Question text...", "expectedFocus": "What to look for in the answer..." }
  ],
  "technical": [
    { "question": "Question text...", "expectedFocus": "Technical concepts to cover..." }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Generate 5 behavioral and 5 technical questions.
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
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Failed to generate interview questions:", error);
    throw new Error("AI Interview Prep failed. Please try again.");
  }
};

export const saveInterviewPrep = async (userId, jobId, questions) => {
  await setDoc(doc(db, 'interviewPrep', `${userId}_${jobId}`), {
    userId,
    jobId,
    questions,
    generatedAt: new Date().toISOString()
  });
};

export const getInterviewPrep = async (userId, jobId) => {
  const docSnap = await getDoc(doc(db, 'interviewPrep', `${userId}_${jobId}`));
  return docSnap.exists() ? docSnap.data().questions : null;
};

/**
 * Save the result of a mock interview session for a user.
 */
export const saveInterviewSession = async (userId, jobTitle, question, answer, feedback) => {
  try {
    await addDoc(collection(db, 'interviewSessions'), {
      userId,
      jobTitle,
      question,
      answer,
      score: feedback.score * 10, // store as 0-100
      feedback: feedback.feedback,
      improvement: feedback.improvement,
      completedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not save interview session:', err);
  }
};

/**
 * Retrieve the most recent interview sessions for a user.
 * Used by the Career Report page.
 */
export const getInterviewSessions = async (userId, maxResults = 10) => {
  try {
    const q = query(
      collection(db, 'interviewSessions'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch interview sessions:', err);
    return [];
  }
};

export const evaluateMockAnswer = async (question, answer, jobTitle, personaId = 'mentor', chatHistory = []) => {
  const persona = getPersona(personaId);
  if (!GROQ_API_KEY) throw new Error("Missing API Key");

  const prompt = `
${persona.promptMod}

Act as an Elite Technical Interviewer. Evaluate the candidate's LATEST answer for the role of ${jobTitle}.
Use the provided chat history for context, but focus your evaluation on the latest response.

Interview Context:
${chatHistory.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`).join('\n')}

Latest Question: ${question}
Candidate's Latest Response: ${answer}

Focus on:
1. Technical depth and accuracy.
2. Structure (STAR method).
3. Confidence and Executive Presence.
4. Professional vocabulary usage.

You MUST format your ONLY response as a strictly valid JSON object.
Structure:
{
  "score": 0-10,
  "feedback": "Deep, strategically focused feedback...",
  "improvement": "One high-value actionable improvement tip...",
  "suggestedFollowUp": "A specific follow-up question based on their answer"
}
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
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error(err);
    return { score: 7, feedback: "A good start, but try to be more concise.", improvement: "Focus on the 'STAR' method." };
  }
};
