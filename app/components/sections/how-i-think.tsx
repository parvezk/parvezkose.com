"use client";

import { useState } from "react";
import { ANCHORS, cardOpacity } from "../../lib/camera/path";
import {
  useCamera,
  useCameraEffect,
} from "../../lib/camera/scroll-controller";
import { SectionCard } from "./section-card";
import { DesignSystemGallery } from "../gallery/design-system-gallery";

const ANCHOR = ANCHORS[1];

/**
 * Anchor 1 — How I think. Composite layout: a short intro header
 * (eyebrow + title + 2-line subtitle), followed by the design-system
 * gallery (5 plates on an asymmetric scatter grid).
 *
 * Visibility gating for entry stagger
 * -----------------------------------
 * The gallery (and its plates) mount on page load regardless of camera
 * position — they sit inside the SectionCard's camera-aware wrapper at
 * `opacity: 0` until the camera arrives at anchor 1. If the plates
 * fire their entry-stagger animation at mount time, that animation
 * runs invisibly while the user is still at the hero anchor and is
 * finished by the time the gallery actually becomes visible.
 *
 * We watch the camera state here and flip a `visible` flag when the
 * card-opacity envelope first becomes non-zero — that's the moment
 * the gallery starts to appear, and the moment the stagger should
 * fire. The flag is sticky (set once, never unset) so re-arriving at
 * the anchor doesn't replay the stagger.
 */
export function HowIThinkSection() {
  const { cameraMode } = useCamera();
  // Simple mode: gallery is in-flow and always visible, so stagger
  // fires on mount. Camera mode: defer to the first camera tick that
  // shows non-zero card opacity.
  const [visible, setVisible] = useState(() => !cameraMode);

  useCameraEffect((cam) => {
    if (visible) return;
    if (!cameraMode) {
      setVisible(true);
      return;
    }
    if (cardOpacity(cam, ANCHOR.id) > 0.05) {
      setVisible(true);
    }
  });

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
          <DesignSystemGallery visible={visible} />
        </div>
      }
    />
  );
}
