export function getDailyLimitForTier(tier) {
    console.log("Getting daily limit for tier:", tier);
  const limits = {
    Founder: Number(process.env.DAILY_LIMIT_FOUNDER),
    Insider: Number(process.env.DAILY_LIMIT_INSIDER),
    Backer: Number(process.env.DAILY_LIMIT_BACKER),
    Free: Number(process.env.DAILY_LIMIT_FREE),
  };

  return limits[tier] ?? limits.Free;
}