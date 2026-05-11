"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";

const ANCHOR = ANCHORS[3];

/**
 * Anchor 3 — Agentic Manifesto. Placeholder copy until final manifesto
 * lands. The single anchor line ("Interfaces are no longer endpoints…") is
 * staged here as the seed thesis; the rest is left empty on purpose.
 */
export function ThinkingAheadSection() {
  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="03"
      title="Thinking Ahead"
      signatureMotion={
        <span className="block">
          [ Manifesto theses + signature motion — placeholder. Final copy TBD. ]
        </span>
      }
    >
      <p>
        Interfaces are no longer endpoints. They are entry points into
        autonomous systems.
      </p>
      <p className="text-white/55">
        We&apos;ve spent decades designing interfaces that react. The next
        interfaces act.
      </p>
    </SectionCard>
  );
}
