"use client";

import posthog from "posthog-js";
import { Fragment } from "react";
import { SECTION_ANCHORS } from "../../lib/camera/path";
import { useCamera, useNearestAnchor } from "../../lib/camera/scroll-controller";

/**
 * Top-right anchor navigation: How I think · How I build · Thinking Ahead.
 *
 * In camera mode, click triggers a GSAP-eased flight to the target anchor.
 * In simple mode, click smooth-scrolls to the section's DOM anchor. The
 * active anchor is dimmed to read as "you are here" without competing
 * with the hovered link.
 */
export function AnchorNav({ jetbrainsClassName }: Readonly<{ jetbrainsClassName: string }>) {
  const { flyTo } = useCamera();
  const active = useNearestAnchor();

  return (
    <nav
      aria-label="Section anchors"
      className={`pointer-events-auto fixed right-0 top-0 z-30 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-x-3 gap-y-2 px-4 py-3 pl-8 text-[11px] font-medium ${jetbrainsClassName}`}
      style={{
        background:
          "linear-gradient(270deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0) 100%)",
      }}
    >
      {SECTION_ANCHORS.map((anchor, i) => {
        const isActive = active === anchor.id;
        return (
          <Fragment key={anchor.slug}>
            {i > 0 && (
              <span aria-hidden className="text-white/30">·</span>
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
              className={`tracking-[0.04em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.12em] hover:text-white ${
                isActive ? "text-white" : "text-white/55"
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
