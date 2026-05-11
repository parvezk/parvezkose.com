"use client";

import { useRef } from "react";
import { GenerativeHeroWebGL } from "../generative-hero-webgl";
import { useCameraEffect } from "../../lib/camera/scroll-controller";

/**
 * Wraps the existing WebGL shader inside a transformed envelope. The
 * envelope sits at `inset:-25%` so the canvas is rendered 150% of the
 * viewport in each direction — the overscan needed for the camera's
 * largest translate (~16% on y) plus the 1.04 altitude-scale to keep the
 * canvas covering the viewport.
 *
 * The envelope's transform is mutated directly on each camera tick (no
 * React state) so scroll never blocks on rendering. The shader's own
 * uniforms are untouched — its cursor diffusion + ambient loop continue
 * exactly as in the standalone hero. Per the brief: the terrain is
 * terrain; it does not deform when you scroll.
 */
export function TerrainCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useCameraEffect((cam) => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${cam.x}%, ${cam.y}%, 0) scale(${cam.scale})`;
  });

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        ref={wrapperRef}
        className="absolute will-change-transform"
        style={{
          inset: "-25%",
          transformOrigin: "50% 50%",
          // Initial transform avoids the unstyled flash before the first tick.
          transform: "translate3d(0%, 0%, 0) scale(1)",
        }}
      >
        <GenerativeHeroWebGL />
      </div>
    </div>
  );
}
