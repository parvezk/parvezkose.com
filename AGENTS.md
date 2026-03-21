# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 14 personal portfolio/blog site (parvezkose.com). Single-package, no monorepo, no databases, no Docker.

### Quick reference

- **Package manager:** pnpm 9.15.0 (pinned via `packageManager` field; corepack manages the version)
- **Dev server:** `pnpm dev` (runs `next dev` on port 3000)
- **Build:** `pnpm build` (runs `next build`)
- **Production server:** `pnpm start` (runs `next start`)

### Notes

- **Lint:** `pnpm lint` (runs `next lint` with `eslint-config-next/core-web-vitals`). No test framework is configured.
- Blog content lives in `app/blog/posts/*.mdx` as local MDX files read via the filesystem at build/request time.
- Tailwind CSS v4 alpha (`4.0.0-alpha.13`) is used via `@tailwindcss/postcss`; there is no `tailwind.config.js` — styles are configured in `app/global.css`.
- The site deploys on **AWS Amplify** (not Vercel). `@vercel/analytics` and `@vercel/speed-insights` are still in the dependency tree and rendered in `app/layout.tsx` but are effectively inactive outside Vercel-hosted environments.
- The `next build` step also runs type-checking ("Linting and checking validity of types"), which serves as the primary correctness check for this project.
