"use client";

import { useState } from "react";
import { ANCHORS, cardOpacity } from "../../lib/camera/path";
import { useCamera, useCameraEffect } from "../../lib/camera/scroll-controller";
import { SectionCard } from "./section-card";
import { GravityWellsGraph } from "./gravity-wells/gravity-wells-graph";
import { WeaveStackGraph } from "./weave-stack/weave-stack-graph";

const ANCHOR = ANCHORS[2];

/**
 * Anchor 2 — How I build. Two graphs, one under the other:
 *   1. Gravity Wells: my AI dev workflow. Research, design and
 *      engineering as gravity wells, with the tools I use orbiting each.
 *   2. Weave stack: the agent infrastructure I build, in three layers.
 * Mounted through SectionCard's `customLayout` (like How I think) because
 * they need far more width than the default card.
 *
 * In camera mode the section is a fixed overlay, so it scrolls inside
 * itself: Gravity Wells first, then the Weave stack below it. Once the inner scroll reaches either end, the wheel
 * carries on to the page and the camera moves on.
 *
 * Every section is mounted at once in camera mode and faded by the camera,
 * so both simulations pause whenever this card is invisible.
 */
export function HowIBuildSection() {
  const { cameraMode } = useCamera();
  const [onCamera, setOnCamera] = useState(false);

  // cardOpacity is 0 forever in simple mode, so this only matters in camera mode.
  useCameraEffect((cam) => {
    const visible = cardOpacity(cam, ANCHOR.id) > 0.02;
    setOnCamera((prev) => (prev === visible ? prev : visible));
  });

  const active = cameraMode ? onCamera : true;

  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="02"
      title="How I build"
      compact
      customLayout={
        <div
          className={`relative flex flex-col gap-4 ${
            cameraMode
              ? "max-h-[calc(100vh-104px)] overflow-y-auto [scrollbar-color:#2a2520_transparent] [scrollbar-width:thin]"
              : ""
          }`}
        >
          <GravityWellsGraph
            titleId={`anchor-${ANCHOR.slug}-title`}
            active={active}
          />
          <WeaveStackGraph active={active} />
        </div>
      }
    />
  );
}
