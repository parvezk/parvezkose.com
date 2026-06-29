"use client";

import { useRef } from "react";
import { useCamera, useCameraEffect } from "../../lib/camera/scroll-controller";

// A wider bar gives the HUD more horizontal presence without enlarging
// the type. Doubles as the eye-catcher of the row.
const BAR_PX = 180;

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

  // Legibility on highly variable terrain (bright lava regions vs deep
  // shadow) without a black fill panel requires two things working
  // together:
  //   1. A layered text-shadow halo — sharp dark outline + soft falloff —
  //      paints a localized darkening *only behind the glyphs*, so light
  //      regions of the terrain don't bleed through but the HUD doesn't
  //      sit on top of a visible plate.
  //   2. A leading terracotta tick, mirroring the rail-glyph vocabulary
  //      from the [+] Design Philosophy CLI panel (┌ ◇ │ └). Anchors the
  //      HUD as a single unit and re-uses the existing palette accent.
  const haloShadow =
    "0 0 1px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.55)";

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 z-30 px-6 py-5 sm:px-7 sm:py-6"
      role="presentation"
      aria-hidden
    >
      <div
        className="font-mono text-[10px] font-medium leading-none tracking-[0.18em] text-[color:var(--neutral-latte)]"
        style={{ textShadow: haloShadow }}
      >
        <div className="flex items-center gap-2.5">
          {/* Leading terracotta tick — anchors the HUD as one unit. */}
          <span
            aria-hidden
            className="block h-[10px] w-[2px] bg-[color:var(--accent-terracotta)]"
            style={{
              boxShadow:
                "0 0 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.95)",
            }}
          />
          {/* Tinting the label terracotta makes it read as the lead
              element without enlarging it — accent color does the work
              that a bigger font would have done. */}
          <span className="text-[color:var(--accent-terracotta)]">SCROLL</span>
          {/* Long, slim bar — the HUD's eye-catcher. ~180px is wide
              enough to register peripherally; 3px tall keeps the line
              architectural. */}
          <span
            aria-hidden
            className="relative inline-block h-[3px] overflow-hidden rounded-[1px] bg-white/20"
            style={{
              width: `${BAR_PX}px`,
              boxShadow:
                "0 0 6px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <span
              ref={fillRef}
              className="absolute inset-y-0 left-0 block w-full origin-left bg-[color:var(--accent-terracotta)]"
              style={{
                transform: "scaleX(0)",
                boxShadow: "0 0 8px rgba(226,114,91,0.65)",
              }}
            />
          </span>
          <span
            ref={pctRef}
            className="tabular-nums text-white"
          >
            000%
          </span>
          {cameraMode && (
            <>
              <span className="text-[color:var(--neutral-latte)]/45">|</span>
              <span className="text-[color:var(--neutral-latte)]/75">
                T <span ref={tRef} className="tabular-nums text-white">0.00</span>
              </span>
              <span className="text-[color:var(--neutral-latte)]/75">
                D <span ref={dRef} className="tabular-nums text-white">0.00</span>
              </span>
              <span className="text-[color:var(--neutral-latte)]/75">
                N <span ref={nRef} className="tabular-nums text-white">0.00</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
