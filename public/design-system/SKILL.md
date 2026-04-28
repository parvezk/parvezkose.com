# SKILL.md — Working in the Parvez Kose design system

You are producing design artifacts for **parvezkose.com** — a Design / UX Engineer portfolio positioned for frontier-AI roles. The system is **anti-template**. Default to deviation, not convention. But one bold signature per screen, not five.

## Load tokens

```html
<link rel="stylesheet" href="colors_and_type.css">
```

All tokens (`--wine-*`, `--accent-*`, `--neutral-*`, type scale, spacing, motion) are defined there. Read it before inventing values.

## Do

- Pick **one surface** and commit: Immersive (dark, shader-backed) OR Classic (light, 640px card). Not both in one frame.
- Use **JetBrains Mono** for headings on immersive / entire classic surface; **Fira Code** for the one-line subtitle + tagline; **IBM Plex Sans** for prose / UI; **IBM Plex Serif** only for blog H1.
- Weights: `300` display, `400` body, `500` headings + eyebrows + nav. Avoid `700`.
- Eyebrows / nav / tagline: **uppercase mono, `0.12–0.14em` tracking**, `text2`/`text3` color.
- Accents: **terracotta for interaction** (hover rules, CTA borders). **Golden at most once** per screen. **Latte** replaces cool gray for metadata.
- Dividers = **1px hairlines**, 24px horizontal inset. Not boxes.
- Immersive hero = **corner-bracket frame** (no box), text shadows layered per `--shadow-text-hero`.
- Subtitle ends with **step-blink caret** (`.ds-caret`), not a period.
- Over the shader, use the **protection gradient** (`--protect-gradient`) under floating labels; never a solid black pill.
- Hover interactions expand **letter-spacing**, not size.

## Don't

- **No** purple/indigo/teal, **no** blurred-gradient backgrounds, **no** neon glow.
- **No** Inter, Roboto, or generic geometric sans. Plex + JetBrains + Fira, period.
- **No** soft-drop-shadow floating cards. Use 1px borders (`--im-border` on dark, `--classic-border` on light).
- **No** solid-fill accent pills. Accent pills = 12% fill + matching-color text.
- **No** emoji (except the single grayscale 📍 in the classic footer, already in situ).
- **No** more than one bold signature per screen.
- **No** framer-motion, scroll effects, page transitions, or parallax.
- **No** cool-gray metadata. Use `--neutral-latte` or `--im-text2`.

## Copy voice

First-person, declarative, specific. Names the technical thing ("A2UI", "generative UI", "visual interpretability"). Avoids SaaS verbs. Avoids "just" and "simply". Short sentences beat clever ones.

## When designing something new

1. Pick the surface (immersive vs classic).
2. Pick the **one** signature: typographic detail, interaction, layered visual. Everything else recedes.
3. Lay copy first, chrome last.
4. Check against the palette. If a color isn't in `colors_and_type.css`, don't use it.
