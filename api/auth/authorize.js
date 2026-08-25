// api/auth/authorize.js — Redirects to Spotify OAuth page
// Visit this URL once to authorize and get your refresh token

module.exports = async (req, res) => {
    const { SPOTIFY_CLIENT_ID } = process.env;
    const VERCEL_URL = process.env.VERCEL_URL || req.headers.host;
    const protocol = VERCEL_URL?.includes('localhost') ? 'http' : 'https';
    const redirect_uri = `${protocol}://${VERCEL_URL}/api/auth/callback`;

    if (!SPOTIFY_CLIENT_ID) {
        return res.status(500).send('Missing SPOTIFY_CLIENT_ID env var');
    }

    const scopes = [
        'user-read-currently-playing',
        'user-read-recently-played'
    ].join(' ');

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri,
        scope: scopes,
        show_dialog: 'true'
    });

    res.redirect(302, `https://accounts.spotify.com/authorize?${params.toString()}`);
};
