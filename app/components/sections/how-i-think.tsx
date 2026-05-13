"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";
import { DesignSystemGallery } from "../gallery/design-system-gallery";

const ANCHOR = ANCHORS[1];

/**
 * Anchor 1 — How I think. Composite layout: a short intro header
 * (eyebrow + title + 2-line subtitle), followed by the design-system
 * gallery (5 plates on an asymmetric scatter grid).
 *
 * SectionCard's camera-aware wrapper / opacity / drift mechanics apply
 * to the whole composite — the entire block fades in as the camera
 * arrives at anchor 1 and drifts off as it leaves.
 *
 * Header copy is intentionally short — a placeholder anchor so visitors
 * know *why* before they look at the plates. Will be replaced with
 * finalized design-philosophy copy in a follow-up.
 */
export function HowIThinkSection() {
  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="01"
      title="How I think"
      customLayout={
        <div
          style={{
            // Same width pattern as the gallery so the header aligns to
            // the gallery's outer edges visually.
            width: "min(1320px, calc(100vw - 48px))",
          }}
        >
          <header style={{ padding: "0 32px", marginBottom: 14 }}>
            <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-golden)]">
              01 — Anchor
            </p>
            {/* Title size + weight match the `Parvez Kose` mark inside
                plate 01 (UI Kit) so the gallery's lead title and the
                gallery itself read in the same typographic register. */}
            <h2
              className="mb-2 text-[color:var(--neutral-latte)]"
              style={{
                fontFamily:
                  "var(--font-family-mono), 'JetBrains Mono', monospace",
                fontWeight: 300,
                fontSize: 22,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              How I think
            </h2>
            <p className="max-w-2xl text-[12px] leading-relaxed text-white/80">
              {`Craft rooted in culture and material honesty. Visual interpretability shapes how I build — the model's shape should be visible to the people working with it.`}
            </p>
          </header>
          <DesignSystemGallery />
        </div>
      }
    />
  );
}
