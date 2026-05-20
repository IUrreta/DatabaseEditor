import { getUserTierServer } from "../lib/getUserTierServer.js";
import { getDailyLimitForTier } from "../lib/rateLimits.js";
import { redis } from "../lib/redis.js";
import { requestOpenAI } from "./ask-openai.js";
import { requestOpenRouter } from "./ask-openrouter.js";

function shouldUseOpenRouter(tier, used, limit) {
  const isBacker = tier === "Backer";
  const isSecondHalfInsider = tier === "Insider" && used >= Math.ceil(limit / 2);
  return isBacker || isSecondHalfInsider;
}

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, max_tokens } = body;

    const user = getUserTierServer(req);
    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const tier = user.tier;
    const userId = user.id;
    const limit = getDailyLimitForTier(tier);

    const today = new Date().toISOString().slice(0, 10);
    const redisKey = `ratelimit:${userId}:${today}`;

    const used = Number(await redis.get(redisKey)) || 0;

    if (used >= limit) {
      return res.status(429).json({ error: "Daily limit reached" });
    }

    await redis.incr(redisKey);
    await redis.expire(redisKey, 60 * 60 * 24);

    const safeMaxTokens = Math.min(max_tokens || 1500, 4000);
    // const useOpenRouter = shouldUseOpenRouter(tier, used, limit);
    const useOpenRouter = true;

    const text = useOpenRouter
      ? await requestOpenRouter(messages, safeMaxTokens)
      : await requestOpenAI(messages, safeMaxTokens);

    return res.status(200).json({
      text,
      used: used + 1,
      limit,
      provider: useOpenRouter ? "openrouter" : "openai"
    });
  } catch (err) {
    console.error("LLM orchestration error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export { shouldUseOpenRouter };
