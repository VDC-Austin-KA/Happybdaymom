# momsbday.ackerworks.com

An animated gospel-rock birthday concert for Diana Acker. Static site in `public/`, served as a Cloudflare Worker with static assets.

Deploy: `(cd song-worker && npx wrangler deploy)` once, then `python3 build.py && npx wrangler deploy` (needs `CLOUDFLARE_API_TOKEN`). The song (first 3:45, AAC) is served by the separate `momsbday-song` Worker; lyric timings in `public/timing.js` came from a Whisper transcription.
