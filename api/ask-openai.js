import OpenAI from "openai";
import { getUserTierServer } from "../lib/getUserTierServer.js";
import { getDailyLimitForTier } from "../lib/rateLimits.js";
import { redis } from "../lib/redis.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { messages, model, max_tokens } = body;

    // 1️⃣ Auth
    const user = getUserTierServer(req);
    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const tier = user.tier;
    const userId = user.id;

    // 2️⃣ Limit desde ENV
    const limit = getDailyLimitForTier(tier);

    // 3️⃣ Redis key
    const today = new Date().toISOString().slice(0, 10);
    const redisKey = `ratelimit:${userId}:${today}`;

    let used = Number(await redis.get(redisKey)) || 0;

    // 4️⃣ Rate limit
    if (used >= limit) {
      return res.status(429).json({
        error: "Daily limit reached",
      });
    }

    // 5️⃣ Incremento
    await redis.incr(redisKey);
    await redis.expire(redisKey, 60 * 60 * 24);

    // 6️⃣ OpenAI
    const aiModel = model || "gpt-5-mini";
    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);

    const input = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await client.responses.create({
      model: aiModel,
      input,
      max_output_tokens: safeMaxTokens,
      reasoning: {"effort": "low"}
    });

    const text = response.output_text || "";

    return res.status(200).json({
      text,
      used: used + 1,
      limit
    });

  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
