# `design-system/` — canonical tokens

Single source of truth for the **parvezkose.com** design system, machine-readable.

## Files

| File | Purpose |
|---|---|
| `tokens.json` | W3C DTCG canonical tokens. **Edit here.** Every other format is derived. |
| `README.md` | This document. |

## Where each token lives downstream

| Surface | File | How it gets there |
|---|---|---|
| Runtime CSS / Tailwind v4 utilities | `app/global.css` (`@theme` block) | Hand-mirrored from `tokens.json`. The two are kept in lockstep manually until `build.mjs` lands. |
| Static specimens | `public/design-system/colors_and_type.css` | The original CSS authored by Claude Code. Mirrors `tokens.json`. |
| Figma variables | (future) | Push via Figma MCP `use_figma`, two collections: `immersive`, `classic`. |
| Style Dictionary outputs | (future) | `build.mjs` will emit Tailwind, Figma, native, etc. |

## Adding a token

1. Add to `tokens.json` under the right group (`color.*`, `font.*`, `spacing.*`, etc.).
2. Mirror into `app/global.css` (both the `@theme` block AND any `:root` alias for the DS-spec name).
3. If the token is consumed in the static specimens, mirror into `public/design-system/colors_and_type.css`.
4. Verify `pnpm build` passes.

## Renaming or removing a token

Don't, until we have a build pipeline. Add a new token, alias the old one to the new value, then deprecate.

## Format

[W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) draft format. Each token is an object with `$value`, `$type`, optional `$description`. Groups can carry their own `$description`.
