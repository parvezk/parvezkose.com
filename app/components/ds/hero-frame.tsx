import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HeroFrameProps = {
  /** Bracket inset from each corner. Defaults to 12px. */
  bracketLength?: number;
  /** Bracket stroke color. Defaults to --surface-border. */
  bracketColor?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

/**
 * Corner-bracket frame. Four 12px L-marks, one per corner, drawn with
 * absolute-positioned ::before/::after layers per child <span>. Tokenizes
 * the immersive hero's "you-are-on-system" frame without locking us to
 * the WebGL hero specifically.
 */
export function HeroFrame({
  bracketLength = 12,
  bracketColor = "var(--surface-border)",
  className = "",
  style,
  children,
  ...rest
}: HeroFrameProps) {
  const len = `${bracketLength}px`;
  const stroke = bracketColor;

  type Corner = {
    name: "tl" | "tr" | "bl" | "br";
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    borderLeft?: string;
  };

  const corners: Corner[] = [
    { name: "tl", top: 0, left: 0, borderTop: stroke, borderLeft: stroke },
    { name: "tr", top: 0, right: 0, borderTop: stroke, borderRight: stroke },
    { name: "bl", bottom: 0, left: 0, borderBottom: stroke, borderLeft: stroke },
    { name: "br", bottom: 0, right: 0, borderBottom: stroke, borderRight: stroke },
  ];

  return (
    <div
      {...rest}
      className={`relative ${className}`}
      style={{ ...style }}
    >
      {corners.map((c) => (
        <span
          key={c.name}
          aria-hidden
          style={{
            position: "absolute",
            width: len,
            height: len,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            borderTop: c.borderTop ? `1px solid ${c.borderTop}` : undefined,
            borderRight: c.borderRight ? `1px solid ${c.borderRight}` : undefined,
            borderBottom: c.borderBottom ? `1px solid ${c.borderBottom}` : undefined,
            borderLeft: c.borderLeft ? `1px solid ${c.borderLeft}` : undefined,
            pointerEvents: "none",
          }}
        />
      ))}
      {children}
    </div>
  );
}
