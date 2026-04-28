import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Children } from "react";

type LinkRowProps = {
  /** Glyph between items. Default `·` per the DS specimen. */
  separator?: ReactNode;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"ul">, "children">;

/**
 * Horizontal inline link list with a faint separator glyph between items.
 * Children are typically <NavCapsLink /> nodes but anything renderable
 * works. Separators are decorative (aria-hidden).
 */
export function LinkRow({
  separator = "·",
  className = "",
  children,
  ...rest
}: LinkRowProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <ul
      {...rest}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}
    >
      {items.map((child, idx) => (
        <li
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className="flex items-center gap-x-3"
        >
          {child}
          {idx < items.length - 1 ? (
            <span aria-hidden className="text-[color:var(--surface-fg-faint)]">
              {separator}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
