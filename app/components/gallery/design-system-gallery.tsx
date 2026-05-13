"use client";

import { useEffect, useRef, useState } from "react";
import { PlateShell, type RationaleAnchor } from "./plate-shell";
import {
  UIKitSpecimen,
  ColorSpecimen,
  BrandSpecimen,
  TypographySpecimen,
  ComponentsSpecimen,
} from "./plates";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Design System Gallery — Direction A · Asymmetric Scatter (refined,
 * v2.5 from the handoff). Renders below the `How I think` section
 * header.
 *
 * Phase 1 covered chrome + plate visuals + hover responses.
 * Phase 2 adds: sustained-hover wall labels, section-wide cursor
 * parallax with per-plate depth multipliers, non-uniform entry
 * stagger, prefers-reduced-motion gate, and a single-column collapse
 * for narrow viewports.
 */

const PARALLAX_MAX_PX = 8;

/** Per-plate cursor-parallax depth (handoff: UI Kit 1.0, Color 1.6, Type 1.3, Brand 0.6, Components 1.1). */
const DEPTH = {
  uiKit: 1.0,
  color: 1.6,
  type: 1.3,
  brand: 0.6,
  components: 1.1,
} as const;

/** Per-plate non-uniform entry-stagger delays in ms (eye-walk through cluster). */
const ENTRY_MS = {
  uiKit: 0,
  color: 220,
  type: 440,
  brand: 600,
  components: 780,
} as const;

/**
 * Rationale anchors — position inside the plate's clipped inner well.
 * Drawn from the handoff: UI Kit bottom-right, Color/Type bottom-left,
 * Brand top-right (clears the wordmark), Components top-left.
 */
const UIKIT_RATIONALE: RationaleAnchor = {
  style: { right: 12, bottom: 12, textAlign: "right" },
  maxWidth: 180,
};
const COLOR_RATIONALE: RationaleAnchor = {
  style: { left: 12, bottom: 12 },
  maxWidth: 150,
};
const TYPE_RATIONALE: RationaleAnchor = {
  style: { left: 12, bottom: 12 },
  maxWidth: 160,
};
const BRAND_RATIONALE: RationaleAnchor = {
  style: { right: 12, top: 12, textAlign: "right" },
  maxWidth: 150,
};
const COMPONENTS_RATIONALE: RationaleAnchor = {
  style: { left: 12, top: 12 },
  maxWidth: 180,
};

/**
 * Wall-label copy. Each starts with `// RATIONALE_TBD —` per the
 * handoff so it's visibly a placeholder until the final design-
 * philosophy copy is dropped in.
 */
const RATIONALE = {
  uiKit:
    "// RATIONALE_TBD — Surface 01 is the page composition that anchors every other moment. Read as: this is what the system makes possible.",
  color:
    "// RATIONALE_TBD — Wines as the spine, terracotta + golden as accents pulled from the volcanic terrain shader.",
  brand: "// RATIONALE_TBD — Mono lockup, kerning as voice.",
  type:
    "// RATIONALE_TBD — IBM Plex Serif as the editorial counterweight to JetBrains' machinery.",
  components:
    "// RATIONALE_TBD — Three button atoms — pill, framed, terminal — one design system, three voices.",
};

export function DesignSystemGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Cursor in normalized [-1, 1] within the section's bounds. State so
  // React composes per-plate offsets; rAF-throttled in the handler so
  // updates cap at 60Hz even on high-density input events.
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pendingX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pendingY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          setCursor({
            x: Math.max(-1, Math.min(1, pendingX)),
            y: Math.max(-1, Math.min(1, pendingY)),
          });
        });
      }
    };
    const onLeave = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      setCursor({ x: 0, y: 0 });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  const offset = (depth: number) => ({
    x: cursor.x * depth * PARALLAX_MAX_PX,
    y: cursor.y * depth * PARALLAX_MAX_PX,
  });

  return (
    <div
      ref={sectionRef}
      style={{
        // Explicit width: the parent SectionCard cardRef is intrinsic-sized,
        // so a `w-full` here would collapse the 12-col grid to minimum.
        width: "min(1320px, calc(100vw - 48px))",
        padding: "8px 24px 16px",
      }}
    >
      <div
        className="ds-gallery-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "90px",
          gap: 20,
        }}
      >
        <PlateShell
          index="01"
          label="UI Kit"
          kind="interface"
          motionTier="restrained"
          style={{ gridColumn: "1 / 7", gridRow: "1 / 3" }}
          rationale={RATIONALE.uiKit}
          rationaleAnchor={UIKIT_RATIONALE}
          parallaxOffset={offset(DEPTH.uiKit)}
          entryDelayMs={ENTRY_MS.uiKit}
        >
          {(hover) => UIKitSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="02"
          label="Color"
          kind="palette"
          motionTier="ambient"
          style={{ gridColumn: "8 / 11", gridRow: "1 / 4" }}
          rationale={RATIONALE.color}
          rationaleAnchor={COLOR_RATIONALE}
          parallaxOffset={offset(DEPTH.color)}
          entryDelayMs={ENTRY_MS.color}
        >
          {(hover) => ColorSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="04"
          label="Type"
          kind="specimen"
          motionTier="restrained"
          style={{ gridColumn: "7 / 10", gridRow: "4 / 6" }}
          rationale={RATIONALE.type}
          rationaleAnchor={TYPE_RATIONALE}
          parallaxOffset={offset(DEPTH.type)}
          entryDelayMs={ENTRY_MS.type}
        >
          {(hover) => TypographySpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="03"
          label="Brand"
          kind="wordmark"
          motionTier="restrained"
          style={{ gridColumn: "10 / 13", gridRow: "4 / 7" }}
          rationale={RATIONALE.brand}
          rationaleAnchor={BRAND_RATIONALE}
          parallaxOffset={offset(DEPTH.brand)}
          entryDelayMs={ENTRY_MS.brand}
        >
          {(hover) => BrandSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="05"
          label="Components"
          kind="atoms"
          motionTier="elevated"
          style={{ gridColumn: "1 / 6", gridRow: "4 / 6" }}
          rationale={RATIONALE.components}
          rationaleAnchor={COMPONENTS_RATIONALE}
          parallaxOffset={offset(DEPTH.components)}
          entryDelayMs={ENTRY_MS.components}
        >
          {(hover) => ComponentsSpecimen(hover)}
        </PlateShell>
      </div>

      {/* Section footer — hairline + balanced mono row, per handoff. */}
      <div
        aria-hidden
        style={{
          marginTop: 20,
          height: 1,
          background: "rgba(200,173,143,0.18)",
        }}
      />
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(200,173,143,0.45)",
        }}
      >
        <span>scatter · v2.5 · specimens under glass</span>
        <span>hover · sustained · wall labels ◇</span>
      </div>

      {/* Responsive collapse for narrow viewports — single-column stack
          per the handoff. Each plate becomes full-width at a natural
          aspect (~16:10) so the asymmetric scatter doesn't degrade into
          stretched squares. Only kicks in below 900px, where the
          camera mode is already disabled and the gallery is rendering
          in-flow via SectionCard's simple-mode fallback. */}
      <style jsx>{`
        @media (max-width: 900px) {
          .ds-gallery-grid {
            grid-template-columns: 1fr !important;
            grid-auto-rows: auto !important;
            gap: 14px !important;
          }
          .ds-gallery-grid > * {
            grid-column: 1 / -1 !important;
            grid-row: auto !important;
            aspect-ratio: 16 / 10 !important;
          }
        }
      `}</style>
    </div>
  );
}
