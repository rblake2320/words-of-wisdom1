# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What This Is

Words of Wisdom — a daily quote platform built from James Dumoulin's *School of Hard Knocks* YouTube channel (559 quotes from 728 videos). Built as a branded partnership pitch. Live at words-of-wisdom.manus.space.

## Commands

```bash
pnpm install          # pnpm only (packageManager pinned); npm/yarn will fight the lockfile
pnpm dev              # tsx watch server/_core/index.ts (Vite dev middleware mounted by Express)
pnpm check            # tsc --noEmit — run before committing
pnpm test             # vitest run (12 tests, server/*.test.ts)
pnpm build            # vite build + esbuild server bundle → dist/
pnpm db:push          # drizzle-kit generate && migrate
```

On Windows, `pnpm dev`/`pnpm build` need a POSIX shell (Git Bash) — scripts use inline `NODE_ENV=...` env assignment.

## Architecture

Single Express server serves both the tRPC API (`/api/trpc`) and the client (Vite middleware in dev, static `dist/` in prod).

- `server/routers.ts` — all tRPC procedures (`appRouter`). Procedure tiers: `publicProcedure` → `protectedProcedure` (logged in) → `adminProcedure` (role === "admin").
- `server/db.ts` — all Drizzle query helpers. Every helper null-checks `getDb()` and degrades gracefully (returns empty/null) when `DATABASE_URL` is unset — the app boots without a DB.
- `server/aiRouter.ts` — AI Adviser chat via Groq (`llama-3.1-8b-instant`). Returns a canned placeholder string when `GROQ_API_KEY` is unset.
- `server/quoteIndex.ts` — in-memory keyword search over the **static seed data** (not the live DB). Quotes added via the admin panel do NOT appear in AI Adviser grounding.
- `server/seedData.ts` + `server/shortsSeedData.ts` — the 169 + 390 quote corpus. `runSeed()` auto-runs on server import; guarded by the `seeded_flag` table.
- `server/_core/` — Manus platform scaffolding (OAuth, cookies, notification, storage, Vite glue). Treat as vendored: avoid editing unless the task is specifically about it.
- `client/src/pages/` — wouter routes registered in `client/src/App.tsx`.
- `drizzle/schema.ts` — users, speakers, quotes, favorites, subscriptions, seeded_flag (MySQL/TiDB).
- `shared/` — constants and types used by both sides.

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

## Conventions & Gotchas

- **Named exports for components** — e.g. `AIChatBox` is a named export; a default import compiles silently in the editor but breaks `pnpm check` and `vite build`. Always run `pnpm check` before committing client changes.
- **Manus platform coupling** — auth (Manus OAuth), owner notifications, and env injection (`DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_*`) all assume the Manus runtime. Standalone runs need these set manually in `.env`; login will not work outside Manus.
- **No CI runs on GitHub** — the README badge references `.github/workflows/ci.yml`, but the workflow file is absent (pushing it requires a token with `workflow` scope). Local `pnpm check && pnpm test` is the gate.
- **Live stats rule** — all counts shown in the UI (quotes/speakers/topics) must come from tRPC queries, never hardcoded. This was a deliberate bug-fix pass; don't regress it.
- **Design system** — editorial Didone serif: Playfair Display headlines, Cormorant Garamond quotes, cream `#FAF7F2` background, antique gold `#B8860B` accent. Match it on any new UI.
- **Root scripts** (`check_db.mjs`, `seed_shorts.mjs`) are one-time Manus-sandbox migration artifacts; `seed_shorts.mjs` reads a hardcoded `/home/ubuntu/` path and will not run here.
- **Tests mock `./db`** — vitest suites mock the DB module entirely; they exercise router logic/guards, not SQL.
- `wouter` is patched via `patches/wouter@3.7.1.patch`; keep the pnpm `patchedDependencies` entry in sync if bumping wouter.

## Security Notes

- Admin promotion is manual SQL: `UPDATE users SET role = 'admin' WHERE open_id = '...'`.
- `ai.chat` is a **public** procedure with no rate limiting or message-size cap — any hardening work should start there (Groq spend is exposed).
- Never commit secrets; env vars only (`.env` is gitignored).
