# Words of Wisdom

> *Daily counsel from those who built empires.*

**Words of Wisdom** is a full-stack web application that surfaces a new piece of verified advice every day from the interviews published on [The School of Hard Knocks](https://www.youtube.com/@theschoolofhardknocks) YouTube channel — a media company founded by James Dumoulin with 2M+ subscribers and 287M+ views dedicated to financial literacy and entrepreneurship.

Every quote in the app was extracted directly from a real video interview with a real millionaire or billionaire. Nothing is fabricated or AI-generated. The provenance is the product.

---

## Live App

The app is deployed and accessible at the Manus-hosted URL. To run it locally, follow the setup instructions below.

---

## Features

| Feature | Description |
|---|---|
| **Daily Quote** | A new quote surfaces every day, deterministically rotated across the full library |
| **Quote Library** | Browse, search, and filter all 559 quotes by speaker or topic |
| **Speaker Profiles** | Grouped view of all quotes attributed to a specific speaker |
| **Favorites** | Authenticated users can bookmark quotes they want to revisit |
| **Share Modal** | One-click sharing to Twitter/X, Facebook, LinkedIn, or native share — every share card includes a link to the source video and a call-to-action to join School of Mentors |
| **About James** | A dedicated profile page for James Dumoulin — bio, revenue verticals, social links, and a Skool community CTA |
| **Welcome Screen** | First-time visitors see a branded introduction to the app and James's channel; dismissed after first visit |
| **Admin Panel** | Owner-only dashboard to add, manage, and delete quotes; send daily notifications to subscribers |
| **Daily Notifications** | Subscribed users receive the quote of the day with speaker attribution and a link back to the app |
| **Live Stats** | All counts (quotes, speakers, topics) are fetched in real time from the database — no hardcoded numbers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Wouter |
| **Backend** | Node.js, Express 4, tRPC 11 |
| **Database** | MySQL / TiDB via Drizzle ORM |
| **Auth** | Manus OAuth (session cookie, JWT-signed) |
| **Type Safety** | TypeScript end-to-end via tRPC |
| **Testing** | Vitest (12 passing tests) |
| **Build** | Vite 7, esbuild |

---

## Design System

The visual identity is built around a **sophisticated editorial aesthetic** — the kind you find on the cover of a high-end financial magazine.

- **Background:** Warm cream (`#F9F5EE`)
- **Headline font:** Playfair Display (Didone serif, bold) — dominates the visual hierarchy
- **Quote font:** Cormorant Garamond (italic serif) — elegant and literary
- **Accent:** Antique gold (`#B8860B`) for rule lines and decorative details
- **Layout:** Generous negative space, asymmetric balance, fine geometric lines

---

## Quote Database

The app ships with **559 verified quotes** extracted from The School of Hard Knocks YouTube channel using AI-powered video analysis:

- **169 quotes** from full-length interview videos
- **390 quotes** from YouTube Shorts

At one quote per day, the library covers **over 18 months** before a single quote repeats. New quotes can be added at any time via the Admin panel.

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- A MySQL-compatible database (connection string via `DATABASE_URL` env var)

### Installation

```bash
# Clone the repository
git clone https://github.com/rblake2320/words-of-wisdom1.git
cd words-of-wisdom1

# Install dependencies
pnpm install

# Set up environment variables
# Copy the required env vars (see Environment Variables section below)

# Run database migrations
pnpm drizzle-kit migrate

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

The following environment variables are required. In production these are injected automatically by the Manus platform.

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Secret used to sign session cookies |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend) |
| `OWNER_OPEN_ID` | Owner's Manus open ID (grants admin role on first login) |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API bearer token (server-side) |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL |

---

## Project Structure

```
client/
  src/
    pages/          ← Home, Library, Speakers, Favorites, Admin, JamesProfile
    components/     ← Navbar, QuoteCard, ShareQuoteModal, WelcomeScreen
    lib/trpc.ts     ← tRPC client binding
    App.tsx         ← Routes and layout
    index.css       ← Global design system (editorial cream palette)

drizzle/
  schema.ts         ← Database tables: quotes, speakers, favorites, subscriptions

server/
  db.ts             ← Drizzle query helpers
  routers.ts        ← tRPC procedures: quotes, speakers, favorites, admin, auth
  seedData.ts       ← 169 full-length video quotes (auto-seeds on first launch)
  shortsSeedData.ts ← 390 Shorts quotes
```

---

## Admin Access

The Admin panel is restricted to the account owner. To promote a user to admin, update the `role` field in the `users` table to `admin` via the database management UI.

---

## Running Tests

```bash
pnpm test
```

All 12 Vitest tests cover the quotes router, favorites router, admin access control, and auth logout flow.

---

## Roadmap

The following features are planned for future versions:

- **Video timestamp deep-links** — link directly to the exact moment a quote was said in the source video
- **Speaker social and business links** — allow speakers to be linked to their Instagram, LinkedIn, or business website
- **AI Wisdom Adviser** — a model trained on all 559 interviews to answer questions in the voice of the collective wisdom in the library
- **Quote of the Week digest** — a weekly email roundup of 7 standout quotes for subscribers
- **Multi-channel expansion** — extend the quote library beyond School of Hard Knocks to other entrepreneur interview channels

---

## License

Private repository. All rights reserved.

---

## Acknowledgements

All quotes are sourced from interviews conducted and published by [The School of Hard Knocks](https://www.youtube.com/@theschoolofhardknocks), founded by James Dumoulin. This app is an independent project built to surface and celebrate the wisdom shared on that channel.
