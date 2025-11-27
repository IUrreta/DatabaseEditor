export default function handler(req, res) {
    const { PATREON_CLIENT_ID, PATREON_REDIRECT_URI } = process.env;

    if (!PATREON_CLIENT_ID || !PATREON_REDIRECT_URI) {
        return res.status(500).json({ error: 'Missing Patreon environment variables' });
    }

    // Scopes: identity (profile), identity.memberships (campaign info)
    const scopes = 'identity identity.memberships';
    const redirectUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(PATREON_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;

    res.redirect(redirectUrl);
}
