// api/auth/callback.js — Exchanges auth code for tokens
// After authorizing, this page shows your refresh token

module.exports = async (req, res) => {
    const { code } = req.query;
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const VERCEL_URL = process.env.VERCEL_URL || req.headers.host;
    const protocol = VERCEL_URL?.includes('localhost') ? 'http' : 'https';
    const redirect_uri = `${protocol}://${VERCEL_URL}/api/auth/callback`;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        return res.status(500).send('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars');
    }

    try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri
            })
        });

        const data = await tokenRes.json();

        if (data.error) {
            return res.status(400).send(`Spotify error: ${data.error_description || data.error}`);
        }

        // Show the refresh token to the user
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Spotify Auth Complete</title></head>
            <body style="font-family: system-ui; max-width: 600px; margin: 60px auto; padding: 20px; line-height: 1.6;">
                <h1>✅ Authorization Successful!</h1>
                <p>Copy the refresh token below and add it to your Vercel environment variables:</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; border: 1px solid #ddd;">
                    ${data.refresh_token}
                </div>
                <p style="margin-top: 24px;">
                    <strong>Next steps:</strong><br>
                    1. Copy the token above<br>
                    2. Go to your Vercel project → Settings → Environment Variables<br>
                    3. Add <code>SPOTIFY_REFRESH_TOKEN</code> with the value above<br>
                    4. Redeploy your project
                </p>
                <p style="color: #888; font-size: 13px;">
                    You can close this page. The access token expires in 1 hour but your 
                    serverless function auto-refreshes it using this refresh token.
                </p>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
};
