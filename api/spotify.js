// api/spotify.js — Vercel Serverless Function
// Returns the currently playing track from Spotify

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        return res.status(500).json({
            error: 'Missing Spotify credentials. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN in Vercel environment variables.'
        });
    }

    try {
        // Step 1: Get access token using refresh token
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: SPOTIFY_REFRESH_TOKEN
            })
        });

        if (!tokenRes.ok) {
            return res.status(401).json({ error: 'Failed to refresh Spotify token' });
        }

        const { access_token } = await tokenRes.json();

        // Step 2: Get currently playing
        const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        // 204 = nothing playing
        if (nowRes.status === 204) {
            // Fallback: get recently played
            const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });

            if (recentRes.ok) {
                const recent = await recentRes.json();
                if (recent.items && recent.items.length > 0) {
                    const item = recent.items[0].track;
                    return res.status(200).json({
                        is_playing: false,
                        track: {
                            name: item.name,
                            artist: item.artists.map(a => a.name).join(', '),
                            album: item.album.name,
                            album_art: item.album.images[0]?.url,
                            url: item.external_urls.spotify,
                            duration_ms: item.duration_ms,
                            progress_ms: recent.items[0].played_at ? Date.now() - new Date(recent.items[0].played_at).getTime() : 0
                        }
                    });
                }
            }

            return res.status(200).json({ is_playing: false, track: null });
        }

        if (!nowRes.ok) {
            return res.status(nowRes.status).json({ error: 'Failed to fetch currently playing' });
        }

        const data = await nowRes.json();

        if (!data || !data.item) {
            return res.status(200).json({ is_playing: false, track: null });
        }

        return res.status(200).json({
            is_playing: data.is_playing,
            track: {
                name: data.item.name,
                artist: data.item.artists.map(a => a.name).join(', '),
                album: data.item.album.name,
                album_art: data.item.album.images[0]?.url,
                url: data.item.external_urls.spotify,
                duration_ms: data.item.duration_ms,
                progress_ms: data.progress_ms
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
