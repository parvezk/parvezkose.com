"use client";

import { useRef } from "react";
import { useCamera, useCameraEffect } from "../../lib/camera/scroll-controller";

const BAR_CELLS = 16;

/**
 * Bottom-left telemetry HUD — `SCROLL [bar] [%] | T [tween] D [drift] N [noise]`.
 *
 * Reads as ambient telemetry from the "vehicle" — reinforces the
 * camera/aircraft metaphor. Per the brief, T D N are decorative now that
 * scroll-driven shader uniforms are killed; they're driven from the camera
 * sample (segmentEase, |x|, scale-1) so the digits feel alive without
 * implying coupling.
 *
 * Mobile + reduced-motion: only `SCROLL [bar] [%]` renders. Direct DOM
 * mutation; no React renders per frame.
 */
export function ProgressBar() {
  const { cameraMode } = useCamera();
  const fillRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const dRef = useRef<HTMLSpanElement>(null);
  const nRef = useRef<HTMLSpanElement>(null);

  useCameraEffect((cam) => {
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${cam.progress})`;
    }
    if (pctRef.current) {
      pctRef.current.textContent = `${Math.round(cam.progress * 100)
        .toString()
        .padStart(3, "0")}%`;
    }
    if (cameraMode) {
      if (tRef.current) tRef.current.textContent = cam.segmentEase.toFixed(2);
      if (dRef.current) {
        const drift = Math.hypot(cam.x, cam.y) / 25; // normalized 0..~1
        dRef.current.textContent = drift.toFixed(2);
      }
      if (nRef.current) {
        const noise = (cam.scale - 1) * 25; // 0..1 across full path
        nRef.current.textContent = noise.toFixed(2);
      }
    }
  });

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 z-30 px-6 py-5 sm:px-7 sm:py-6"
      role="presentation"
      aria-hidden
    >
      <div className="font-mono text-[10px] leading-none tracking-[0.14em] text-[color:var(--neutral-latte)]/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2">
          <span className="text-white/55">SCROLL</span>
          <span
            aria-hidden
            className="relative inline-block h-[2px] overflow-hidden rounded-[1px] bg-white/15"
            style={{ width: `${BAR_CELLS * 6}px` }}
          >
            <span
              ref={fillRef}
              className="absolute inset-y-0 left-0 block w-full origin-left bg-[color:var(--accent-terracotta)]"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <span ref={pctRef} className="tabular-nums text-white/85">000%</span>
          {cameraMode && (
            <>
              <span className="text-white/25">|</span>
              <span className="text-white/55">
                T <span ref={tRef} className="tabular-nums text-white/80">0.00</span>
              </span>
              <span className="text-white/55">
                D <span ref={dRef} className="tabular-nums text-white/80">0.00</span>
              </span>
              <span className="text-white/55">
                N <span ref={nRef} className="tabular-nums text-white/80">0.00</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
