import type { ComponentPropsWithoutRef } from "react";

type CaretProps = {
  /** Tracks the parent text color when true, else uses --accent. */
  inheritColor?: boolean;
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

/**
 * Step-blink underscore caret. Driven by the `.immersive-caret-blink`
 * keyframes already defined in app/global.css (1.08s step-end infinite).
 * Honors prefers-reduced-motion via the same global rule.
 */
export function Caret({ inheritColor = false, className = "", ...rest }: CaretProps) {
  return (
    <span
      aria-hidden
      {...rest}
      className={`immersive-caret-blink inline-block ${
        inheritColor ? "" : "text-[color:var(--accent)]"
      } ${className}`}
    >
      _
    </span>
  );
}
