"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ANCHORS,
  FLIGHT_DURATION,
  FLIGHT_EASE,
  SCROLL_SCRUB,
  SCROLL_VH_PER_ANCHOR,
  SEGMENT_COUNT,
  sampleCamera,
  type CameraSample,
} from "./path";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DESKTOP_QUERY = "(min-width: 1024px)";

const HERO_SAMPLE: CameraSample = {
  x: 0, y: 0, scale: 1,
  progress: 0, segmentT: 0, segmentEase: 0,
  segmentIndex: 0, nearestAnchor: 0, altitude: 0,
};

type CameraSubscriber = (sample: CameraSample) => void;

type CameraApi = Readonly<{
  ref: RefObject<CameraSample>;
  subscribe: (fn: CameraSubscriber) => () => void;
  flyTo: (anchorId: number) => void;
  cameraMode: boolean;
  /**
   * False during SSR + first client render. Flips to true after first
   * useLayoutEffect — guards consumers from hydration mismatches when
   * camera-mode JSX differs from simple-mode JSX.
   */
  mounted: boolean;
  /** Internal: track component installs its trigger range against this ref. */
  _trackRef: RefObject<HTMLDivElement | null>;
  /** Internal: track component flips this once its trigger is live. */
  _setCameraMode: (next: boolean) => void;
  /** Internal: subscribers fired by the track component on each scroll tick. */
  _emit: (sample: CameraSample) => void;
}>;

const CameraContext = createContext<CameraApi | null>(null);

export function useCamera(): CameraApi {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCamera must be used within <CameraProvider>");
  return ctx;
}

/**
 * Subscribe to per-tick camera updates with direct-DOM-mutation callback.
 * Fires immediately on mount with current state so consumers paint without
 * a flash of unset transform.
 */
export function useCameraEffect(fn: CameraSubscriber): void {
  const { subscribe, ref } = useCamera();
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useLayoutEffect(() => {
    fnRef.current(ref.current);
    return subscribe((s) => fnRef.current(s));
  }, [subscribe, ref]);
}

/** Re-renders the consumer only when the nearest anchor changes. */
export function useNearestAnchor(): number {
  const { subscribe, ref } = useCamera();
  const [active, setActive] = useState(() => ref.current.nearestAnchor);
  useEffect(() => {
    return subscribe((s) => {
      setActive((prev) => (prev === s.nearestAnchor ? prev : s.nearestAnchor));
    });
  }, [subscribe]);
  return active;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type CameraProviderProps = Readonly<{ children: ReactNode }>;

/**
 * Owns camera context: state ref, subscribers, flyTo, and the camera-mode
 * flag. The actual ScrollTrigger that drives sample updates is installed
 * by `<CameraScrollTrack>` against its own DOM ref — that way the camera
 * only fires while the user is scrolling through the section territory,
 * not the hero block above it.
 */
export function CameraProvider({ children }: CameraProviderProps) {
  const stateRef = useRef<CameraSample>(HERO_SAMPLE);
  const subsRef = useRef<Set<CameraSubscriber>>(new Set());
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const api = useMemo<CameraApi>(() => ({
    ref: stateRef,
    subscribe: (fn) => {
      subsRef.current.add(fn);
      return () => {
        subsRef.current.delete(fn);
      };
    },
    flyTo: (anchorId: number) => {
      const i = ANCHORS.findIndex((a) => a.id === anchorId);
      if (i < 0) return;

      // Without camera mode, fall back to anchor-id targeted DOM scroll.
      if (!cameraModeRef.current) {
        const el = document.getElementById(`anchor-${ANCHORS[i].slug}`);
        if (el) {
          el.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
        return;
      }

      // Trigger spans the full document, so target scrollY is just a
      // fraction of the document's scrollable range.
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetProgress = i / SEGMENT_COUNT;
      const targetY = targetProgress * docHeight;

      const startY = window.scrollY;
      const obj = { y: startY };
      gsap.to(obj, {
        y: targetY,
        duration: FLIGHT_DURATION,
        ease: FLIGHT_EASE,
        onUpdate: () => window.scrollTo(0, obj.y),
        overwrite: "auto",
      });
    },
    cameraMode,
    mounted,
    _trackRef: trackRef,
    _setCameraMode: setCameraMode,
    _emit: (sample) => {
      stateRef.current = sample;
      subsRef.current.forEach((fn) => fn(sample));
    },
  }), [cameraMode, mounted]);

  return (
    <CameraContext.Provider value={api}>{children}</CameraContext.Provider>
  );
}

/**
 * Renders the (invisible) tall scroll spacer that drives the camera. Lives
 * inline in document flow AFTER the hero so the hero gets a natural beat
 * of reading time before scroll begins moving the camera.
 *
 * Owns the ScrollTrigger lifecycle. On mobile / reduced-motion the trigger
 * stays disabled and the spacer collapses to 0 — sections render in normal
 * flow under their own height.
 */
export function CameraScrollTrack() {
  const { _trackRef, _setCameraMode, _emit } = useCamera();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const track = _trackRef.current;
    if (!track) return;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let trigger: ScrollTrigger | null = null;

    const teardown = () => {
      if (trigger) {
        trigger.kill();
        trigger = null;
      }
      gsap.killTweensOf(window);
      _emit(HERO_SAMPLE);
    };

    const setup = () => {
      teardown();
      if (!desktop.matches || reducedMq.matches) {
        _setCameraMode(false);
        return;
      }
      _setCameraMode(true);

      trigger = ScrollTrigger.create({
        // Trigger the full document so camera motion begins on the very
        // first scroll tick, before the hero has finished leaving the
        // viewport. Track sits in flow purely to extend doc height.
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: SCROLL_SCRUB,
        onUpdate: (self) => {
          _emit(sampleCamera(self.progress));
        },
      });
      ScrollTrigger.refresh();
    };

    setup();

    // Refresh ScrollTrigger when document height changes — e.g. when the
    // hero accordion opens/closes and shifts the track's offsetTop. Without
    // this, anchor-link flights land at stale scroll positions until the
    // next window resize.
    let rafId = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    ro.observe(document.body);

    desktop.addEventListener("change", setup);
    reducedMq.addEventListener("change", setup);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      desktop.removeEventListener("change", setup);
      reducedMq.removeEventListener("change", setup);
      teardown();
    };
  }, [_trackRef, _setCameraMode, _emit]);

  // Total scroll range: one viewport per segment, plus a fractional buffer
  // so the final settle hold has scroll room. cameraMode flips height to 0
  // off-desktop, under prefers-reduced-motion, or before mount (avoids
  // hydration mismatch).
  const { cameraMode, mounted } = useCamera();
  const active = mounted && cameraMode;
  const totalVh = active ? SCROLL_VH_PER_ANCHOR * SEGMENT_COUNT * 100 : 0;

  return (
    <div
      ref={_trackRef}
      aria-hidden
      className="pointer-events-none w-full"
      style={{ height: active ? `${totalVh}vh` : 0 }}
    />
  );
}
