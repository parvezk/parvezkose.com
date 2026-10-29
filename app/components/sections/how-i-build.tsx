"use client";

import { useEffect, useRef, useState } from "react";
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
 * In camera mode the section is taller than the viewport, so it scrolls
 * with the page: the camera holds at this anchor for as many extra pixels
 * of scroll as the content overflows, and the card moves up with them.
 * Then the camera carries on to the next anchor.
 *
 * Every section is mounted at once in camera mode and faded by the camera,
 * so both simulations pause whenever this card is invisible.
 */
export function HowIBuildSection() {
  const { cameraMode, setDwell } = useCamera();
  const [onCamera, setOnCamera] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Tell the camera how far the content overflows the viewport (56px top and 48px bottom padding).
  useEffect(() => {
    const el = contentRef.current;
    if (!cameraMode || !el) {
      setDwell(0);
      return;
    }
    const update = () => setDwell(el.offsetHeight - (window.innerHeight - 104));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      setDwell(0);
    };
  }, [cameraMode, setDwell]);

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
      tall
      customLayout={
        <div ref={contentRef} className="relative flex flex-col gap-4">
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
