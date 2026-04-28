import type { ComponentPropsWithoutRef } from "react";

type DividerProps = {
  /** Horizontal inset (left + right). Defaults to 24px per DS spec. */
  inset?: number | string;
} & Omit<ComponentPropsWithoutRef<"hr">, "children">;

/**
 * 1px hairline divider with consistent inset. Color resolves to
 * --surface-border so it adapts to immersive (warm-tinted) and classic
 * (cool-gray) surfaces.
 */
export function Divider({ inset = 24, className = "", style, ...rest }: DividerProps) {
  const insetValue = typeof inset === "number" ? `${inset}px` : inset;
  return (
    <hr
      {...rest}
      style={{
        marginLeft: insetValue,
        marginRight: insetValue,
        ...style,
      }}
      className={`h-px border-0 bg-[color:var(--surface-border)] ${className}`}
    />
  );
}
