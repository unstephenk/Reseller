# Reseller

Personal phone-first reselling dashboard (books lane) with Supabase magic-link auth.

## Repo layout
- `apps/web` — React + Vite + Tailwind PWA-ish web app
- `packages/*` — reserved for shared code later

## Dev

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
# fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
pnpm dev
```

## Supabase
Auth: magic link.

Remember to allowlist your redirect URLs in Supabase:
- `http://localhost:5173/**`
- your deployed URL later
