const TIER_ORDER = {
  Free: 0,
  Backer: 1,
  Insider: 2,
  Founder: 3,
};

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function parseEnvList(value) {
  if (!value) return new Set();
  return new Set(
    String(value)
      .split(/[,\n]/g)
      .map((item) => normalizeName(item))
      .filter(Boolean)
  );
}

function maxTier(a, b) {
  const aOrder = TIER_ORDER[a] ?? -1;
  const bOrder = TIER_ORDER[b] ?? -1;
  return aOrder >= bOrder ? a : b;
}

/**
 * Applies server-side access overrides controlled by env vars.
 *
 * Env vars:
 * - DEVELOPER_NAME: exact Patreon `full_name` to force "Founder"
 * - INSIDER_WHITELIST: comma/newline-separated names to grant at least "Insider"
 */
export function getEffectiveTier({ name, baseTier }) {
  const normalizedUserName = normalizeName(name);
  let tier = baseTier || "Free";

  const developerName = normalizeName(process.env.DEVELOPER_NAME);
  if (developerName && normalizedUserName === developerName) {
    return "Founder";
  }

  const insiderWhitelist = parseEnvList(process.env.INSIDER_WHITELIST);
  if (insiderWhitelist.has(normalizedUserName)) {
    tier = maxTier(tier, "Insider");
  }

  return tier;
}

