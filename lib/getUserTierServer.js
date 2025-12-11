import jwt from "jsonwebtoken";

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
    let tier = decoded.tier;
    const isPaid = paidTiers.includes(tier);

    // Developer override
    if (decoded.name === "Ignacio") tier = "Founder";

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
