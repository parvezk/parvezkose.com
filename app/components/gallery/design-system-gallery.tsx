"use client";

import { PlateShell } from "./plate-shell";
import {
  UIKitSpecimen,
  ColorSpecimen,
  BrandSpecimen,
  TypographySpecimen,
  ComponentsSpecimen,
} from "./plates";

/**
 * Design System Gallery — Direction A · Asymmetric Scatter (refined,
 * v2.5 from the handoff). Renders below the `How I think` section
 * title, replacing the previous small placeholder card.
 *
 * 12-col grid · gridAutoRows: 84px · gap: 18px · max-width: 1280px.
 * Plate placements per handoff:
 *
 *   01 UI Kit       cols 1/7   rows 1/3   wide, short
 *   02 Color        cols 8/11  rows 1/4   square, smaller
 *   04 Typography   cols 7/10  rows 5/7   tall
 *   03 Brand        cols 10/13 rows 5/8   square
 *   05 Components   cols 1/6   rows 5/7   wide
 *
 * The col-7 row-1-4 negative space is intentional — it's where the eye
 * rests.
 *
 * Phase 1: plate visuals + chrome + hover responses. Phase 2 will layer
 * on wall labels (sustained-hover rationale), cursor parallax, entry
 * stagger, and the reduced-motion gate. Plates are not links per the
 * current direction (display-only specimens).
 */
export function DesignSystemGallery() {
  return (
    <div
      style={{
        // Explicit width: the parent SectionCard cardRef is intrinsic-sized,
        // so a `w-full` here would collapse the 12-col grid to minimum.
        // Cap at 1320, but never exceed viewport minus comfortable margins.
        width: "min(1320px, calc(100vw - 48px))",
        padding: "8px 24px 16px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          // 90px rows · 20px gap keeps the cluster feeling tight without
          // overflowing typical 1080-height viewports (8 rows + 7 gaps =
          // 860px, leaving safe area for top/bottom nav + HUD).
          gridAutoRows: "90px",
          gap: 20,
        }}
      >
        {/* Whole grid lifted by 1 row vs the previous shifted layout
            (top plates from 2/4,2/5 → 1/3,1/4 ; bottom plates from
            5/7,5/7,5/8 → 4/6,4/6,4/7). Removes the empty top row that
            was wasting vertical space below the new header, while
            preserving the uneven-cluster relationship between top and
            bottom plates (1 empty grid row of vertical gap between
            them). */}
        <PlateShell
          index="01"
          label="UI Kit"
          kind="interface"
          motionTier="restrained"
          style={{ gridColumn: "1 / 7", gridRow: "1 / 3" }}
        >
          {(hover) => UIKitSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="02"
          label="Color"
          kind="palette"
          motionTier="ambient"
          style={{ gridColumn: "8 / 11", gridRow: "1 / 4" }}
        >
          {(hover) => ColorSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="04"
          label="Type"
          kind="specimen"
          motionTier="restrained"
          style={{ gridColumn: "7 / 10", gridRow: "4 / 6" }}
        >
          {(hover) => TypographySpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="03"
          label="Brand"
          kind="wordmark"
          motionTier="restrained"
          style={{ gridColumn: "10 / 13", gridRow: "4 / 7" }}
        >
          {(hover) => BrandSpecimen(hover)}
        </PlateShell>

        <PlateShell
          index="05"
          label="Components"
          kind="atoms"
          motionTier="elevated"
          style={{ gridColumn: "1 / 6", gridRow: "4 / 6" }}
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
    </div>
  );
}
