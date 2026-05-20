import OpenAI from "openai";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function requestOpenAI(messages, maxTokens) {
  const input = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input,
    max_output_tokens: maxTokens,
    reasoning: { effort: "low" }
  });

  return response.output_text || "";
}

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, max_tokens } = body;
    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);

    const text = await requestOpenAI(messages, safeMaxTokens);

    return res.status(200).json({
      text,
      model: OPENAI_MODEL
    });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export { requestOpenAI, OPENAI_MODEL };
