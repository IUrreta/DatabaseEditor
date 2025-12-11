import OpenAI from "openai";
import { getUserTierServer } from "../lib/getUserTierServer.js"
import { redis } from "../lib/redis";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DAILY LIMITS by tier
const DAILY_LIMITS = {
  Founder: 20,
  Insider: 20,
  Backer: 20,
  Free: 20 // ahora todos tienen 20
};

export default async function handler(req, res) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { messages, model, max_tokens } = body;

    // 1️⃣  Leer tier del usuario desde cookie (server-side)
    const user = getUserTierServer(req);

    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const tier = user.tier;
    const userId = user.id; // <-- ahora sí existe gracias a patreonId en JWT
    const limit = DAILY_LIMITS[tier];

    // 2️⃣  Construir key del rate-limit
    const today = new Date().toISOString().slice(0, 10);
    const redisKey = `ratelimit:${userId}:${today}`;

    let used = await redis.get(redisKey);
    if (!used) used = 0;

    // 3️⃣  Comprobar rate limit
    if (used >= limit) {
      return res.status(429).json({
        error: `Daily limit reached (${used}/${limit})`,
        used,
        limit
      });
    }

    // 4️⃣  Incrementar contador
    await redis.incr(redisKey);
    await redis.expire(redisKey, 60 * 60 * 24); // expira en 24h

    // 5️⃣  Llamada a OpenAI (Responses API)
    const aiModel = model || "gpt-5-mini";
    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);

    const input = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    const response = await client.responses.create({
      model: aiModel,
      input,
      max_output_tokens: safeMaxTokens
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
