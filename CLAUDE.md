# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What This Is

Words of Wisdom — a daily quote platform built from James Dumoulin's *School of Hard Knocks* YouTube channel (559 quotes from 728 videos). Built as a branded partnership pitch. Live at words-of-wisdom.manus.space.

## Commands

```bash
pnpm install          # pnpm only (packageManager pinned); npm/yarn will fight the lockfile
pnpm dev              # tsx watch server/_core/index.ts (Vite dev middleware mounted by Express)
pnpm check            # tsc --noEmit — run before committing
pnpm test             # vitest run (server/*.test.ts)
pnpm build            # vite build + esbuild server bundle → dist/
pnpm db:push          # drizzle-kit generate && migrate (needs DATABASE_URL; generate accepts a placeholder)
```

Scripts use `cross-env`, so they work in any shell including Windows cmd/PowerShell.

## Architecture

Single Express server serves both the tRPC API (`/api/trpc`) and the client (Vite middleware in dev, static `dist/` in prod).

- `server/routers.ts` — all tRPC procedures (`appRouter`). Procedure tiers: `publicProcedure` → `protectedProcedure` (logged in) → `adminProcedure` (role === "admin").
- `server/db.ts` — all Drizzle query helpers. Every helper null-checks `getDb()` and degrades gracefully (returns empty/null) when `DATABASE_URL` is unset — the app boots without a DB.
- `server/aiRouter.ts` — AI Adviser chat via Groq (`llama-3.1-8b-instant`). Rate-limited (10 req/min per user-or-IP via `server/rateLimit.ts`), input clamped (≤30 messages, ≤2000 chars each). Returns a canned placeholder string when `GROQ_API_KEY` is unset.
- `server/quoteIndex.ts` — keyword search grounding the AI Adviser. Reads the **live DB** with a 5-minute cache and falls back to the static seed corpus when the DB is empty/unavailable.
- `server/seedData.ts` + `server/shortsSeedData.ts` — the 169 + 390 quote corpus. `runSeed()` auto-runs on server import; `claimSeedFlag()` (fixed-id insert into `seeded_flag`) makes the claim atomic across instances.
- `server/_core/` — Manus platform scaffolding (OAuth, cookies, notification, storage, Vite glue). Treat as vendored: avoid editing unless the task is specifically about it.
- `client/src/pages/` — wouter routes registered in `client/src/App.tsx`.
- `drizzle/schema.ts` — users, speakers, quotes, favorites, subscriptions, seeded_flag (MySQL/TiDB).
- `shared/` — constants and types used by both sides.

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

## Conventions & Gotchas

- **Named exports for components** — e.g. `AIChatBox` is a named export; a default import compiles silently in the editor but breaks `pnpm check` and `vite build`. Always run `pnpm check` before committing client changes.
- **Manus is optional** — standalone mode (no Manus env vars) uses email magic-link login (`/login` → tRPC `auth.requestLoginLink` → GET `/api/auth/email`, `server/authTokens.ts` + `server/authRoutes.ts`) and Resend owner notifications to `OWNER_EMAIL`. `OWNER_EMAIL` gets admin on first login. Both auth flows mint the identical session cookie, so procedure guards don't care which was used. Deployment: `Dockerfile` + `docker-compose.yml` (TiDB for migration parity), guide in `docs/SELF_HOSTING.md`. `APP_URL` is the canonical public URL for email links (`server/appUrl.ts`).
- **Subscriber email** — `admin.sendDailyNotification` sends real per-subscriber emails through Resend's batch API (`server/email.ts`) when `RESEND_API_KEY` is set, plus an owner digest either way. Unsubscribe is a login-free GET `/api/unsubscribe?sid=&token=` (HMAC over the subscription id, `server/emailRoutes.ts`). Never put subscriber email addresses in owner-notification content.
- **Migration lineage** — the Manus sandbox once created its own conflicting 0002/0003; GitHub main is canonical and 0002/0003 here are guarded (`IF NOT EXISTS`, TiDB syntax) so they no-op against the live DB. See `docs/RECONCILIATION.md`. All schema changes start in `drizzle/schema.ts` on main.
- **CI** — `.github/workflows/ci.yml` runs check + test + build on push/PR to main. Pushing workflow changes requires a `workflow`-scoped token.
- **Live stats rule** — all counts shown in the UI (quotes/speakers/topics) must come from tRPC queries, never hardcoded. This was a deliberate bug-fix pass; don't regress it.
- **Design system** — editorial Didone serif: Playfair Display headlines, Cormorant Garamond quotes, cream `#FAF7F2` background, antique gold `#B8860B` accent. Match it on any new UI.
- **Root scripts** (`check_db.mjs`, `seed_shorts.mjs`) are one-time migration artifacts; the app auto-seeds from `server/shortsSeedData.ts`, so they are normally unnecessary.
- **Tests mock `./db`** — vitest suites mock the DB module entirely; they exercise router logic/guards, not SQL.
- `wouter` is patched via `patches/wouter@3.7.1.patch`; keep the pnpm `patchedDependencies` entry in sync if bumping wouter.

## Security Notes

- Admin promotion is manual SQL: `UPDATE users SET role = 'admin' WHERE open_id = '...'`.
- `ai.chat` is public but rate-limited and input-clamped (see `server/aiRouter.ts`); keep those guards if you touch it — Groq spend is otherwise exposed.
- The rate limiter is in-memory (single instance). If the app ever runs multi-instance, move it to Redis.
- Never commit secrets; env vars only (`.env` is gitignored, `.env.example` is the template).
