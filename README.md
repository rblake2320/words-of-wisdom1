# Words of Wisdom

> Daily inspirational quotes sourced from _The School of Hard Knocks_ YouTube channel — featuring the hard-won wisdom of James Dumoulin and the entrepreneurs he interviews.

[![CI](https://github.com/rblake2320/words-of-wisdom1/actions/workflows/ci.yml/badge.svg)](https://github.com/rblake2320/words-of-wisdom1/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange)](https://pnpm.io/)

**Live App:** [words-of-wisdom.manus.space](https://words-of-wisdom.manus.space)

---

## What It Is

Words of Wisdom is a daily quote platform built around the content library of James Dumoulin's _School of Hard Knocks_ channel. Every quote is extracted directly from his videos — full-length interviews and YouTube Shorts — and surfaced in a clean, editorial interface designed to make each piece of wisdom feel worth reading.

The app is designed as a branded product pitch for James: a companion platform to his channel that drives daily engagement, grows his Skool community, and creates a searchable archive of everything he and his guests have said.

---

## Features

| Feature                 | Description                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Daily Quote**         | A new quote surfaces every day, tied to its source video                                                                                                                          |
| **559 Quotes**          | Extracted from 728 videos (169 full-length + 559 Shorts)                                                                                                                          |
| **Quote Library**       | Full searchable, filterable archive of all quotes                                                                                                                                 |
| **Speaker Profiles**    | Every speaker has a profile page with their quotes                                                                                                                                |
| **Favorites**           | Logged-in users can bookmark quotes                                                                                                                                               |
| **Share Modal**         | Rich share card with Twitter/X, Facebook, LinkedIn, native share, and Skool CTA                                                                                                   |
| **Welcome Screen**      | First-time visitors see a James intro screen (once, via localStorage)                                                                                                             |
| **James Profile**       | Dedicated `/james` page with bio, businesses, revenue metrics, and social links                                                                                                   |
| **Admin Panel**         | Owner-only panel for adding/deleting quotes and sending notifications                                                                                                             |
| **Daily Notifications** | Subscribers opt in; admin dispatch emails every subscriber via Resend (per-recipient, signed one-click unsubscribe). Falls back to an owner digest when `RESEND_API_KEY` is unset |
| **Live Stats**          | All counts (quotes, speakers, topics) are live from the database — never hardcoded                                                                                                |

---

## AI Upsell Opportunity

The base app proves the creator value: convert James's existing content library into a daily wisdom product that drives users back to YouTube, Skool, and other lanes. The AI layer should be a premium upsell, not the free core experience.

Possible AI premium features:

| Feature                       | Description                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Ask James's Wisdom Vault**  | Conversational Q&A grounded only in the 559 approved quotes and source videos                            |
| **Explain This Quote**        | Expands a quote into context, key lesson, action step, and source link                                   |
| **Personalized Daily Wisdom** | AI chooses daily quotes by user goals such as discipline, business, identity, wealth, or faith           |
| **Speaker Insight Mode**      | Ask what a specific guest/speaker has said across the archive                                            |
| **Skool Growth Assistant**    | Suggests which quotes should route users to Skool, YouTube, newsletter, coaching, or offers              |
| **Premium Collections**       | AI groups quotes into guided paths such as Confidence, Entrepreneurship, Discipline, and Comeback Season |

Suggested upsell path:

```text
Free: Daily quote, archive, source links, sharing
Plus: Unlimited saves, personalized daily wisdom, explain-this-quote
Pro: Ask the Wisdom Vault, speaker insights, premium collections
Creator/Partner: AI content extraction, CTA optimization, analytics
```

Guardrails:

- AI answers should cite or link to the quote/source video where possible.
- AI should not invent statements from James or guests.
- Human approval should remain available for public AI-generated summaries or Drops.
- The app should clearly distinguish original quotes from AI-generated explanations.

---

## Design System

The app uses an editorial Didone serif aesthetic — the visual language of luxury magazines and literary journals — to give James's words the weight they deserve.

| Element           | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Headline font** | Playfair Display (serif)                            |
| **Quote font**    | Cormorant Garamond (serif)                          |
| **Background**    | Warm cream `#FAF7F2`                                |
| **Accent**        | Antique gold `#B8860B`                              |
| **Layout**        | Generous negative space, centered editorial columns |

---

## Tech Stack

| Layer        | Technology                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui                                                          |
| **Backend**  | Express 4, tRPC 11 (end-to-end typed API)                                                    |
| **Database** | MySQL / TiDB via Drizzle ORM                                                                 |
| **Auth**     | Email magic links via Resend (standalone) or Manus OAuth — both role-based: `user` / `admin` |
| **Build**    | Vite 7, TypeScript, pnpm                                                                     |
| **Tests**    | Vitest (12 passing)                                                                          |

---

## Quote Database

All 559 quotes were extracted using `manus-analyze-video` — an LLM-powered video analysis tool — run in parallel across the entire channel archive.

| Source                       | Count   |
| ---------------------------- | ------- |
| Full-length interview videos | 169     |
| YouTube Shorts               | 390     |
| **Total**                    | **559** |

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

**Self-hosting / running without Manus:** the app is fully portable — email magic-link login, Resend-based notifications, Docker + TiDB compose stack. See [docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md).

**Environment variables** (injected automatically in Manus — copy `.env.example` to `.env` for local runs):

| Variable           | Purpose                           |
| ------------------ | --------------------------------- |
| `DATABASE_URL`     | MySQL/TiDB connection string      |
| `JWT_SECRET`       | Session cookie signing            |
| `VITE_APP_ID`      | Manus OAuth application ID        |
| `OAUTH_SERVER_URL` | Manus OAuth backend               |
| `OWNER_OPEN_ID`    | Owner's Manus ID (for admin role) |

---

## Admin Access

The admin panel at `/admin` is visible only to users whose `role` is set to `admin` in the `users` table.

- **Standalone:** set `OWNER_EMAIL` — that account gets `admin` automatically on first magic-link login.
- **Manual promotion:**

```sql
UPDATE users SET role = 'admin' WHERE open_id = '<your-manus-open-id>';
```

---

## Roadmap

- [x] Timestamp deep-links — 417 of 559 quotes now deep-link to the exact second in the source video
- [x] Random Quote button — "Surprise Me" button for instant discovery from the full vault
- [x] AI Adviser — Groq-powered chat grounded in the live quote database, rate-limited (10 req/min per client)
- [x] Quote of the Day email — Resend integration with per-subscriber delivery and one-click unsubscribe (set `RESEND_API_KEY` + verified `EMAIL_FROM`; owner-digest fallback without it)
- [ ] AI Upsell Layer — personalized wisdom, quote explainers, premium collections, and Ask-the-Vault subscription features
- [ ] Additional channels — expand beyond School of Hard Knocks
- [ ] Stripe subscription — premium tier for power users

---

## The Pitch

This app was built as a partnership proposal for James Dumoulin. The vision: a branded daily wisdom platform that drives traffic back to his YouTube channel, grows his Skool community, and creates a monetizable content archive from the library he's already built.

Every feature is designed to add value to his brand — not just to the user.

---

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a pull request. All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Security

For responsible disclosure of security vulnerabilities, see [docs/SECURITY.md](./docs/SECURITY.md). Please do not report security issues through public GitHub issues.

The typed application surface is described in [docs/API.md](./docs/API.md). Automated checks run on pull requests and `main`; dependency monitoring is configured through Dependabot.

---

## Related Projects

| Project                                                                  | Description                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [quotehub-showcase](https://github.com/rblake2320/quotehub-showcase)     | Investor-facing platform showcase for the QuoteHub product vision |
| [justin-did-you-know](https://github.com/rblake2320/justin-did-you-know) | Daily facts app powered by Justin Danger Nunley's YouTube Shorts  |

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

_Built with [Manus](https://manus.im)_
