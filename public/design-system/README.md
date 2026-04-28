# Parvez Kose — Design System

A bespoke, anti-template design system for **parvezkose.com**. Built for a Design / UX Engineer portfolio that positions the author for frontier-AI roles (Anthropic, Cursor, DeepMind, OpenAI, Flora.ai).

> **Poetry in the shell, rigor in the stack.**
> Material and culture on the surface. A2UI / generative / agentic rigor underneath.

---

## 1 · Thesis

Most AI and SaaS sites have converged on the same template: dark-mode + blurred gradients + Inter + purple-indigo + rounded cards + safe minimalism. That aesthetic is the statistical average of the web, and an "average" portfolio silently signals low investment.

This system is a **deliberate break** from that template. Its constraints come from:

- **Material honesty** — volcanic terrain, crimson valleys, ivory/linen paper. A shader that is *actually doing something*, not a looping gradient.
- **Culture + craft** — wine taxonomy, terracotta, mahogany, latte. Warm earth neutrals instead of cool grays.
- **Historical interfaces** — monospace as a first-class body face; terminal carets; small-caps nav; hairline rules; bracket frames. The computer as an authored object.
- **Visual interpretability** — what lives under the surface should be visible. Dot-grids, scan patterns, structural rules are part of the UI, not decoration.

**What to use, what to avoid:**

| Use | Avoid |
|---|---|
| Wines, terracotta, golden, ivory, mahogany | Purple / indigo / teal gradients |
| IBM Plex Sans + JetBrains Mono + Fira Code + IBM Plex Serif | Inter, Roboto, generic geometric sans |
| Hairline rules (`1px solid var(--border)`) | Soft drop-shadow floating cards |
| Black anchor + warm-tinted borders (`#2a2520`) | Cool grays (`#e5e7eb`, neutral-200) |
| 1–2 bold signatures per screen | Many competing novelties |
| Monospace for eyebrows, nav, tagline, metadata | Rounded pills everywhere |
| Terminal `[+]` / `[−]` toggles | Chevron-only accordions |

---

## 2 · Dual mode

The system expresses in two anchored surfaces. Both share the same tokens; only the palette changes.

### Immersive (`/`) — dark, WebGL

- Full-viewport volcanic shader (fBm domain warp of `volcanic-hero.png`).
- Overlay copy in warm-white (`--im-text: #e8e4e0`), never pure white.
- Corner-bracket frame around hero copy (`before/after` pseudo-elements with 2px borders, no box).
- Subtitle in Fira Code with a step-blink caret at the end (`.ds-caret`).
- Terminal `[+] Design Philosophy` toggle opens an expandable panel (CSS grid-rows transition).
- Footer tagline ("Agentic systems. / Generative UI. / Visual interpretability.") stacked center-bottom on a left-to-transparent protection gradient so text survives over any terrain.

### Classic (`/classic`) — light, card

- 640px single-column card on `#f1f2f2` bone-paper.
- Topbar · hero (with DotGrid canvas) · divider · bio · divider · links · footer.
- Entirely in JetBrains Mono. One weight (300) for the name, rest in 400/500.
- DotGrid canvas on the right half of the hero: base dots at `alpha: 0.10`, rarer "resolve patches", periodic cursor moves, burst expansions. See `app/components/dot-grid.tsx` in the site repo — the CFG values are intentionally tuned and should not be simplified.

Both modes link to each other from a single nav affordance. **`/immersive`** redirects to **`/`** for legacy bookmarks.

---

## 3 · Visual foundations

### 3.1 Color

Tokens live in `colors_and_type.css`. Three families, plus neutrals and a black anchor.

**Wines** — the red spine.
`--wine-crimson #dc143c`, `--wine-garnet #b21e35`, `--wine-ruby #9b111e`, `--wine-burgundy #800020`, `--wine-claret #6f2232`, `--wine-cabernet #5e1224`, `--wine-wine #722f37` (signature mid-wine), `--wine-merlot #7b3f52`, `--wine-shiraz #673147`, `--wine-oxblood #4e0707`, `--wine-port #3c0014`, `--wine-noir #2c0010`, `--wine-abyss #1a0005`.

**Warm earth accents** — used sparingly over the shader.
`--accent-terracotta #e2725b` (primary accent, active states, hover rules), `--accent-rust #b7410e`, `--accent-cognac #9f381d`, `--accent-chili #c04000`, `--accent-golden #c4a000` (reserved — one underline, one badge), `--accent-mulberry #c54b6c`.

**Browns / wood tones** — for borders, dividers, editorial.
`--wood-mahogany #4c3024`, `--wood-walnut #5c4033`, `--wood-coffee #6f4e37`, `--wood-grizzly #685542`.

**Neutrals / creams** — the ivory/linen terrain. Warm, paper-like. Replaces cool gray.
`--neutral-ivory #fffff0`, `--neutral-cream #fffdd0`, `--neutral-linen #faf0e6`, `--neutral-beige #f5f5dc`, `--neutral-champagne #f7e7ce`, `--neutral-bisque #ffe4c4`, `--neutral-almond #efdecd`, `--neutral-khaki #c3b091`, `--neutral-latte #c8ad8f` (secondary muted on dark).

**Anchor** — `--neutral-black #000000`.

**Surface defaults**
Immersive: `bg #0a0a0a`, `bg2 #141414`, `text #e8e4e0`, `text2 #9a9590`, `text3 #5a5550`, `border #2a2520`.
Classic: `bg #f1f2f2`, `fg #1a1a1a`, `fg2 #555`, `fg3 #999`, `border #d8d9d9`.

**Accent rules of engagement**

1. White / warm-white carries 70% of text on dark. Accents are for the remaining 30%.
2. Terracotta = interaction. A 40px underline above a heading, a hover rule, a CTA border — not a fill.
3. Golden = reserved. One per screen, max.
4. Latte = replaces cold gray for metadata and card borders (use at 15% opacity on dark).
5. Never use solid filled accent pills on dark. Always low-opacity fill + same-color text.

**Selection** — `#47a3f3` / `#fefefe`. Retained from the legacy global.css.

### 3.2 Type

- **JetBrains Mono** (variable) — headings on the immersive hero; entire `/classic` surface; metadata; eyebrows; nav.
- **Fira Code** (variable) — the immersive subtitle and tagline (ligature-rich, contrast).
- **IBM Plex Sans** (variable) — prose, UI body, forms, buttons. Plex has personality, avoids Inter-sameness.
- **IBM Plex Serif** — blog H1s only. One weight (400). The serif appears once per article.

**Scale** — `--text-10 … --text-72` (see tokens). Body `14`, H3 `20`, H2 `24`, H1 `36`, hero `48–72`.

**Weights** — **restrained**. `300` (display), `400` (body), `500` (medium — eyebrows, nav, headings), `600` (rare emphasis). Never default to `700`.

**Tracking** — tight (`-0.02em`) on display; widest (`0.12–0.14em`) on monospace caps (eyebrows, nav, tagline). Line-height: `1.15` display, `1.5` UI, `1.7–1.8` prose.

### 3.3 Spacing + radii

Spacing on a **4px grid** (`--space-1` through `--space-20`). Card padding = 24px (`--space-6`). Topbar height = 48px (`--space-12`). Page top gutter on `/classic` = 80px (`--space-20`).

Radii are **understated**: `sm 4px`, `md 6px`, `lg 8px`, `xl 12px`, `pill 999px`. Avoid heavy `2xl/3xl` rounding. The immersive hero frame uses **zero radius and corner brackets** instead.

### 3.4 Elevation + shadows

Elevation is **ink on paper**, not floating cards. Most cards use a 1px border only.

The two functional shadows are both *text* shadows, layered to cut through the shader:

- `--shadow-text-hero` — three stacked shadows (`0 1px 3px`, `0 0 28px`, `0 0 56px`) for hero H1.
- `--shadow-text-sub` — tighter two-shadow stack for subtitles.

On hover, the hero text intensifies (`--shadow-text-hero-hover`) for a subtle "press into the terrain" effect.

Protection gradient (`--protect-gradient`) sits under any floating label on the shader: left-to-transparent, so the label reads without a full black pill.

### 3.5 Motion

- `--dur-fast 150ms` — hover color
- `--dur-base 300ms` — letter-spacing on nav, drawer toggles
- `--dur-slow 500ms` — philosophy panel expand
- `--ease-out-quad cubic-bezier(0.33, 1, 0.68, 1)` — default

The DotGrid canvas tuning (see `reference/dot-grid-prototype.html` in the site repo) is the choreographic signature of `/classic`. Do not simplify.

---

## 4 · Components

The system is deliberately small. Count: **nine** reusable components.

| Component | Role | Shorthand |
|---|---|---|
| `TopBar` | 48px header with name (left) + mode toggle (right, dot + label). | `.ds-topbar` |
| `HeroCard` (classic) | 260px two-column hero: name + role on the left, DotGrid canvas on the right. | — |
| `HeroFrame` (immersive) | Bracket-cornered frame containing H1 + subtitle + `[+] Design Philosophy` toggle. | — |
| `NavCapsLink` | Small-caps monospace link. Hover expands letter-spacing. | `.ds-nav-link` |
| `Divider` | 1px hairline with 24px horizontal inset. | `.ds-divider` |
| `LinkRow` | Horizontal inline link list, gap 20px. | `.ds-linkrow` |
| `Pill` | Accent tag with 12% accent fill + matching text. Never solid. | `.ds-pill` |
| `Philosophy` | Collapsible text block with `[+] / [−]` affordance. | `.ds-philosophy` |
| `Footer` | Top-bordered strip — © year left, location/copyright right. | `.ds-footer` |

See `Components.html` for live specimens. See `UIKit.html` for the system composed into four surfaces (Immersive hero, Classic card, Blog post, About page).

### Buttons

Three kinds. Keep it simple.

1. **Ghost** — text + bottom border. Hover: border becomes `--accent-terracotta`, letter-spacing expands.
2. **Framed** — 1px border, uppercase mono label. Hover: border + label go terracotta.
3. **Terminal** — `[+] Label` affordance. For toggles and disclosure.

No filled "primary" buttons; they fight the material voice.

### Forms

Not currently part of the portfolio surface. If added: 1px border-bottom inputs on transparent background, label above, terracotta focus rule (not a ring).

---

## 5 · Brand

### 5.1 Voice

Declarative, written-not-generated. Short. First-person. Avoids SaaS verbs ("unlock", "streamline", "leverage"). Uses "I" and specific nouns ("A2UI", "visual interpretability", "generative UI").

### 5.2 Hero copy (immersive)

- **Title** — `Parvez Kose` (JetBrains Mono, 300, tight tracking).
- **Subtitle** — `Designing interfaces for intelligence` + caret (Fira Code).
- **Expandable** — Two paragraphs: (1) anti-template thesis, (2) visual interpretability.
- **Footer tagline** — `Agentic systems. / Generative UI. / Visual interpretability.` Stacked, centered, widest tracking.

### 5.3 Hero copy (classic)

- Name (JetBrains Mono, 300, 28px).
- Role — `Staff Software Engineer` / `AI Native Full Stack · Front-End`.
- Bio (12px, 1.8 line-height, fg2).

### 5.4 Imagery

- **`volcanic-hero.png`** — the primary brand image (4k satellite-view volcanic terrain, crimson valleys, ivory/linen peaks). Lives at `public/textures/volcanic-hero.png` on the site.
- **DotGrid canvas** — the secondary signature (procedural, not an image).
- **OG image** — generated via `app/og/route.tsx`. Uses JetBrains Mono + the classic palette.
- **No stock photography, no 3D renders of abstract shapes, no neon glow.**

### 5.5 External presence

- Substack · [designlogic.substack.com](https://designlogic.substack.com)
- Medium · [medium.com/deepviz](https://medium.com/deepviz)
- LinkedIn · [linkedin.com/in/parvezkose](https://linkedin.com/in/parvezkose)
- GitHub · [github.com/parvezk](https://github.com/parvezk)

---

## 6 · Files

```
colors_and_type.css      Tokens (colors, type, spacing, motion, components classes)
fonts/                   Variable woff2 for all four families
assets/                  Brand imagery (volcanic-hero.png)
README.md                This document
SKILL.md                 Rules for AI agents producing work in this system
Type.html                Specimen: type scale + families + weights
Colors.html              Specimen: full palette cards + usage examples
Spacing.html             Specimen: 4px grid + radii + shadows
Components.html          Specimen: TopBar, HeroFrame, NavCapsLink, Pill, Philosophy, Footer
Brand.html               Specimen: logo, hero imagery, OG lockup, voice
UIKit.html               The system in context: four surfaces composed end-to-end
```

---

## 7 · Non-negotiables

1. The DotGrid canvas logic on `/classic` is **tuned**. Do not abstract.
2. `/immersive` is a **permanent redirect** to `/`. Never add a route there.
3. No framer-motion, no scroll-jack, no page transitions.
4. No dark mode on `/classic`. Palette is fixed light.
5. The WebGL hero **must stay readable**: vignette intact, subtitle caret intact, text shadows intact.
6. Do not introduce a new color family. Wines + terracotta + golden + latte + ivory + black is the full kit.
7. One bold signature per screen. Everything else stays quiet.
