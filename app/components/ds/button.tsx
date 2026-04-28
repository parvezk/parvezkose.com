import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type DsButtonVariant = "ghost" | "framed" | "terminal";

type ButtonProps = {
  variant?: DsButtonVariant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

/**
 * Three button atoms per the DS specimen. None default to a heavy fill;
 * the system favors restraint.
 *
 *   ghost     — text-only, tracking-widens-on-hover, accent-on-hover
 *   framed    — hairline border, no fill, accent border + text on hover
 *   terminal  — `[+] Label` mono affordance used by collapsibles
 */
export function Button({
  variant = "ghost",
  type = "button",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center gap-1.5 font-mono text-11 font-medium uppercase tracking-widest cursor-pointer transition-[color,border-color,letter-spacing,background-color] duration-[var(--dur-base)] ease-out disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses: Record<DsButtonVariant, string> = {
    ghost:
      "px-0 py-1 text-[color:var(--surface-fg-muted)] hover:tracking-mono-caps hover:text-[color:var(--accent)]",
    framed:
      "rounded-sm border border-[color:var(--surface-border)] px-3 py-1.5 text-[color:var(--surface-fg-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
    terminal:
      "px-0 py-1 text-[color:var(--surface-fg-muted)] hover:text-[color:var(--accent)] tracking-wide",
  };

  return (
    <button
      type={type}
      {...rest}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
