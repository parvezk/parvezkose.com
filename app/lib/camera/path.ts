/**
 * Aerial camera path — the four anchor coordinates the camera flies between.
 *
 * Coordinates are CSS transform-percent values applied to the terrain
 * wrapper. The wrapper extends `-inset-[18%]` beyond the viewport so the
 * canvas always covers visible space at any anchor + the gentle scale.
 *
 * Brief's table values were directional (which quadrant relative to the
 * predecessor); the percentages here preserve that pattern at magnitudes
 * that fit within the wrapper's overscan headroom.
 */
export type Anchor = Readonly<{
  id: number;
  slug: string;
  /** Top-right anchor-nav label. */
  label: string;
  /** href used by the section card's primary link, where applicable. */
  href: string | null;
  /** translateX percent applied to the terrain wrapper. */
  x: number;
  /** translateY percent applied to the terrain wrapper (negative = camera moves up). */
  y: number;
  /** Camera-altitude scale on the terrain wrapper (1.0 → 1.04 across path). */
  scale: number;
}>;

/**
 * Coordinates use perfectly balanced 50/50 deltas between anchors so each
 * leg of the path feels equally diagonal, never lopsided horizontal.
 * Anchor 3 descends right (positive x, less negative y) to break the
 * up-left/up-right repeat — clicking it doesn't feel like another upward
 * sweep.
 *
 *   hero  → think  : (-7, -7)   upper-left   (Δ -7, -7)
 *   think → build  : (+7, -7)   upper-right  (Δ +7, -7)
 *   build → ahead  : (+10, +10) lower-right  (Δ +10, +10)
 *
 * Scale tracks altitude: peaks at anchor 2 (camera highest), descends
 * slightly toward anchor 3.
 */
export const ANCHORS: ReadonlyArray<Anchor> = [
  { id: 0, slug: "hero",  label: "Home",           href: null,              x:   0,   y:   0,   scale: 1.000 },
  { id: 1, slug: "think", label: "How I think",    href: "/design-system/", x:  -7,   y:  -7,   scale: 1.020 },
  { id: 2, slug: "build", label: "How I build",    href: null,              x:   0,   y: -14,   scale: 1.040 },
  { id: 3, slug: "ahead", label: "Thinking Ahead", href: null,              x:  10,   y:  -4,   scale: 1.012 },
];

/** Anchors visited as content sections (skips hero). */
export const SECTION_ANCHORS = ANCHORS.slice(1);

export const SEGMENT_COUNT = ANCHORS.length - 1;

/**
 * Settle hold inside each segment: the first and last `SETTLE_RATIO` of a
 * segment's progress freezes at the anchor, giving the user a beat to read
 * before the camera drifts toward the next anchor.
 */
export const SETTLE_RATIO = 0.13;

/** GSAP scrub smoothing — slight smoothing reads less choppy on trackpads. */
export const SCROLL_SCRUB = 1.2;

/** Anchor-link click flight duration (seconds). */
export const FLIGHT_DURATION = 1.4;

/** Easing for both scrub-eased segments and flight tweens. */
export const FLIGHT_EASE = "power2.inOut";

/**
 * Track height contribution per inter-anchor segment, expressed as
 * multiples of viewport height. The full ScrollTrigger range spans the
 * entire document (top top → bottom bottom) so the camera begins moving
 * the instant the user scrolls — by ~70vh of scroll the camera should be
 * at anchor 1, ~210vh at anchor 3.
 */
export const SCROLL_VH_PER_ANCHOR = 0.7;

/** power2.inOut easing applied to in-segment progress (0..1). */
export function easePower2InOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export type CameraSample = Readonly<{
  /** Eased translateX (% on terrain wrapper). */
  x: number;
  /** Eased translateY (% on terrain wrapper). */
  y: number;
  /** Eased scale on terrain wrapper. */
  scale: number;
  /** Raw scroll progress 0..1 across the entire path. */
  progress: number;
  /** 0..1 within the active segment (post-settle, pre-ease). */
  segmentT: number;
  /** Eased segment progress (0..1) used for arrival/departure math. */
  segmentEase: number;
  /** Index of the segment start anchor (0..SEGMENT_COUNT-1). */
  segmentIndex: number;
  /** Index of the anchor the camera is currently nearest. */
  nearestAnchor: number;
  /** Climb altitude 0..1, computed from current eased position along the path. */
  altitude: number;
}>;

/**
 * Convert raw 0..1 scroll progress into a camera sample by:
 *   1. Mapping to a segment + in-segment t.
 *   2. Applying the settle hold at each end of the segment.
 *   3. Easing what remains with power2.inOut.
 *   4. Lerping translation + scale between the two segment anchors.
 */
export function sampleCamera(progress: number): CameraSample {
  const p = Math.max(0, Math.min(1, progress));
  const segIdx = Math.min(SEGMENT_COUNT - 1, Math.floor(p * SEGMENT_COUNT));
  const segP = p * SEGMENT_COUNT - segIdx;

  let t: number;
  if (segP <= SETTLE_RATIO) t = 0;
  else if (segP >= 1 - SETTLE_RATIO) t = 1;
  else t = (segP - SETTLE_RATIO) / (1 - 2 * SETTLE_RATIO);

  const ease = easePower2InOut(t);
  const a = ANCHORS[segIdx];
  const b = ANCHORS[segIdx + 1];

  const x = a.x + (b.x - a.x) * ease;
  const y = a.y + (b.y - a.y) * ease;
  const scale = a.scale + (b.scale - a.scale) * ease;
  const altitude = (segIdx + ease) / SEGMENT_COUNT;

  return {
    x, y, scale,
    progress: p,
    segmentT: t,
    segmentEase: ease,
    segmentIndex: segIdx,
    nearestAnchor: ease < 0.5 ? segIdx : segIdx + 1,
    altitude,
  };
}

/**
 * Card visibility window. Each section card belongs to one anchor; it's
 * visible from the tail of the inbound segment through the early settle
 * of the outbound segment.
 *
 * Returns 0..1 opacity given the current camera sample and the anchor id
 * the card is anchored to.
 */
export function cardOpacity(sample: CameraSample, anchorId: number): number {
  // Inbound segment (predecessor → this anchor): segmentIndex = anchorId - 1.
  // Card fades in over segmentEase 0.70 → 1.00.
  if (sample.segmentIndex === anchorId - 1) {
    const t = (sample.segmentEase - 0.70) / 0.30;
    return Math.max(0, Math.min(1, t));
  }

  // Outbound segment (this anchor → successor): segmentIndex = anchorId.
  // Card stays at full opacity through the settle hold + early drift,
  // then fades out by segmentEase 0.30.
  if (sample.segmentIndex === anchorId) {
    if (sample.segmentEase <= 0.10) return 1;
    if (sample.segmentEase >= 0.30) return 0;
    return 1 - (sample.segmentEase - 0.10) / 0.20;
  }

  return 0;
}
