import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import crypto from "crypto";

const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const PATREON_IDENTITY_URL =
  "https://www.patreon.com/api/oauth2/v2/identity?include=memberships.currently_entitled_tiers&fields%5Buser%5D=full_name,thumb_url&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents&fields%5Btier%5D=title";

const TIER_IDS = ["25157070", "25124139", "25132338"];
const TIER_ORDER = { None: 0, Free: 0, Backer: 1, Insider: 2, Founder: 3 };

const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;
// How often the membership is re-checked against Patreon.
const REVALIDATE_MS = 24 * 60 * 60 * 1000;
// If Patreon cannot be reached, keep the last known tier for this long.
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
// Minimum time between failed refresh attempts.
const RETRY_MS = 10 * 60 * 1000;

function encryptionKey() {
  return crypto.createHash("sha256").update(`patreon-rt:${process.env.JWT_SECRET}`).digest();
}

export function encryptToken(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function decryptToken(blob) {
  const buf = Buffer.from(blob, "base64url");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

/** Fetches the user's identity and active paid tier from Patreon. */
export async function fetchPatreonIdentity(accessToken) {
  const response = await fetch(PATREON_IDENTITY_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error("Failed to fetch identity");
    err.status = response.status;
    err.details = data;
    throw err;
  }

  let isMember = false;
  let amountCents = 0;
  let tierName = "None";

  for (const item of data.included || []) {
    if (item.type === "member" && item.attributes.patron_status === "active_patron") {
      isMember = true;
      amountCents = item.attributes.currently_entitled_amount_cents;
    }
    if (item.type === "tier" && TIER_IDS.includes(item.id)) {
      if (TIER_ORDER[item.attributes.title] > TIER_ORDER[tierName]) {
        tierName = item.attributes.title;
      }
    }
  }

  return {
    patreonId: data.data.id,
    fullName: data.data.attributes?.full_name || "",
    thumbUrl: data.data.attributes?.thumb_url,
    isMember,
    amountCents,
    baseTier: isMember ? tierName : "Free",
  };
}

async function requestToken(params) {
  const { PATREON_CLIENT_ID, PATREON_CLIENT_SECRET } = process.env;
  const response = await fetch(PATREON_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: PATREON_CLIENT_ID,
      client_secret: PATREON_CLIENT_SECRET,
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export function exchangeCode(code) {
  return requestToken({
    code,
    grant_type: "authorization_code",
    redirect_uri: process.env.PATREON_REDIRECT_URI,
  });
}

export function signSession({ name, tier, patreonId, refreshToken, checkedAt = Date.now() }) {
  const payload = { name, tier, patreonId, checkedAt };
  if (refreshToken) payload.rt = encryptToken(refreshToken);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}

export function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_S,
      path: "/",
    })
  );
}

/**
 * Re-checks the membership against Patreon when the session is older than
 * REVALIDATE_MS, so cancellations/refunds are picked up without a new login.
 *
 * Returns the (possibly updated) session payload. When a new token had to be
 * issued, the cookie is rewritten on `res`.
 * Sessions issued before this feature have no refresh token and are left as is
 * until they expire or the user logs in again.
 */
export async function revalidateSession(decoded, res) {
  if (!decoded.rt) return decoded;

  const now = Date.now();
  const checkedAt = decoded.checkedAt || 0;
  if (now - checkedAt < REVALIDATE_MS) return decoded;
  if (decoded.lastTry && now - decoded.lastTry < RETRY_MS) return decoded;

  try {
    const refreshToken = decryptToken(decoded.rt);
    const tokens = await requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
    if (!tokens.ok) {
      const err = new Error("Refresh failed");
      err.status = tokens.status;
      throw err;
    }
    const identity = await fetchPatreonIdentity(tokens.data.access_token);
    const token = signSession({
      name: identity.fullName || decoded.name,
      tier: identity.baseTier,
      patreonId: identity.patreonId || decoded.patreonId,
      refreshToken: tokens.data.refresh_token || refreshToken,
    });
    if (res) setSessionCookie(res, token);
    return jwt.decode(token);
  } catch (err) {
    console.error("Patreon revalidation failed:", err.status || "", err.message);
    // Patreon unreachable or token rejected (it can also be rejected by a
    // concurrent request that already rotated it): keep the last known tier
    // during the grace period, then fall back to Free.
    const expired = now - checkedAt > GRACE_MS;
    const next = { ...decoded, tier: expired ? "Free" : decoded.tier, lastTry: now };
    if (res) {
      const { iat, exp, ...claims } = next;
      setSessionCookie(res, jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: "30d" }));
    }
    return next;
  }
}
