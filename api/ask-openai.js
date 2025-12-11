import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, model, max_tokens } = body;

    const aiModel = model || "gpt-5-mini";
    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);

    console.log("Messages received for OpenAI:", messages);

    // Convert messages[] → input[]
    const input = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await client.responses.create({
      model: aiModel,
      input,
      max_output_tokens: safeMaxTokens
    });

    console.log("OpenAI Response:", response);

    const text = response.output_text || "";

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ text });

  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: err.message });
  }
}