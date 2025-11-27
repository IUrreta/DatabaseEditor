import { serialize } from 'cookie';

export default function handler(req, res) {
    const cookie = serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: -1,
    });

    res.setHeader('Set-Cookie', cookie);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
}