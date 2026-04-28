import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FooterProps = {
  /** Left slot — typically `© YYYY · Owner`. */
  left: ReactNode;
  /** Right slot — typically location, build hash, or a <LinkRow />. */
  right?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"footer">, "children">;

/**
 * Hairline-topped footer strip. Mono micro caps, faint surface-aware text.
 * Use inside a <Surface> wrapper. Pairs with <TopBar />.
 */
export function Footer({ left, right, className = "", ...rest }: FooterProps) {
  return (
    <footer
      {...rest}
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[color:var(--surface-border)] bg-[color:var(--surface-bg)] px-6 py-4 font-mono text-11 font-medium uppercase tracking-widest text-[color:var(--surface-fg-faint)] ${className}`}
    >
      <span>{left}</span>
      {right ? <span>{right}</span> : null}
    </footer>
  );
}
