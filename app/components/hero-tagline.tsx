"use client";

import { useRef } from "react";
import { useCameraEffect } from "../lib/camera/scroll-controller";

/**
 * Three-line hero tagline (`Agentic systems. · Generative UI. · Visual
 * interpretability.`). Lives outside the in-flow hero column so it does
 * NOT contribute to the camera's scroll budget — visitors don't have to
 * scroll past it to leave the hero.
 *
 * Fades out the moment the camera begins to move (progress > 0) so it
 * never visually competes with the section cards as they fly in.
 */
export function HeroTagline({
  firaClassName,
}: Readonly<{ firaClassName: string }>) {
  const ref = useRef<HTMLDivElement>(null);

  useCameraEffect((cam) => {
    const el = ref.current;
    if (!el) return;
    // Fade across the first ~12% of progress — gone by the time anchor 1
    // starts drifting in. Cubic easing for a softer departure than linear.
    const t = Math.max(0, Math.min(1, cam.progress / 0.12));
    const opacity = 1 - t * t * t;
    el.style.opacity = `${opacity}`;
    el.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
  });

  return (
    <div
      ref={ref}
      className="fixed bottom-0 left-1/2 z-10 -translate-x-1/2 px-6 pb-14 will-change-[opacity]"
      style={{ opacity: 1 }}
    >
      <div
        className="w-fit max-w-[min(100%,22rem)] rounded-md px-7 py-3.5 text-center sm:max-w-[min(100%,28rem)] sm:px-9"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div
          className={`flex flex-col items-center gap-1 text-[11px] font-normal uppercase leading-relaxed text-white/88 sm:text-xs [text-shadow:0_1px_12px_rgba(0,0,0,0.85)] ${firaClassName}`}
        >
          <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
            Agentic systems.
          </span>
          <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
            Generative UI.
          </span>
          <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
            Visual interpretability.
          </span>
        </div>
      </div>
    </div>
  );
}
