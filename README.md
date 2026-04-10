# BlogFlow

Learning project: React + Vite frontend, Hono API on Cloudflare Workers, Prisma + PostgreSQL (Prisma Accelerate for pooled access from edge).

## Repo layout

- `backend/` — API (`wrangler`), Prisma schema, JWT routes
- `frontend/` — React app
- `common/` — shared Zod-style shapes (optional reference)

## Local setup

1. **Backend** — copy `backend/.env.example` → `backend/.env` (direct Postgres URL for Prisma CLI), copy `backend/.dev.vars.example` → `backend/.dev.vars` (Accelerate `prisma://` URL + `JWT_SECRET` for Wrangler). Then `npm install`, `npx prisma generate`, `npx prisma db push`, `npm run dev`.
2. **Frontend** — `npm install`, `npm run dev`. Optional: `frontend/.env.local` with `VITE_API_URL=http://127.0.0.1:8787`.

Do **not** commit `.env` or `.dev.vars`.

## Note

Runtime wiring for Prisma Edge + Workers + Accelerate can be finicky in local dev; the code is here for architecture review and learning—not guaranteed one-click deploy.
