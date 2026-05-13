"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Wall-label anchor: positioning + max-width within the plate's clipped
 * well. Per the handoff each plate has its own anchor that lives in
 * its negative space (e.g. UI Kit places the label bottom-right; Brand
 * places it top-right to clear the wordmark).
 */
export type RationaleAnchor = Readonly<{
  /** Inline style overrides for absolute positioning + text-align. */
  style: CSSProperties;
  /** Cap on label width so it sits within the plate's negative space. */
  maxWidth: number;
}>;

/**
 * Shared plate chrome. Per the handoff:
 *   - bg rgba(10,10,10,0.62) + backdrop-blur(14px) saturate(120%)
 *   - 1px latte border (rgba(200,173,143,0.18)) → terracotta on hover
 *   - 4 corner brackets (latte 14px → terracotta 18px on hover)
 *   - 1px latte hairline at bottom:38px
 *   - Footer row at bottom:10px with index label + kind label
 *
 * Plates are NOT clickable per the current direction — they're display
 * specimens, not navigation. So this is a `<div>`, not an `<a>`.
 */

type PlateKind = "interface" | "palette" | "wordmark" | "specimen" | "atoms";

export type PlateShellProps = Readonly<{
  /** Two-digit ordinal shown bottom-left of the plate footer. */
  index: string;
  /** Plate title shown to the left of the kind label. */
  label: string;
  /** Kind shown to the right of the plate footer. */
  kind: PlateKind;
  /**
   * "elevated" plates get a 1.04 scale on hover + a deeper drop shadow.
   * Reserved for the Components plate per the spec.
   */
  motionTier?: "restrained" | "ambient" | "elevated";
  /** Grid column / row placement passed via inline style. */
  style?: CSSProperties;
  /**
   * Visible specimen content; lives inside a 14px / 38px-clipped well.
   * Accepts either static JSX or a function-of-hover so individual
   * plate specimens can drive their internal motion off the shell's
   * hover state (caret blink, swatch crescent, etc).
   */
  children: ReactNode | ((hover: boolean) => ReactNode);
  /**
   * Wall-label rationale that fades in after 250ms sustained hover.
   * Combined with `rationaleAnchor` to position the label inside the
   * plate's negative space. Skipped (no render) if either is omitted.
   */
  rationale?: string;
  rationaleAnchor?: RationaleAnchor;
  /**
   * Per-plate cursor-parallax offset in pixels. Composed into the
   * plate's transform alongside the hover lift + elevated scale.
   * Driven from a shared cursor field at the gallery level.
   */
  parallaxOffset?: { x: number; y: number };
  /**
   * Mount-time entry-stagger delay in ms. The plate animates from
   * `translateY(16px) + opacity(0)` to its rest state on mount, using
   * this delay to walk the eye through the cluster.
   */
  entryDelayMs?: number;
}>;

export function PlateShell({
  index,
  label,
  kind,
  motionTier = "restrained",
  style,
  children,
  rationale,
  rationaleAnchor,
  parallaxOffset,
  entryDelayMs = 0,
}: PlateShellProps) {
  const [hover, setHover] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  // Plates mount hidden + translated; flips to visible after entryDelayMs.
  // Avoids hydration mismatch by deferring the reveal to client effect.
  const [entered, setEntered] = useState(false);
  const reduced = useReducedMotion();
  const rationaleTimerRef = useRef<number | null>(null);

  const elevated = motionTier === "elevated";
  const scale = elevated && hover ? 1.04 : 1;
  const lift = hover ? -6 : 0;
  const px = parallaxOffset?.x ?? 0;
  const py = parallaxOffset?.y ?? 0;

  // Sustained-hover timer for the wall label. Reduced motion: instant.
  useEffect(() => {
    if (rationaleTimerRef.current) {
      window.clearTimeout(rationaleTimerRef.current);
      rationaleTimerRef.current = null;
    }
    if (!hover) {
      setShowRationale(false);
      return;
    }
    if (reduced) {
      setShowRationale(true);
      return;
    }
    rationaleTimerRef.current = window.setTimeout(() => {
      setShowRationale(true);
    }, 250);
    return () => {
      if (rationaleTimerRef.current) {
        window.clearTimeout(rationaleTimerRef.current);
      }
    };
  }, [hover, reduced]);

  // Entry stagger: flip `entered` on mount after the per-plate delay.
  // Reduced motion: instant, no delay, no translate/opacity transition.
  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    const t = window.setTimeout(() => setEntered(true), entryDelayMs);
    return () => window.clearTimeout(t);
  }, [entryDelayMs, reduced]);

  const entryY = entered ? 0 : 16;
  const entryOpacity = entered ? 1 : 0;
  const showWallLabel = Boolean(rationale && rationaleAnchor);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      role="group"
      aria-label={`${label} specimen`}
      style={{
        position: "relative",
        background: "rgba(10,10,10,0.62)",
        backdropFilter: "blur(14px) saturate(120%)",
        WebkitBackdropFilter: "blur(14px) saturate(120%)",
        border: `1px solid ${hover ? "rgba(226,114,91,0.55)" : "rgba(200,173,143,0.18)"}`,
        transformOrigin: "center center",
        // Composed transform: parallax (cursor) + lift (hover) + entry
        // (mount stagger) on translate; scale separately. translate3d
        // ensures GPU compositing.
        transform: `translate3d(${px}px, ${lift + py + entryY}px, 0) scale(${scale})`,
        opacity: entryOpacity,
        transition: reduced
          ? "none"
          : `transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 360ms cubic-bezier(0.25,0.46,0.45,0.94), border-color 240ms cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 320ms cubic-bezier(0.25,0.46,0.45,0.94)`,
        boxShadow:
          hover && elevated
            ? "0 18px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(226,114,91,0.18)"
            : "0 4px 14px rgba(0,0,0,0.3)",
        zIndex: hover ? 5 : 1,
        color: "var(--im-text, #e8e4e0)",
        ...style,
      }}
    >
      <Brackets ignited={hover} />

      {/* Hairline separator above the footer row. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 38,
          height: 1,
          background: "rgba(200,173,143,0.14)",
        }}
      />

      {/* Clipped specimen well — content lives in this area. */}
      <div
        style={{
          position: "absolute",
          inset: "14px 14px 38px 14px",
          overflow: "hidden",
        }}
      >
        {typeof children === "function" ? children(hover) : children}

        {/* Sustained-hover wall label — fades in after 250ms hover, lives
            in the plate's negative space at the configured anchor. */}
        {showWallLabel && (
          <div
            aria-hidden={!showRationale}
            style={{
              position: "absolute",
              ...rationaleAnchor!.style,
              maxWidth: rationaleAnchor!.maxWidth,
              opacity: showRationale ? 1 : 0,
              transform: showRationale ? "translateY(0)" : "translateY(3px)",
              transition: reduced
                ? "none"
                : "opacity 280ms cubic-bezier(0.25,0.46,0.45,0.94), transform 360ms cubic-bezier(0.25,0.46,0.45,0.94)",
              pointerEvents: "none",
              fontFamily:
                "var(--font-family-mono), 'JetBrains Mono', monospace",
              fontSize: 9.5,
              lineHeight: 1.45,
              letterSpacing: "0.01em",
              color: "rgba(200,173,143,0.92)",
              textShadow:
                "0 1px 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.7)",
              zIndex: 8,
              padding: "5px 7px",
              background: "rgba(10,7,5,0.78)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid rgba(200,173,143,0.18)",
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily:
                  "var(--font-family-mono), 'JetBrains Mono', monospace",
                fontSize: 7.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent-terracotta)",
                marginBottom: 2,
              }}
            >
              ◇ wall label
            </span>
            <span style={{ display: "block" }}>{rationale}</span>
          </div>
        )}
      </div>

      {/* Footer row: "01 UI KIT  ·  interface". */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: "var(--font-family-mono, 'JetBrains Mono'), monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            gap: 6,
            color: hover
              ? "var(--accent-terracotta)"
              : "rgba(200,173,143,0.55)",
            transition: "color 220ms cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          <span>{index}</span>
          <span
            style={{
              color: hover ? "var(--neutral-latte)" : "rgba(200,173,143,0.85)",
              transition: "color 220ms cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            {label}
          </span>
        </span>
        <span style={{ color: "rgba(200,173,143,0.45)" }}>{kind}</span>
      </div>
    </div>
  );
}

/**
 * Four corner brackets — latte tone at rest, terracotta + 4px-longer
 * arms when the plate is hovered/focused. Mirrors the brackets pattern
 * from the immersive hero card so the gallery reads as part of the
 * same design language.
 */
function Brackets({ ignited }: { ignited: boolean }) {
  const color = ignited
    ? "var(--accent-terracotta)"
    : "rgba(232,228,224,0.55)";
  const size = ignited ? 18 : 14;
  const base: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    transition:
      "border-color 220ms cubic-bezier(0.25,0.46,0.45,0.94), width 220ms cubic-bezier(0.25,0.46,0.45,0.94), height 220ms cubic-bezier(0.25,0.46,0.45,0.94)",
    borderColor: color,
    pointerEvents: "none",
  };
  return (
    <>
      <span
        aria-hidden
        style={{
          ...base,
          top: 0,
          left: 0,
          borderLeft: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          top: 0,
          right: 0,
          borderRight: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          bottom: 0,
          left: 0,
          borderLeft: "1px solid",
          borderBottom: "1px solid",
        }}
      />
      <span
        aria-hidden
        style={{
          ...base,
          bottom: 0,
          right: 0,
          borderRight: "1px solid",
          borderBottom: "1px solid",
        }}
      />
    </>
  );
}
