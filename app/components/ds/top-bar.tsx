import type { ComponentPropsWithoutRef, ReactNode } from "react";

type TopBarProps = {
  /** Left slot — typically the wordmark / name lockup. */
  left: ReactNode;
  /** Right slot — typically a <LinkRow /> or terminal toggle. */
  right?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"header">, "children">;

/**
 * Sticky 48px header. Hairline bottom border, surface-aware background.
 * Use inside a <Surface mode="…"> wrapper to scope its tokens.
 */
export function TopBar({ left, right, className = "", ...rest }: TopBarProps) {
  return (
    <header
      {...rest}
      className={`sticky top-0 z-10 flex h-12 items-center justify-between border-b border-[color:var(--surface-border)] bg-[color:var(--surface-bg)] px-6 ${className}`}
    >
      <div className="font-mono text-13 font-medium tracking-snug text-[color:var(--surface-fg)]">
        {left}
      </div>
      {right ? <div className="flex items-center">{right}</div> : null}
    </header>
  );
}
