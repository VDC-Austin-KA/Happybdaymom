# momsbday.ackerworks.com

An animated gospel-rock birthday concert for Diana Acker. Static site in `public/`, served as a Cloudflare Worker with static assets.

Deploy: `python3 build.py && npx wrangler deploy` (needs `CLOUDFLARE_API_TOKEN`; the `ackerworks.com` zone must be in the same account).
