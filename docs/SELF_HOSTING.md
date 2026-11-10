# Self-hosting

Words of Wisdom runs on Node 22 and a MySQL-compatible database. Email magic-link authentication, owner digests and subscriber emails use Resend.

## Review deployment

Public URL: https://wisdom-review.2.25.136.64.sslip.io

The instance runs on the existing Hostinger VPS with a dedicated MariaDB database and persistent volume. Traefik supplies HTTPS. The database has no public port; the app diagnostic port binds only to loopback.

Anonymous browsing, search, topic filters, speaker pages and sharing require no credentials. Email sign-in needs RESEND_API_KEY and a verified EMAIL_FROM; AI responses need GROQ_API_KEY. These optional credentials are not provisioned by this deployment.

From the deployment directory on the VPS:

```sh
docker compose --env-file .env -p words-of-wisdom-review -f deploy/review.compose.yml up -d --build
```

The owner-restricted .env needs independent random DB_PASSWORD, DB_ROOT_PASSWORD and JWT_SECRET values. Never commit it. Migrations run before startup; quotes seed on first boot. Preserve the review-db volume.

## Local development

Copy .env.example to .env and set DATABASE_URL and JWT_SECRET:

```sh
pnpm install --frozen-lockfile
pnpm build
node --env-file=.env dist/migrate.js
pnpm dev
```

Set APP_URL to the public origin for email links. OWNER_EMAIL grants admin to that account on first email sign-in. Development displays test login links when delivery is absent; production refuses those requests.
