"use client";

import { useState, type ComponentProps } from "react";
import { ANCHORS, cardOpacity } from "../../lib/camera/path";
import { useCameraEffect } from "../../lib/camera/scroll-controller";
import { AgentTransmission } from "./agent-transmission";

const BUILD = ANCHORS[2];

/**
 * The agent-transmission overlay, hidden while How I build is on screen.
 * That section's panels cover almost the whole viewport, so an intercept
 * placed before they faded in would sit behind them and show faintly
 * through. In simple mode the camera never reaches the anchor, so this
 * never hides.
 */
export function CameraAwareTransmission(props: ComponentProps<typeof AgentTransmission>) {
  const [hidden, setHidden] = useState(false);
  useCameraEffect((cam) => {
    const next = cardOpacity(cam, BUILD.id) > 0;
    setHidden((prev) => (prev === next ? prev : next));
  });
  return (
    <div
      aria-hidden
      style={{
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
        transition: hidden
          ? "opacity 200ms ease, visibility 0s linear 200ms"
          : "opacity 400ms ease",
      }}
    >
      <AgentTransmission {...props} />
    </div>
  );
}
