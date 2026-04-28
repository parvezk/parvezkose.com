import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type PillTone = "terra" | "gold" | "latte" | "wine" | "framed";

type PillProps = {
  tone?: PillTone;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

/**
 * Mono caps tag with a low-opacity tonal fill. Five variants per the DS
 * specimen: terracotta (default accent), golden (sparse), latte
 * (secondary muted), wine (recessive), and framed (border-only, no fill).
 *
 * Each tone uses the accent color at 12% so the pill never competes with
 * primary copy. Border resolves to --surface-border for the framed variant.
 */
export function Pill({ tone = "terra", className = "", children, ...rest }: PillProps) {
  const toneClasses: Record<PillTone, string> = {
    terra:
      "bg-[color-mix(in_oklab,var(--accent-terracotta)_12%,transparent)] text-[color:var(--accent-terracotta)] border-[color:transparent]",
    gold: "bg-[color-mix(in_oklab,var(--accent-golden)_12%,transparent)] text-[color:var(--accent-golden)] border-[color:transparent]",
    latte:
      "bg-[color-mix(in_oklab,var(--neutral-latte)_12%,transparent)] text-[color:var(--neutral-latte)] border-[color:transparent]",
    wine: "bg-[color-mix(in_oklab,var(--wine-wine)_18%,transparent)] text-[color:var(--neutral-latte)] border-[color:transparent]",
    framed:
      "bg-transparent text-[color:var(--surface-fg-muted)] border-[color:var(--surface-border)]",
  };

  return (
    <span
      {...rest}
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 font-mono text-10 font-medium uppercase tracking-widest ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
