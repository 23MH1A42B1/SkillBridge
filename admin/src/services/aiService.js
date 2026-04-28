const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function chatWithAdminData(prompt, statsContext) {
  if (!GROQ_API_KEY) throw new Error("Missing VITE_GROQ_API_KEY in admin/.env");

  const systemMessage = `
You are the SkillBridge Admin AI Assistant. You help the platform administrator understand their data and manage the platform.
You are professional, concise, and highly insightful.

CURRENT PLATFORM STATS CONTEXT:
${JSON.stringify(statsContext, null, 2)}

Answer the admin's question based strictly on this data when relevant. If they ask about something not in the data, just answer normally but remind them you only see the summary stats.
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
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Chat failed:", error);
    throw new Error("Failed to get response from AI. " + error.message);
  }
}

export async function generateEmailDraft(topic, statsContext) {
  if (!GROQ_API_KEY) throw new Error("Missing VITE_GROQ_API_KEY in admin/.env");

  const systemMessage = `
You are an expert tech newsletter and professional email copywriter working for SkillBridge (an AI-powered career platform).
Your task is to draft an engaging, professional, and visually appealing broadcast email to be sent to all users.
Use markdown formatting (bold, bullet points) if appropriate.
Do NOT include generic placeholders like "[Your Name]". Sign off as "The SkillBridge Team".

Current Platform Stats (for context if needed):
${JSON.stringify(statsContext, null, 2)}
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
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Write a broadcast email about: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Email Generation failed:", error);
    throw new Error("Failed to generate email draft. " + error.message);
  }
}
