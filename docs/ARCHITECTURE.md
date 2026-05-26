# Architecture Overview — Words of Wisdom

## System Summary

Words of Wisdom is a full-stack web application that surfaces daily inspirational quotes from The School of Hard Knocks YouTube channel. It is built on a React + Express + MySQL/TiDB stack, deployed on the Manus platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL / TiDB (via Drizzle ORM) |
| Auth | Manus OAuth (JWT session cookies) |
| Testing | Vitest |
| Package Manager | pnpm |
| Deployment | Manus Platform (Cloud Run) |

---

## Directory Structure

```
words-of-wisdom/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Page-level route components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/trpc.ts      # tRPC client binding
│   │   ├── App.tsx          # Route definitions
│   │   └── index.css        # Global design tokens
├── server/
│   ├── _core/               # Framework plumbing (OAuth, tRPC context, LLM)
│   ├── routers.ts           # All tRPC procedures
│   ├── db.ts                # Drizzle query helpers
│   ├── scheduledHandlers.ts # Heartbeat cron handlers
│   └── seedData.ts          # Quote seed data (559 quotes)
├── drizzle/
│   ├── schema.ts            # Database table definitions
│   └── *.sql                # Migration files
├── shared/                  # Types and constants shared between client/server
├── docs/                    # Architecture and security documentation
└── .github/                 # CI/CD workflows and issue templates
```

---

## Data Model

### Core Tables

**`quotes`** — The primary content table. Each row represents one quote extracted from a YouTube video.

| Column | Type | Description |
|---|---|---|
| `id` | int PK | Auto-increment primary key |
| `text` | text | The quote content |
| `speakerId` | int FK | Reference to speakers table |
| `speakerName` | varchar | Denormalized speaker name for fast reads |
| `videoUrl` | varchar | YouTube video URL |
| `videoTitle` | varchar | Title of the source video |
| `topic` | varchar | Thematic category (e.g. "Mindset", "Money") |
| `videoTimestamp` | int | Seconds into the video where the quote appears |
| `featured` | boolean | Whether the quote is featured |
| `createdAt` | timestamp | Row creation time |

**`speakers`** — One row per unique speaker.

**`favorites`** — User-quote join table for saved quotes.

**`subscriptions`** — Email subscriptions for the daily wisdom digest.

**`users`** — Authenticated users (via Manus OAuth).

---

## API Design

All client-server communication uses **tRPC** over `/api/trpc`. There are no hand-written REST routes except for:

- `/api/oauth/callback` — Manus OAuth completion
- `/api/scheduled/daily-wisdom` — Heartbeat cron endpoint for daily email dispatch

### Key tRPC Procedures

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `quotes.daily` | query | public | Returns today's quote (deterministic by date) |
| `quotes.random` | query | public | Returns a random quote from the full library |
| `quotes.list` | query | public | Paginated quote library with filters |
| `quotes.bySpeaker` | query | public | All quotes by a given speaker |
| `quotes.stats` | query | public | Total counts for quotes, speakers, topics |
| `favorites.toggle` | mutation | protected | Add or remove a quote from favorites |
| `favorites.ids` | query | protected | All favorited quote IDs for the current user |
| `subscriptions.upsert` | mutation | protected | Subscribe or unsubscribe from daily email |
| `auth.me` | query | public | Current authenticated user or null |
| `auth.logout` | mutation | protected | Clear session cookie |

---

## Scheduled Jobs

The daily email digest is powered by a **Heartbeat cron** (Manus platform-managed HTTP cron) that POSTs to `/api/scheduled/daily-wisdom` every day at 9:00 AM UTC. The handler:

1. Fetches today's daily quote
2. Collects all active subscriber emails
3. Dispatches a notification to the project owner via the Manus notification service

---

## Authentication Flow

1. User clicks "Sign In" → redirected to Manus OAuth portal
2. OAuth completes → `/api/oauth/callback` sets a signed `app_session_id` JWT cookie
3. Every tRPC request reads the cookie via `server/_core/context.ts`
4. Protected procedures use `protectedProcedure` which throws `UNAUTHORIZED` if no valid session

---

## Deployment

The application runs as a single Node.js process on Cloud Run (via Manus Platform). The frontend is served by the same Express process in production (Vite SSR in development, static build in production). There are no separate frontend/backend deployments.

Environment variables are injected by the Manus platform at runtime — no `.env` files are committed.
