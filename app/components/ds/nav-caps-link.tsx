import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type NavCapsLinkProps = {
  href: string;
  /** External links open in a new tab and get rel=noopener noreferrer. */
  external?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "ref">;

/**
 * Mono caps link with letter-spacing-on-hover micro-interaction. The signature
 * primitive of this design system's navigation. Pairs naturally inside
 * <TopBar />, <Footer />, or <LinkRow />.
 *
 * Color resolves via --surface-fg-muted by default and shifts toward
 * --accent (terracotta) on hover. Surface-scope-aware.
 */
export function NavCapsLink({
  href,
  external,
  className = "",
  children,
  ...rest
}: NavCapsLinkProps) {
  const baseClasses =
    "font-mono text-11 font-medium uppercase tracking-widest text-[color:var(--surface-fg-muted)] transition-[color,letter-spacing] duration-[var(--dur-base)] ease-out hover:tracking-mono-caps hover:text-[color:var(--accent)]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className}`}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
