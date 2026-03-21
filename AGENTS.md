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
- The site deploys on **AWS Amplify** (not Vercel).
- The `next build` step also runs type-checking ("Linting and checking validity of types"), which serves as the primary correctness check for this project.

## Analytics — Amazon CloudWatch RUM

Real-user monitoring is provided by [Amazon CloudWatch RUM](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html) via the [`aws-rum-web`](https://github.com/aws-observability/aws-rum-web) client.

### How it works

`app/components/cloudwatch-rum.tsx` is a `"use client"` component that:

1. Dynamically imports `aws-rum-web` (keeps it out of the server bundle).
2. Reads configuration from `NEXT_PUBLIC_CW_RUM_*` environment variables.
3. Initialises the RUM client once on mount; silently no-ops when env vars are missing (e.g. local dev).

### Required environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CW_RUM_APP_ID` | App Monitor ID (UUID) from the CloudWatch RUM console |
| `NEXT_PUBLIC_CW_RUM_IDENTITY_POOL_ID` | Cognito Identity Pool ID for unauthenticated access |
| `NEXT_PUBLIC_CW_RUM_ENDPOINT` | RUM data-plane endpoint, e.g. `https://dataplane.rum.us-east-1.amazonaws.com` |
| `NEXT_PUBLIC_CW_RUM_APP_REGION` | AWS region of the App Monitor (defaults to `us-east-1`) |

Set these in the **AWS Amplify Console → Environment Variables** for production, and in a local `.env` file for development. See `.env.example` for a template.

### What it replaces

The previous `@vercel/analytics` and `@vercel/speed-insights` packages were removed — they silently no-op outside Vercel-hosted environments.
