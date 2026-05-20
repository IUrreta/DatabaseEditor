const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

async function requestOpenRouter(messages, maxTokens) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      max_tokens: maxTokens
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenRouter request failed");
  }

  return data?.choices?.[0]?.message?.content || "";
}

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, max_tokens } = body;
    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);

    const text = await requestOpenRouter(messages, safeMaxTokens);

    return res.status(200).json({
      text,
      model: OPENROUTER_MODEL
    });
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export { requestOpenRouter, OPENROUTER_MODEL };
