# Contributing to Words of Wisdom

Thank you for your interest in contributing to Words of Wisdom — a daily quote platform featuring wisdom from entrepreneurs, investors, and visionaries sourced from The School of Hard Knocks YouTube channel.

---

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## How to Contribute

### Reporting Bugs

Before filing a bug report, please check the [existing issues](https://github.com/rblake2320/words-of-wisdom1/issues) to avoid duplicates. When filing a new bug report, use the **Bug Report** issue template and include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or screen recordings if applicable
- Browser, OS, and viewport size

### Suggesting Features

Feature requests are welcome. Use the **Feature Request** issue template and describe:

- The problem you are trying to solve
- Your proposed solution
- Any alternatives you have considered
- Whether this relates to a specific area (e.g., Quote Library, Speaker Profiles, Daily Email, Favorites)

### Submitting Pull Requests

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes.** Follow the coding standards below.
3. **Test your changes** by running the dev server (`pnpm dev`) and verifying the affected sections render correctly across desktop and mobile viewports.
4. **Run tests** before submitting:
   ```bash
   pnpm test
   pnpm check
   ```
5. **Commit** with a clear, descriptive message following the [Conventional Commits](https://www.conventionalcommits.org/) format:
   ```
   feat(quotes): add random quote "Surprise Me" button
   fix(home): correct daily quote loading state flicker
   docs(readme): update deployment instructions
   ```
6. **Push** your branch and open a pull request against `main`. Fill out the pull request template completely.
7. A maintainer will review your PR. Please be responsive to feedback.

---

## Coding Standards

### TypeScript

- All new components must be written in TypeScript with explicit prop types.
- Avoid `any` types. Use proper interfaces or type aliases.
- Keep component files focused — one primary exported component per file.

### Styling

- Use Tailwind CSS utility classes as the primary styling mechanism.
- Follow the editorial design system defined in `client/src/index.css`. Do not introduce new color values without updating the design tokens.
- All new sections must be responsive (mobile-first, tested at 375px, 768px, and 1280px widths).

### Backend

- All backend calls must go through tRPC procedures in `server/routers.ts`.
- Do not introduce raw `fetch` or Axios calls on the client — use `trpc.*` hooks exclusively.
- Add query helpers to `server/db.ts` and keep procedures thin.
- Cover new procedures with Vitest tests in `server/*.test.ts`.

### Components

- Place new page components in `client/src/pages/`.
- Place reusable UI components in `client/src/components/`.
- Do not store images or media in `client/public/` or `client/src/assets/`. Use the `manus-upload-file --webdev` workflow for static assets.

### Accessibility

- All interactive elements must have visible focus states.
- Use semantic HTML elements (`<section>`, `<nav>`, `<main>`, `<article>`) appropriately.
- Provide `aria-label` attributes for icon-only buttons.
- Ensure color contrast ratios meet WCAG 2.1 AA standards.

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/words-of-wisdom1.git
cd words-of-wisdom1

# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Run tests
pnpm test

# Type-check
pnpm check

# Format code
pnpm format
```

---

## Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/short-description` | `feature/random-quote-button` |
| Bug fix | `fix/short-description` | `fix/daily-quote-timezone` |
| Documentation | `docs/short-description` | `docs/update-api-reference` |
| Refactor | `refactor/short-description` | `refactor/quote-card-component` |

---

## Questions?

If you have questions that are not addressed here, open a [Discussion](https://github.com/rblake2320/words-of-wisdom1/discussions) rather than an issue.
