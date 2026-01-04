import jwt from "jsonwebtoken";
import { getEffectiveTier } from "./accessControl.js";

export function getUserTierServer(req) {
  const { auth_token } = req.cookies || {};

  if (!auth_token) {
    return {
      isLoggedIn: false,
      paidMember: false,
      tier: "Free",
      user: null,
      id: null
    };
  }

  try {
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);

    const paidTiers = ["Backer", "Insider", "Founder"];
    const tier = getEffectiveTier({ name: decoded.name, baseTier: decoded.tier });
    const isPaid = paidTiers.includes(tier);

    return {
      isLoggedIn: true,
      paidMember: isPaid,
      tier,
      user: { fullName: decoded.name },
      id: decoded.patreonId
    };

  } catch (err) {
    return {
      isLoggedIn: false,
      paidMember: false,
      tier: "Free",
      user: null,
      id: null
    };
  }
}
