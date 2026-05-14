"use client";

import { useEffect, useState } from "react";
import { ANCHORS, cardOpacity } from "../../lib/camera/path";
import { useCameraEffect } from "../../lib/camera/scroll-controller";
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
 * We initialize `visible` to false and flip it true in one of two ways:
 *   - Simple mode (mobile or reduced motion): set true on mount via
 *     useEffect. We check matchMedia directly here instead of relying
 *     on the CameraProvider's `cameraMode` state, because that state
 *     starts false even on desktop (flips true asynchronously after
 *     the scroll-track effect runs). Reading it during initial render
 *     captured a stale false → visible defaulted to true → stagger
 *     fired invisibly at page load.
 *   - Camera mode (desktop, non-reduced): set true the first frame
 *     where the card-opacity envelope is most of the way faded in.
 *     That's the moment the gallery is about to be readable, and the
 *     moment the stagger should fire against a settled background.
 *
 * The flag is sticky — once true, never unset — so re-arriving at the
 * anchor doesn't replay the stagger.
 */
export function HowIThinkSection() {
  const [visible, setVisible] = useState(false);

  // Simple-mode bootstrap. Direct matchMedia check (not via the
  // CameraProvider state) so we don't get fooled by the brief window
  // where `cameraMode` is still false on desktop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!desktop || reduced) {
      setVisible(true);
    }
  }, []);

  // Camera-mode trigger. cardOpacity is 0 forever in simple mode (the
  // camera ref stays at HERO_SAMPLE), so this is a safe no-op there.
  useCameraEffect((cam) => {
    if (visible) return;
    if (cardOpacity(cam, ANCHOR.id) > 0.7) {
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
