import type { ComponentPropsWithoutRef, ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"p">, "children">;

/**
 * Mono caps micro label. Uses the system's `--tracking-widest` (0.12em) and
 * `--text-11`, color `--surface-fg-muted` so it adapts to immersive/classic.
 */
export function Eyebrow({ className = "", ...rest }: EyebrowProps) {
  return (
    <p
      {...rest}
      className={`font-mono text-11 font-medium uppercase tracking-widest text-[color:var(--surface-fg-muted)] ${className}`}
    />
  );
}
