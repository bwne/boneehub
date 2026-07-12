# BoneHub

A Roblox script archive with a password-protected admin panel. Built with
Next.js 14 (App Router), ready to deploy on Vercel.

## Features

- Home page: script cards (image, title, description), search box, a
  terminal-style code preview with a "copy" button
- `/admin`: password login, add new scripts (title, description, image URL,
  script code, tags), delete existing scripts
- Discord and YouTube links in the header/footer
- The admin password is checked **server-side only** (inside an API route)
  — it's never sent to the browser

## Local development

```bash
npm install
cp .env.example .env.local   # optionally change the password/secret
npm run dev
```

`http://localhost:3000` → the site, `http://localhost:3000/admin` → the panel.

Default admin password (used if the environment variable isn't set):
`R7!vQ2#Lm9@Xp4$Zn8^Kt1&Wc6*Hs3`

Locally, data is stored in `.data/scripts.json` (gitignored).

## Deploying to Vercel

1. Push this folder to a GitHub repo and import it into Vercel ("New Project").
2. Add these **Environment Variables**:
   - `ADMIN_PASSWORD` → your password of choice (if left unset, the fallback
     password baked into the code is used — set your own for production)
   - `SESSION_SECRET` → a long random string (`openssl rand -hex 32`)
3. **Persistent storage (important):** Vercel's serverless functions can't
   write to disk permanently, so the `.data/scripts.json` approach won't work
   in production. Add a free **Upstash Redis** integration from your
   project's **Storage** tab (Marketplace → Upstash Redis). Once connected,
   Vercel automatically sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` — the
   code detects and uses them automatically, no extra setup needed.
4. Deploy.

If you deploy without connecting Redis, the site still works and script
submissions will succeed (they're written to `/tmp` instead of crashing),
but they are **not truly persistent** — they can disappear on the next cold
start or redeploy. For scripts that actually stick around, connect Upstash
Redis as described above.

## Changing the password

The safest way is to set `ADMIN_PASSWORD` in Vercel's environment variables
— no code changes needed. You can also edit the `FALLBACK_PASSWORD` constant
in `app/api/login/route.ts`, but that value stays visible in your repo
history, so an environment variable is preferred.

## Discord / YouTube links

Edit the `DISCORD_URL` and `YOUTUBE_URL` constants at the top of
`app/layout.tsx`.
