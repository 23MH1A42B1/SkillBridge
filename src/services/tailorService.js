const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const generateResumeTailoring = async (resumeText, jobDescription) => {
  if (!GROQ_API_KEY) {
    throw new Error("Missing AI API Key for resume tailoring.");
  }

  const prompt = `
You are an expert ATS Optimization specialist. 
Analyze the following Resume and Job Description. Identify 4-5 key bullet points in the resume that can be improved to better align with the job's high-priority keywords and requirements.

You MUST format your response as a strictly valid JSON object. Do NOT include markdown code blocks.
Structure:
{
  "suggestions": [
     {
       "original": "The original bullet point from the resume...",
       "optimized": "The improved, keyword-rich version...",
       "reason": "Short explanation of why this change helps (e.g. 'Highlighted experience with Kubernetes')"
     }
  ],
  "overallStrategy": "A 2-sentence strategy for the candidate (e.g. 'Focus more on your cloud architecture projects')."
}

Resume:
${resumeText}

Job Description:
${jobDescription}
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

    if (!response.ok) throw new Error("Tailoring API error");
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Resume tailoring failed:", error);
    throw new Error("Failed to generate AI tailoring suggestions.");
  }
};
