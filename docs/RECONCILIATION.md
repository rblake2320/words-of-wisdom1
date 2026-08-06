# Sandbox ↔ GitHub Reconciliation (2026-08-06)

The Manus sandbox and this GitHub repo diverged: the sandbox added
`quotes.videoTimestamp` + `speakers.socialLink`/`businessLink` (applied to the
live TiDB as its own migrations "0002"/"0003"), while GitHub added the
`favorites` unique constraint as migration `0002_many_eternals.sql`. Two
different lineages both claimed "0002".

**GitHub main is now the canonical lineage.** This repo's schema includes ALL
columns (videoTimestamp, socialLink, businessLink AND the favorites
constraint), and the migrations are written to apply safely against the live
DB regardless of which lineage touched it:

| Migration (this repo) | Contents | Safe on live DB because |
|---|---|---|
| `0002_many_eternals.sql` | dedupe favorites + `ADD UNIQUE INDEX IF NOT EXISTS` | guard skips if present; dedupe is a no-op on clean data |
| `0003_minor_spacker_dave.sql` | `ADD COLUMN IF NOT EXISTS` × 3 | columns already exist in prod → all three no-op |

(`IF NOT EXISTS` on ADD COLUMN/ADD INDEX is TiDB syntax — supported by the
Manus-managed TiDB. Plain MySQL 8 does not support it; local dev against
vanilla MySQL should just use a fresh DB from migration 0000.)

## Steps for the Manus sandbox

1. **Pull GitHub main** (commit with this file) and make it the sandbox's
   working tree. Discard the sandbox's local migration files whose numbers
   collide (its own 0002/0003) — their DDL is already live in the DB and is
   now represented by this repo's guarded 0003.
2. **Check the drizzle journal** in the live DB:
   ```sql
   SELECT * FROM __drizzle_migrations ORDER BY id;
   ```
   Rows recorded by the sandbox's old lineage are harmless — drizzle matches
   by hash, so this repo's 0002/0003 will simply apply (as no-ops where
   guarded) and add their own rows. If `drizzle-kit migrate` instead attempts
   to re-run 0000/0001 (hash mismatch — only if the sandbox regenerated
   them), STOP and run just the two new files manually:
   ```sql
   -- paste drizzle/0002_many_eternals.sql then drizzle/0003_minor_spacker_dave.sql
   ```
3. **Verify the favorites constraint landed** (the one thing prod is missing):
   ```sql
   SHOW INDEX FROM favorites WHERE Key_name = 'favorites_user_quote_unique';
   ```
   Expect 2 rows (userId, quoteId). Also sanity-check column types match the
   schema: `SHOW COLUMNS FROM quotes LIKE 'videoTimestamp';` (this repo
   declares `int` seconds) and `SHOW COLUMNS FROM speakers LIKE '%Link';`
   (declared `varchar(512)`).
4. **Push any sandbox-only UI work back to GitHub** (timestamp deep-link UI,
   speaker link editing) so the repo stops drifting. GitHub main already has:
   build fix, CI workflow, AI rate limiting + live-DB grounding, notification
   privacy fix, Resend email delivery + unsubscribe route, cross-env scripts.
   Do not overwrite those.
5. **Enable real subscriber email**: set `RESEND_API_KEY` (and `EMAIL_FROM`
   once a domain is verified in Resend) in the deployment env. Without it the
   admin action falls back to the owner digest. Unsubscribe links are served
   at `/api/unsubscribe` and require no login.

## Going forward

One rule prevents this recurring: **all schema changes start in
`drizzle/schema.ts` on GitHub main**, generated with
`pnpm drizzle-kit generate`, and reach the live DB via `drizzle-kit migrate`
(or pasted SQL) — never ad-hoc DDL in the sandbox.
