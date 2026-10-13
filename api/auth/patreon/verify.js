import { getEffectiveTier } from '../../../lib/accessControl.js';
import { exchangeCode, fetchPatreonIdentity, signSession, setSessionCookie } from '../../../lib/patreonSession.js';

export default async function handler(req, res) {
    const { code } = req.query;
    const { PATREON_CLIENT_ID, PATREON_CLIENT_SECRET, PATREON_REDIRECT_URI } = process.env;

    if (!code) {
        return res.status(400).json({ error: 'Missing code parameter' });
    }

    if (!PATREON_CLIENT_ID || !PATREON_CLIENT_SECRET || !PATREON_REDIRECT_URI) {
        return res.status(500).json({ error: 'Missing Patreon environment variables' });
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await exchangeCode(code);

        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', tokenResponse.data);
            return res.status(tokenResponse.status).json({ error: 'Failed to exchange token', details: tokenResponse.data });
        }

        const { access_token: accessToken, refresh_token: refreshToken } = tokenResponse.data;

        // 2. Fetch user identity and memberships (API v2)
        let identity;
        try {
            identity = await fetchPatreonIdentity(accessToken);
        } catch (err) {
            console.error('Identity fetch failed:', err.details || err);
            return res.status(err.status || 500).json({ error: 'Failed to fetch identity', details: err.details });
        }

        const paidTiers = ["Backer", "Insider", "Founder"];
        const { isMember, amountCents, baseTier } = identity;

        const fullName = identity.fullName;
        const { tier: effectiveTier, whitelisted } = getEffectiveTier({ name: fullName, baseTier });
        const isPaid = paidTiers.includes(effectiveTier);
        const tierNumbers = {
            "Free": 0,
            "Backer": 1,
            "Insider": 2,
            "Founder": 3
        };

        const patreonUser = {
            name: fullName,
            thumbUrl: identity.thumbUrl,
            isMember,
            amountCents,
            tier: effectiveTier,
        };

        const token = signSession({
            name: patreonUser.name,
            tier: baseTier,
            patreonId: identity.patreonId,
            refreshToken,
        });
        setSessionCookie(res, token);

        return res.status(200).json({
            success: true,
            user: { fullName: patreonUser.name },
            tier: patreonUser.tier,
            tierNumber: tierNumbers[patreonUser.tier] ?? 0,
            whitelisted,
            isLoggedIn: true,
            paidMember: isPaid
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
