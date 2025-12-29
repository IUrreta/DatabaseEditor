import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { getEffectiveTier } from '../../../lib/accessControl.js';

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
        const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: PATREON_CLIENT_ID,
                client_secret: PATREON_CLIENT_SECRET,
                redirect_uri: PATREON_REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token exchange failed:', tokenData);
            return res.status(tokenResponse.status).json({ error: 'Failed to exchange token', details: tokenData });
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch user identity and memberships
        // Using API v2
        const identityResponse = await fetch('https://www.patreon.com/api/oauth2/v2/identity?include=memberships.currently_entitled_tiers&fields%5Buser%5D=full_name,thumb_url&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents&fields%5Btier%5D=title', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const identityData = await identityResponse.json();

        if (!identityResponse.ok) {
            console.error('Identity fetch failed:', identityData);
            return res.status(identityResponse.status).json({ error: 'Failed to fetch identity', details: identityData });
        }

        // 3. Parse membership data to find tier
        const memberships = identityData.included || [];
        let isMember = false;
        let tier = 'Free';
        let amountCents = 0;
        let tierName = 'None';

        const tierIDs = ["25157070", "25124139", "25132338"];
        const paidTiers = ["Backer", "Insider", "Founder"];
        const patronStatusOrder = {
            "None": 0,
            "Free": 0,
            "Backer": 1,
            "Insider": 2,
            "Founder": 3
        };

        // Logic to determine tier based on memberships
        for (const item of memberships) {
            if (item.type === 'member' && item.attributes.patron_status === 'active_patron') {
                isMember = true;
                amountCents = item.attributes.currently_entitled_amount_cents;
            }
            if (item.type === 'tier' && tierIDs.includes(item.id)) {
                //get the highest, order is backer -> insider -> founder
                if (patronStatusOrder[item.attributes.title] > patronStatusOrder[tierName]) {
                    tierName = item.attributes.title;
                }
            }
        }

        if (isMember) {
            tier = tierName;
        }

        const fullName = identityData?.data?.attributes?.full_name || "";
        const baseTier = tier;
        const effectiveTier = getEffectiveTier({ name: fullName, baseTier });
        const isPaid = paidTiers.includes(effectiveTier);

        const patreonUser = {
            name: fullName,
            thumbUrl: identityData.data.attributes.thumb_url,
            isMember,
            amountCents,
            tier: effectiveTier,
        };

        const token = jwt.sign(
            {
                name: patreonUser.name,
                tier: baseTier,
                patreonId: identityData.data.id
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const serializedCookie = serialize('auth_token', token, {
            httpOnly: true,  // VITAL: Browser JS cannot read this
            secure: process.env.NODE_ENV === 'production', // HTTPS only
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        });

        res.setHeader('Set-Cookie', serializedCookie);

        return res.status(200).json({
            success: true,
            user: { fullName: patreonUser.name },
            tier: patreonUser.tier,
            isLoggedIn: true,
            paidMember: isPaid
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
