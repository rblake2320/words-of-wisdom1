# Words of Wisdom — Project TODO

## Database & Schema
- [x] Add quotes, speakers, favorites, subscriptions tables to drizzle/schema.ts
- [x] Generate and apply migration SQL
- [x] Seed 169 School of Hard Knocks quotes on first launch (auto-seeds on server start)

## Backend (tRPC Routers)
- [x] quotes router: getDaily, getAll (with search/filter), getById, add (admin), seed
- [x] speakers router: getSpeakerNames, bySpeaker
- [x] favorites router: toggle, getUserFavorites, ids (protected)
- [x] subscriptions router: subscribe, unsubscribe (protected)
- [x] admin router: protected, owner-only quote management + stats
- [x] Daily notification: sendDailyNotification mutation for admin

## Frontend Pages & Components
- [x] Global design system: cream bg, Playfair Display Didone serif, editorial layout
- [x] Home page: daily quote hero, editorial layout, share button, subscription
- [x] Quote Library page: searchable/filterable grid of all quotes
- [x] Speaker Profiles page: grouped quotes by speaker
- [x] Speaker Detail page: all quotes by a single speaker
- [x] Admin Panel page: add/manage quotes (owner only), stats, send notification
- [x] Favorites page: user's saved quotes (logged-in only)
- [x] Navbar: editorial top nav with logo, links, auth state

## Features
- [x] Daily quote rotation (deterministic by day of year)
- [x] Quote attribution with speaker name + YouTube link
- [x] One-click copy/share button on every quote
- [x] Favorites/bookmark system for logged-in users
- [x] Speaker profile grouped view
- [x] Admin panel: add quote with text, speaker, video URL, topic
- [x] Admin panel: delete quotes
- [x] Admin panel: stats dashboard
- [x] Daily notification subscription UI
- [x] Send daily notification to subscribers (admin action)

## Tests
- [x] Vitest: quotes router tests (daily, list, topics, add, admin guard)
- [x] Vitest: favorites router tests (toggle, ids, auth guard)
- [x] Vitest: admin access control tests
- [x] Vitest: auth.logout test (pre-existing)

## Expansion: YouTube Shorts Quotes
- [x] Extract advice from all 559 YouTube Shorts using parallel AI analysis
- [x] Clean and deduplicate 390 unique Shorts quotes (169 already in DB from full-length videos)
- [x] Seed all 390 Shorts quotes into the database (total: 559 quotes)

## Bug Fixes
- [x] Fix hardcoded "169" quote count on Home page — replaced with live stats tRPC query
- [x] Fix all static counts/stats throughout the app to use real-time tRPC data
- [x] Ensure new quotes added via Admin are reflected immediately everywhere (no stale counts)
