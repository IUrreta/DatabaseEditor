import jwt from 'jsonwebtoken';
import { getEffectiveTier } from '../lib/accessControl.js';

export default function handler(req, res) {
    // Vercel parses the cookie string automatically into req.cookies
    const { auth_token } = req.cookies;

    if (!auth_token) {
        return res.json({
            isLoggedIn: false,
            paidMember: false,
            tier: 'Free'
        });
    }

    try {
        // Verify the token signature
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);

        const paidTiers = ["Backer", "Insider", "Founder"];
        const tier = getEffectiveTier({ name: decoded.name, baseTier: decoded.tier });
        const isPaid = paidTiers.includes(tier);
        const tierNumbers = {
            "Free": 0,
            "Backer": 1,
            "Insider": 2,
            "Founder": 3
        }

        return res.json({
            isLoggedIn: true,
            paidMember: isPaid,
            tier: tier,
            tierNumber: tierNumbers[tier] ?? 0,
            user: { fullName: decoded.name },
        });

    } catch (err) {
        // Token is invalid or expired
        return res.json({
            isLoggedIn: false,
            paidMember: false,
            tier: 'Free'
        });
    }
}
