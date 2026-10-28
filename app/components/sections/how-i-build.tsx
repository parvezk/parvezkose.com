"use client";

import { useState } from "react";
import { ANCHORS, cardOpacity } from "../../lib/camera/path";
import { useCamera, useCameraEffect } from "../../lib/camera/scroll-controller";
import { SectionCard } from "./section-card";
import { GravityWellsGraph } from "./gravity-wells/gravity-wells-graph";

const ANCHOR = ANCHORS[2];

/**
 * Anchor 2 — How I build. The Gravity Wells graph: research, design and
 * engineering as gravity wells, with the tools I use orbiting each one.
 * Mounted through SectionCard's `customLayout` (like How I think) because
 * it needs far more width than the default card.
 *
 * In camera mode every section is mounted at once and faded by the camera,
 * so the graph's simulation is paused whenever this card is invisible.
 * In simple mode (mobile / reduced motion) it runs while it is in view.
 */
export function HowIBuildSection() {
  const { cameraMode } = useCamera();
  const [onCamera, setOnCamera] = useState(false);

  // cardOpacity is 0 forever in simple mode, so this only matters in camera mode.
  useCameraEffect((cam) => {
    const visible = cardOpacity(cam, ANCHOR.id) > 0.02;
    setOnCamera((prev) => (prev === visible ? prev : visible));
  });

  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="02"
      title="How I build"
      compact
      customLayout={
        <GravityWellsGraph
          ordinal="02"
          titleId={`anchor-${ANCHOR.slug}-title`}
          active={cameraMode ? onCamera : true}
        />
      }
    />
  );
}
