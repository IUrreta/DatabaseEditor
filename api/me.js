import jwt from 'jsonwebtoken';

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

        // Determine if they are a paid member based on the tier name inside the token
        const paidTiers = ["Backer", "Insider", "Founder"]; // Adjust these names to match your Patreon exactly
        const isPaid = paidTiers.includes(decoded.tier);

        return res.json({
            isLoggedIn: true,
            paidMember: isPaid,
            tier: decoded.tier,
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