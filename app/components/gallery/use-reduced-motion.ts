"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce` and re-renders when the user
 * toggles it (DevTools → Rendering → Emulate prefers-reduced-motion is
 * a common test path).
 *
 * Returns false during SSR + the first client render so server and
 * client agree on initial markup. After useEffect runs we read the
 * actual media query and update.
 *
 * Consumers should use this for instant-on (skip fades / staggers /
 * sustained-hover timers) rather than for hiding content — keeping
 * everything reachable is non-negotiable per the brief.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
