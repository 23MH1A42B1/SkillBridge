const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("NO API KEY FOUND in .env!");
  process.exit(1);
}

const prompt = "Please reply with a valid JSON object: {\"status\": \"ok\"}";

async function testGroq() {
  console.log("Testing Groq API...");
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
      console.error("Groq API Error:", err);
      process.exit(1);
    }

    const data = await response.json();
    console.log("Success! Response from Groq:");
    console.log(data.choices[0].message.content);
  } catch (error) {
    console.error("Fetch failed (Possible CORS or networking issue if in browser, but here it is:", error);
  }
}

testGroq();
