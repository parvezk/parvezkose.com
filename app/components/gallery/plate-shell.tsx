"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

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
}>;

export function PlateShell({
  index,
  label,
  kind,
  motionTier = "restrained",
  style,
  children,
}: PlateShellProps) {
  const [hover, setHover] = useState(false);
  const elevated = motionTier === "elevated";
  const scale = elevated && hover ? 1.04 : 1;
  const lift = hover ? -6 : 0;

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
        transform: `translate3d(0, ${lift}px, 0) scale(${scale})`,
        transition:
          "transform 420ms cubic-bezier(0.25,0.46,0.45,0.94), border-color 240ms cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 320ms cubic-bezier(0.25,0.46,0.45,0.94)",
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
