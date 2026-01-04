export function getDailyLimitForTier(tier) {
  const limits = {
    Founder: Number(process.env.DAILY_LIMIT_FOUNDER),
    Insider: Number(process.env.DAILY_LIMIT_INSIDER),
    Backer: Number(process.env.DAILY_LIMIT_BACKER),
    Free: Number(process.env.DAILY_LIMIT_FREE),
  };

  return limits[tier] ?? limits.Free;
}