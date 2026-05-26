# Words of Wisdom

> Daily inspirational quotes sourced from *The School of Hard Knocks* YouTube channel — featuring the hard-won wisdom of James Dumoulin and the entrepreneurs he interviews.

**Live App:** [words-of-wisdom.manus.space](https://words-of-wisdom.manus.space)

---

## What It Is

Words of Wisdom is a daily quote platform built around the content library of James Dumoulin's *School of Hard Knocks* channel. Every quote is extracted directly from his videos — full-length interviews and YouTube Shorts — and surfaced in a clean, editorial interface designed to make each piece of wisdom feel worth reading.

The app is designed as a branded product pitch for James: a companion platform to his channel that drives daily engagement, grows his Skool community, and creates a searchable archive of everything he and his guests have said.

---

## Features

| Feature | Description |
|---|---|
| **Daily Quote** | A new quote surfaces every day, tied to its source video |
| **559 Quotes** | Extracted from 728 videos (169 full-length + 559 Shorts) |
| **Quote Library** | Full searchable, filterable archive of all quotes |
| **Speaker Profiles** | Every speaker has a profile page with their quotes |
| **Favorites** | Logged-in users can bookmark quotes |
| **Share Modal** | Rich share card with Twitter/X, Facebook, LinkedIn, native share, and Skool CTA |
| **Welcome Screen** | First-time visitors see a James intro screen (once, via localStorage) |
| **James Profile** | Dedicated `/james` page with bio, businesses, revenue metrics, and social links |
| **Admin Panel** | Owner-only panel for adding/deleting quotes and sending notifications |
| **Daily Notifications** | Subscribers opt in to receive the daily quote |
| **Live Stats** | All counts (quotes, speakers, topics) are live from the database — never hardcoded |

---

## Design System

The app uses an editorial Didone serif aesthetic — the visual language of luxury magazines and literary journals — to give James's words the weight they deserve.

| Element | Value |
|---|---|
| **Headline font** | Playfair Display (serif) |
| **Quote font** | Cormorant Garamond (serif) |
| **Background** | Warm cream `#FAF7F2` |
| **Accent** | Antique gold `#B8860B` |
| **Layout** | Generous negative space, centered editorial columns |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui |
| **Backend** | Express 4, tRPC 11 (end-to-end typed API) |
| **Database** | MySQL / TiDB via Drizzle ORM |
| **Auth** | Manus OAuth (role-based: `user` / `admin`) |
| **Build** | Vite 7, TypeScript, pnpm |
| **Tests** | Vitest (12 passing) |

---

## Quote Database

All 559 quotes were extracted using `manus-analyze-video` — an LLM-powered video analysis tool — run in parallel across the entire channel archive.

| Source | Count |
|---|---|
| Full-length interview videos | 169 |
| YouTube Shorts | 390 |
| **Total** | **559** |

Each quote is stored with: the quote text, speaker name, source video URL, and topic category.

---

## Project Structure

```
client/src/
  pages/          — Home, Library, Speakers, SpeakerDetail, Favorites, Admin, JamesProfile
  components/     — QuoteCard, WelcomeScreen, ShareQuoteModal, Navbar
  lib/trpc.ts     — tRPC client binding

server/
  routers.ts      — All tRPC procedures (quotes, favorites, speakers, subscriptions, admin)
  db.ts           — Drizzle query helpers
  seedData.ts     — 169 quotes from full-length videos
  shortsSeedData.ts — 390 quotes from YouTube Shorts

drizzle/
  schema.ts       — DB tables: users, quotes, speakers, favorites, subscriptions, seeded_flag
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit generate
# Apply the generated SQL via webdev_execute_sql or your DB client

# Start development server
pnpm dev
```

**Environment variables** (injected automatically in Manus):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend |
| `OWNER_OPEN_ID` | Owner's Manus ID (for admin role) |

---

## Admin Access

The admin panel at `/admin` is visible only to users whose `role` is set to `admin` in the `users` table. To promote a user:

```sql
UPDATE users SET role = 'admin' WHERE open_id = '<your-manus-open-id>';
```

---

## Roadmap

- [ ] Timestamp deep-links — jump to the exact second a quote was said in the source video
- [ ] Quote of the Day email — automated daily email to subscribers
- [ ] Random Quote button — one-tap discovery
- [ ] AI Adviser — conversational model grounded in all 559 quotes
- [ ] Additional channels — expand beyond School of Hard Knocks
- [ ] Stripe subscription — premium tier for power users

---

## The Pitch

This app was built as a partnership proposal for James Dumoulin. The vision: a branded daily wisdom platform that drives traffic back to his YouTube channel, grows his Skool community, and creates a monetizable content archive from the library he's already built.

Every feature is designed to add value to his brand — not just to the user.

---

*Built with [Manus](https://manus.im)*
