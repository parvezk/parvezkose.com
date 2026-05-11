"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";

const ANCHOR = ANCHORS[1];

/**
 * Anchor 1 — Design Philosophy. Card content here is intentionally minimal:
 * a short positioning line and a CTA into /design-system/. The full
 * design-system gallery (asymmetric scatter, plate hover behaviors) lives
 * in a separate brief and will replace the placeholder block in a follow-up
 * session.
 */
export function HowIThinkSection() {
  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="01"
      title="How I think"
      ctaHref={ANCHOR.href}
      ctaLabel="Design System Gallery →"
      signatureMotion={
        <span className="block">
          [ Design system gallery — placeholder. Follow-up brief lands here. ]
        </span>
      }
    >
      <p>
        Craft rooted in culture and material honesty. Visual interpretability
        shapes how I build — the model&apos;s shape should be visible to the
        people working with it.
      </p>
    </SectionCard>
  );
}
