import jwt from "jsonwebtoken";
import { getEffectiveTier } from "./accessControl.js";
import { revalidateSession } from "./patreonSession.js";

export async function getUserTierServer(req, res) {
  const { auth_token } = req.cookies || {};

  if (!auth_token) {
    return {
      isLoggedIn: false,
      paidMember: false,
      tier: "Free",
      whitelisted: false,
      user: null,
      id: null
    };
  }

  try {
    const decoded = await revalidateSession(jwt.verify(auth_token, process.env.JWT_SECRET), res);

    const paidTiers = ["Backer", "Insider", "Founder"];
    const { tier, whitelisted } = getEffectiveTier({ name: decoded.name, baseTier: decoded.tier });
    const isPaid = paidTiers.includes(tier);

    return {
      isLoggedIn: true,
      paidMember: isPaid,
      tier,
      whitelisted,
      user: { fullName: decoded.name },
      id: decoded.patreonId
    };

  } catch (err) {
    return {
      isLoggedIn: false,
      paidMember: false,
      tier: "Free",
      whitelisted: false,
      user: null,
      id: null
    };
  }
}
