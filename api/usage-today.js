import { getUserTierServer } from "../lib/getUserTierServer.js";
import { getDailyLimitForTier } from "../lib/rateLimits.js";
import { redis } from "../lib/redis.js";

export default async function handler(req, res) {
  try {
    const user = getUserTierServer(req);

    if (!user.isLoggedIn) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const userId = user.id;
    const tier = user.tier;
    const limit = getDailyLimitForTier(tier);

    const today = new Date().toISOString().slice(0, 10);
    const redisKey = `ratelimit:${userId}:${today}`;

    let used = await redis.get(redisKey);
    if (!used) used = 0;
    used = Number(used);

    const percentage = limit > 0
      ? Math.min(100, Math.round((used / limit) * 100))
      : 0;

    return res.status(200).json({
      used,
      limit,
      percentage
    });

  } catch (err) {
    console.error("Usage endpoint error:", err);
    return res.status(500).json({ error: err.message });
  }
}
