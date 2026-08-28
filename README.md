# Home Mart Frontend (Next.js 16)

Storefront on **Vercel**. API on **Render**. See [`../DEPLOY.md`](../DEPLOY.md) for the full Vercel + Render checklist.

## Quick Vercel env (production)

```
BACKEND_URL=https://home-mart-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Home Mart
```

Firebase (Google / Apple sign-in) is configured in `src/config.ts` — no Firebase env vars on Vercel.

Do **not** set `NEXT_PUBLIC_API_URL` unless you want direct CORS to Render.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5199` in `.env.local`. Start backend on `:5199` first.
