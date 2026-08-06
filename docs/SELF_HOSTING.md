# Self-Hosting (No Manus Required)

The app runs anywhere Node + MySQL run. Manus is optional: without its env
vars, login switches to **email magic links** (Resend), owner notifications
switch to **email to `OWNER_EMAIL`**, and everything else works unchanged.

## What replaces what

| Manus feature | Standalone replacement |
|---|---|
| Manus OAuth login | Email magic-link login at `/login` (Resend) |
| Owner notifications (forge) | Email to `OWNER_EMAIL` via Resend |
| Injected env vars | `.env` file (copy `.env.example`) |
| Managed TiDB | Any MySQL-compatible DB (`DATABASE_URL`) |
| manus.space domain | `APP_URL` env var |

## Quick start (Docker)

```bash
cp .env.example .env
# Set at minimum: JWT_SECRET, RESEND_API_KEY, OWNER_EMAIL, APP_URL

docker compose up -d db
# Create the database (first run only)
docker compose exec db mysql -h 127.0.0.1 -P 4000 -u root -e "CREATE DATABASE IF NOT EXISTS words_of_wisdom"

# Apply migrations from your machine
DATABASE_URL="mysql://root@127.0.0.1:4000/words_of_wisdom" pnpm drizzle-kit migrate

docker compose up -d app
# App on http://localhost:3000 — quotes auto-seed on first boot
```

## Quick start (bare Node)

```bash
cp .env.example .env   # fill in values
pnpm install
pnpm drizzle-kit migrate
pnpm build
pnpm start             # serves API + client on :3000
```

## First login / becoming admin

1. Set `OWNER_EMAIL=you@example.com` in the environment.
2. Visit `/login`, request a link, click it in your inbox.
3. Your account is created with the `admin` role automatically — `/admin` unlocks.

Anyone else who logs in gets the `user` role. (Manual SQL promotion still
works too: `UPDATE users SET role='admin' WHERE email='...';`)

## Email (Resend)

1. Create an account at [resend.com](https://resend.com) (free tier: 3,000 emails/month, 100/day).
2. Verify your sending domain, then set:
   - `RESEND_API_KEY=re_...`
   - `EMAIL_FROM="Words of Wisdom <daily@yourdomain.com>"`
3. Without a verified domain, Resend's test sender only delivers to your own
   Resend account email — fine for testing, not for subscribers.

Used for: magic-link sign-in emails, daily quote emails to subscribers
(one per recipient, signed one-click unsubscribe), and the owner digest.

## Database notes

- Migrations `0002`/`0003` use `IF NOT EXISTS` guards — **TiDB syntax** (also
  MariaDB). Vanilla MySQL 8 doesn't support them; the compose file ships TiDB
  for exact parity with the original production DB. A fresh TiDB instance
  applies all migrations cleanly from 0000.
- The app boots without a DB (features degrade to empty lists) — useful for
  smoke tests.

## Dev mode without Resend

`pnpm dev` + request a login link at `/login`: the link is printed to the
server console and shown on the page (development only — production refuses
login-link requests until `RESEND_API_KEY` is set).
