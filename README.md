# Home Mart Frontend (Next.js 16)

Storefront on **Vercel**. API on **Render**. See [`../DEPLOY.md`](../DEPLOY.md) for the full Vercel + Render checklist.

## Quick Vercel env (production)

```
BACKEND_URL=https://home-mart-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Home Mart
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Use `NEXT_PUBLIC_FIREBASE_*` in Vercel. Do **not** set `NEXT_PUBLIC_API_URL` unless you want direct CORS to Render.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5199` in `.env.local`. Start backend on `:5199` first.
