import OpenAI from "openai";
import { getUserTierServer } from "../lib/getUserTierServer.js";
import { getDailyLimitForTier } from "../lib/rateLimits.js";
import { redis } from "../lib/redis.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_ROLES = new Set(["user", "assistant", "system"]);
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 30000;

export default async function handler(req, res) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { messages, max_tokens } = body;

    // 0️⃣ Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }
    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: "Too many messages" });
    }
    for (const m of messages) {
      if (!m || typeof m.content !== "string") {
        return res.status(400).json({ error: "Each message must have a string content" });
      }
      if (!ALLOWED_ROLES.has(m.role)) {
        return res.status(400).json({ error: "Invalid message role" });
      }
      if (m.content.length > MAX_CONTENT_LENGTH) {
        return res.status(400).json({ error: "Message content too long" });
      }
    }

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

    // 4️⃣ Atomic increment + rate limit check
    const used = Number(await redis.incr(redisKey)) || 1;
    await redis.expire(redisKey, 60 * 60 * 24);

    if (used > limit) {
      return res.status(429).json({
        error: "Daily limit reached",
      });
    }

    // 5️⃣ OpenAI
    let aiModel = "gpt-5-mini";
    if (tier === "Backer") {
      aiModel = "gpt-5-nano";
    }
    else if (tier === "Insider") {
      const firstHalfLimit = Math.ceil(limit / 2);
      aiModel = used <= firstHalfLimit ? "gpt-5-mini" : "gpt-5-nano";
    }
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
      used,
      limit
    });

  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
