"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";

const ANCHOR = ANCHORS[2];

/**
 * Anchor 2 — Agent Tech Stack. Placeholder body; the signature motion
 * (tech-stack node organization) is reserved for a follow-up session.
 */
export function HowIBuildSection() {
  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="02"
      title="How I build"
      signatureMotion={
        <span className="block">
          [ Stack node organization — placeholder. Follow-up brief lands here. ]
        </span>
      }
    >
      <p>
        Three layers, orchestrated: a thinking layer for framing, an
        execution layer of agents for implementation, and a validation layer
        of telemetry holding both honest.
      </p>
    </SectionCard>
  );
}
