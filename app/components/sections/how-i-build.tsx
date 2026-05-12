"use client";

import { ANCHORS } from "../../lib/camera/path";
import { SectionCard } from "./section-card";

const ANCHOR = ANCHORS[2];

/**
 * Anchor 2 — How I build. Hierarchy between the two paragraphs:
 *   - The top paragraph is the *thesis*: font-medium + bright white.
 *     It carries the reader at a glance.
 *   - The inner-panel paragraph is the *elaboration*: slightly smaller,
 *     dimmer, and loosened leading, so it visually settles back as the
 *     "long version" of the same idea. Same monospace voice — just the
 *     two ends of a single content rhythm.
 *
 * The trailing "here →" links to GitHub for the long-form / live
 * diagram destination.
 */
export function HowIBuildSection() {
  return (
    <SectionCard
      anchor={ANCHOR}
      ordinal="02"
      title="How I build"
      signatureMotion={
        // Tool names wrapped in a warm-Latte tone — palette accent that
        // isn't already claimed (terracotta = links, golden = eyebrows).
        // No underline so readers don't mistake them for links.
        <p className="text-[13px] normal-case tracking-normal leading-[1.75] text-white/72 [&_.tool]:text-[color:var(--neutral-latte)]">
          {`Minimal core, evolving edges. `}
          <span className="tool">Claude Code</span>
          {` in `}
          <span className="tool">Ghostty</span>
          {` plus `}
          <span className="tool">Tmux</span>
          {` as the daily driver, `}
          <span className="tool">Cursor</span>
          {` for visual review, `}
          <span className="tool">Antigravity</span>
          {` or `}
          <span className="tool">Codex</span>
          {` for spec planning. Everything else earns its keep or it doesn't, and most don't. I treat my workflow as an authored operating model, not a tools list: the aesthetic taste on the surface and the agentic rigor underneath are the same practice viewed from two angles, both about composing constraints to get a specific outcome. The long version, with five layers, a running tried-and-dropped log, and the live diagram, lives `}
          <a
            href="https://github.com/parvezk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--accent-terracotta)] underline decoration-[color:var(--accent-terracotta)]/40 underline-offset-[4px] transition-[letter-spacing,text-decoration-color] duration-200 hover:tracking-[0.04em] hover:decoration-[color:var(--accent-terracotta)]"
          >
            here →
          </a>
        </p>
      }
    >
      <p className="font-medium text-white">
        Three layers, orchestrated: a thinking layer for framing, an
        execution layer of agents for implementation, and a validation
        layer of telemetry holding both honest.
      </p>
    </SectionCard>
  );
}
