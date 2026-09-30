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

export { requestOpenAI, OPENAI_MODEL };
