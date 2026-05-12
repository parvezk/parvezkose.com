"use client";

import { useRef } from "react";
import {
  GenerativeHeroWebGL,
  type GenerativeHeroWebGLHandle,
} from "../generative-hero-webgl";
import { useCameraEffect } from "../../lib/camera/scroll-controller";

/**
 * Aerial-camera terrain. The canvas is rendered at exactly viewport
 * size (same backing buffer as the production hero) so the apparent
 * zoom level never changes. As the camera moves between anchors, we
 * push a UV offset into the shader: the texture-sampling region pans
 * diagonally, so the terrain *appears* to slide beneath us — but the
 * canvas dimensions are unchanged.
 *
 * anchor.x / anchor.y in `path.ts` are expressed as viewport-percent;
 * dividing by 100 converts to UV-space, since the canvas covers the
 * full viewport one-to-one.
 */
export function TerrainCanvas() {
  const shaderRef = useRef<GenerativeHeroWebGLHandle>(null);

  useCameraEffect((cam) => {
    shaderRef.current?.setCameraOffset(cam.x / 100, cam.y / 100);
  });

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <GenerativeHeroWebGL ref={shaderRef} />
    </div>
  );
}
