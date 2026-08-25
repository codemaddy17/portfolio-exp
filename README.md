# [maddymadhav.in](https://maddymadhav.in)

My personal portfolio. Single-page, no frameworks, no build step — just HTML, CSS, and vanilla JS.

**Live:** [maddymadhav.in](https://maddymadhav.in) (DNS propagating) | [portfolio-exp-mocha.vercel.app](https://portfolio-exp-mocha.vercel.app)

## What's on it

- Hero with my photo and location
- Work experience (Google Student Ambassador, Research Intern, Student Intern)
- Projects (Muzer, Nexis, Samadhan, and more)
- Real-time Spotify "Now Playing" widget
- Instagram photo embeds from [@maddywithalens](https://instagram.com/maddywithalens)
- Skills, education, and contact

## Tech

- **Frontend:** HTML + CSS + vanilla JS (no React, no Tailwind, no frameworks)
- **Backend:** Vercel serverless functions (for Spotify API proxy)
- **Hosting:** Vercel

## Spotify Now Playing

The music section shows what I'm currently listening to via the Spotify API.

### Setup

1. Create a Spotify app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Set redirect URI to `https://YOUR_VERCEL_URL/api/auth/callback`
3. Add environment variables in Vercel:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Visit `https://YOUR_VERCEL_URL/api/auth/authorize` to get a refresh token
5. Add `SPOTIFY_REFRESH_TOKEN` to Vercel env vars
6. Redeploy

## Running locally

```bash
# Just open index.html in a browser
open index.html
```

No build step needed. The Spotify features only work when deployed on Vercel.

## License

Do whatever you want with it. It's my portfolio, not a library.
