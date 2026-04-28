import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export type DsSurfaceMode = "immersive" | "classic";

type SurfaceProps<T extends ElementType> = {
  /**
   * Sets [data-surface="immersive|classic"] on the rendered element so the
   * design-system semantic vars (--surface-bg, --surface-fg, …) flip for the
   * subtree. Children can read either the surface vars or the explicit
   * --im-* / --classic-* tokens.
   */
  mode: DsSurfaceMode;
  as?: T;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function Surface<T extends ElementType = "div">({
  mode,
  as,
  children,
  ...rest
}: SurfaceProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag data-surface={mode} {...rest}>
      {children}
    </Tag>
  );
}
