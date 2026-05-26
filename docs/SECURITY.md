# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`main`) | ✅ Yes |
| Older branches | ❌ No |

We only actively maintain the `main` branch. Please ensure you are running the latest version before reporting a vulnerability.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Words of Wisdom, please report it responsibly by following these steps:

1. **Email the maintainer directly** at the contact listed on the [GitHub profile](https://github.com/rblake2320).
2. Include the following in your report:
   - A description of the vulnerability and its potential impact
   - Steps to reproduce the issue
   - Any proof-of-concept code or screenshots (if applicable)
   - Your suggested fix or mitigation (optional but appreciated)

You will receive an acknowledgment within **48 hours** and a full response within **7 days** outlining the next steps.

---

## Security Considerations

### Authentication

This application uses Manus OAuth for authentication. Session tokens are signed with a `JWT_SECRET` environment variable. Never commit `.env` files or expose secrets in code.

### Database

All database credentials are managed via environment variables and are never hardcoded. The application uses parameterized queries via Drizzle ORM to prevent SQL injection.

### API Keys

All API keys and secrets are stored as environment variables. The `BUILT_IN_FORGE_API_KEY` is server-side only and never exposed to the client.

### Dependencies

We use `pnpm` with a lockfile to ensure reproducible builds. Dependencies are regularly reviewed for known vulnerabilities. You can audit the project yourself with:

```bash
pnpm audit
```

---

## Disclosure Policy

Once a vulnerability is confirmed and patched, we will:

1. Release a fix as soon as possible
2. Credit the reporter in the release notes (unless they prefer to remain anonymous)
3. Publish a brief post-mortem for significant vulnerabilities

---

## Scope

The following are **in scope** for security reports:

- Authentication bypass or session hijacking
- SQL injection or database exposure
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Sensitive data exposure
- Server-side request forgery (SSRF)
- Privilege escalation

The following are **out of scope**:

- Denial of service attacks
- Social engineering
- Issues in third-party services (Manus platform, YouTube API)
- Theoretical vulnerabilities without a proof of concept
