"use client";

import posthog from "posthog-js";
import { Fragment } from "react";
import { ANCHORS } from "../../lib/camera/path";
import { useCamera, useNearestAnchor } from "../../lib/camera/scroll-controller";

/**
 * Top-right anchor navigation. The Home anchor sits first so a visitor
 * who lands deep in the camera path can always return to the start.
 *
 * Type matches the `[+] Menu` button in the hero (Fira, text-sm /
 * sm:text-base, normal case, hover-tracks-wider) so the nav reads as
 * part of the same visual vocabulary instead of as system chrome.
 *
 * In camera mode, click triggers a GSAP-eased flight to the target
 * anchor. In simple mode, click smooth-scrolls to the section's DOM
 * anchor. The active anchor is highlighted at full white; the rest sit
 * dimmer so the row reads as "you are here".
 */
export function AnchorNav({
  firaClassName,
}: Readonly<{ firaClassName: string }>) {
  const { flyTo } = useCamera();
  const active = useNearestAnchor();

  return (
    <nav
      aria-label="Section anchors"
      data-agent-keepout
      className={`pointer-events-auto fixed right-0 top-0 z-30 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-x-3 gap-y-2 px-5 py-3.5 pl-10 text-[11px] font-normal uppercase tracking-[0.06em] sm:text-[12px] ${firaClassName}`}
      style={{
        background:
          "linear-gradient(270deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0) 100%)",
      }}
    >
      {ANCHORS.map((anchor, i) => {
        const isActive = active === anchor.id;
        return (
          <Fragment key={anchor.slug}>
            {i > 0 && (
              <span aria-hidden className="text-white/30 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                ·
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                flyTo(anchor.id);
                posthog.capture("aerial_anchor_clicked", {
                  anchor: anchor.slug,
                  source: "top_right_nav",
                });
              }}
              aria-current={isActive ? "true" : undefined}
              className={`cursor-pointer uppercase transition-[color,text-shadow,letter-spacing,font-weight] duration-200 ease-out hover:tracking-[0.16em] hover:text-white sm:hover:tracking-[0.2em] ${
                isActive
                  ? "font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_10px_rgba(226,114,91,0.35)]"
                  : "font-normal text-white/65 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]"
              }`}
            >
              {anchor.label}
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
