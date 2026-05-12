"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";
import { DesignSystemGallery } from "../gallery/design-system-gallery";

const ANCHOR = ANCHORS[1];

/**
 * Anchor 1 — How I think. Renders the design-system gallery (5 plates
 * on an asymmetric scatter grid) in place of the prior small
 * placeholder card. SectionCard's camera-aware wrapper / opacity /
 * drift mechanics still apply: the gallery fades in as the camera
 * arrives at anchor 1 and drifts off as the camera leaves.
 */
export function HowIThinkSection() {
  return <SectionCard anchor={ANCHOR} ordinal="01" title="How I think" customLayout={<DesignSystemGallery />} />;
}
