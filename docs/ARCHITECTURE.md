# Architecture Overview — Words of Wisdom

## System Summary

React frontend and Express/tRPC API backed by a dedicated MySQL-compatible database. Signed sessions use email magic-link login through Resend.


---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL / TiDB (via Drizzle ORM) |
| Testing | Vitest |
| Package Manager | pnpm |

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
│   ├── _core/               # Session authentication and tRPC context
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


---

## API Design

All client-server communication uses **tRPC** over `/api/trpc`. There are no hand-written REST routes except for:

- `/api/auth/email` — verifies an email magic link and sets the session cookie
- `/api/unsubscribe` — verifies a signed unsubscribe link

### Key tRPC Procedures

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `quotes.daily` | query | public | Returns today's quote (deterministic by date) |
| `quotes.list` | query | public | Quote library with search and topic filters |
| `quotes.bySpeaker` | query | public | All quotes by a given speaker |
| `quotes.stats` | query | public | Total counts for quotes, speakers, topics |
| `favorites.toggle` | mutation | protected | Add or remove a quote from favorites |
| `favorites.ids` | query | protected | All favorited quote IDs for the current user |
| `subscriptions.upsert` | mutation | protected | Subscribe or unsubscribe from daily email |
| `auth.me` | query | public | Current authenticated user or null |
| `auth.logout` | mutation | protected | Clear session cookie |

---

## Email Dispatch

The admin procedure sends the daily quote to active subscribers through Resend.
The review deployment does not configure a scheduled sender.

---

## Authentication Flow

1. The login page requests an email magic link through Resend.
2. `/api/auth/email` verifies the token and sets a signed `app_session_id` cookie.
3. Every tRPC request reads the cookie via `server/_core/context.ts`
4. Protected procedures use `protectedProcedure` which throws `UNAUTHORIZED` if no valid session

---

## Deployment
