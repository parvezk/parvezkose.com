"use client";

import { useRef, type ReactNode } from "react";
import { ANCHORS, cardOpacity, type Anchor } from "../../lib/camera/path";
import { useCamera, useCameraEffect } from "../../lib/camera/scroll-controller";

/**
 * Card drift factor in viewport percent. The terrain is now static (no
 * wrapper transform — see TerrainCanvas), so anchor.x/y values map
 * directly to viewport-percent translates on the card wrapper. Cards
 * drift across the static backdrop as the camera progresses, providing
 * the "flying" sensation without zooming the shader.
 */
const TERRAIN_TO_VIEWPORT = 1.0;

type SectionCardProps = Readonly<{
  anchor: Anchor;
  /** 1-2 char ordinal shown above the title, e.g. "01". */
  ordinal: string;
  /** Section title. */
  title: string;
  /** Slot for body — kept short; signature motion lives below. */
  children: ReactNode;
  /** Extra slot below body (placeholder area for future signature motion). */
  signatureMotion?: ReactNode;
  /** Anchor link href, optional (e.g. "How I think" → /design-system/). */
  ctaHref?: string | null;
  ctaLabel?: string;
}>;

/**
 * Camera-aware section card. In camera mode, drifts with the terrain and
 * fades on arrival/departure via direct DOM mutation. In simple mode
 * (mobile / reduced-motion), renders as a normal in-flow block.
 */
export function SectionCard({
  anchor,
  ordinal,
  title,
  children,
  signatureMotion,
  ctaHref,
  ctaLabel = "Open →",
}: SectionCardProps) {
  const { cameraMode, mounted } = useCamera();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useCameraEffect((cam) => {
    const wrap = wrapperRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    const dx = (anchor.x - cam.x) * TERRAIN_TO_VIEWPORT;
    const dy = (anchor.y - cam.y) * TERRAIN_TO_VIEWPORT;
    wrap.style.transform = `translate3d(${dx}%, ${dy}%, 0)`;

    const opacity = cardOpacity(cam, anchor.id);
    card.style.opacity = `${opacity}`;
    // Invisible cards must not intercept clicks intended for cards behind
    // them or for the underlying terrain.
    card.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
  });

  // Render nothing during SSR + first client render. After
  // useLayoutEffect flips `mounted`, we know the right mode and avoid a
  // hydration-time layout flash where simple-mode stack snaps into
  // camera-mode fixed positioning on desktop.
  if (!mounted) return null;

  if (!cameraMode) {
    // Simple mode: vertical stack, full opacity, no transforms.
    return (
      <section
        id={`anchor-${anchor.slug}`}
        className="relative z-10 flex min-h-[80vh] w-full items-center justify-center px-6 py-16"
      >
        <CardBody
          ordinal={ordinal}
          title={title}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          signatureMotion={signatureMotion}
        >
          {children}
        </CardBody>
      </section>
    );
  }

  return (
    <div
      ref={wrapperRef}
      id={`anchor-${anchor.slug}`}
      aria-labelledby={`anchor-${anchor.slug}-title`}
      className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-6 will-change-transform"
      style={{ transform: "translate3d(0%, 0%, 0)" }}
    >
      <div
        ref={cardRef}
        style={{ opacity: 0, pointerEvents: "none", transition: "none" }}
      >
        <CardBody
          ordinal={ordinal}
          title={title}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          signatureMotion={signatureMotion}
        >
          {children}
        </CardBody>
      </div>
    </div>
  );
}

function CardBody({
  ordinal,
  title,
  children,
  signatureMotion,
  ctaHref,
  ctaLabel,
}: {
  ordinal: string;
  title: string;
  children: ReactNode;
  signatureMotion?: ReactNode;
  ctaHref?: string | null;
  ctaLabel?: string;
}) {
  return (
    <article
      className="relative w-full max-w-xl rounded-md border border-white/12 bg-black/55 px-7 py-7 text-left text-white/85 shadow-[0_24px_72px_rgba(0,0,0,0.55)] backdrop-blur-md sm:max-w-2xl sm:px-10 sm:py-9"
    >
      {/* Corner brackets — design language carried from the hero card. */}
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white/70" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white/70" />

      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-golden)]">
        {ordinal} — Anchor
      </p>
      <h2
        id={`anchor-title-${ordinal}`}
        className="mb-5 text-2xl font-light tracking-[-0.01em] text-[color:var(--neutral-latte)] sm:text-3xl"
      >
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-white/82 sm:text-[15px]">
        {children}
      </div>

      {signatureMotion && (
        <div className="mt-6 min-h-[120px] rounded-sm border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-[11px] uppercase tracking-[0.18em] text-white/35">
          {signatureMotion}
        </div>
      )}

      {ctaHref && (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-baseline gap-2 text-[12px] uppercase tracking-[0.18em] text-[color:var(--accent-terracotta)] underline decoration-[color:var(--accent-terracotta)]/40 underline-offset-[6px] transition-[letter-spacing,color] hover:tracking-[0.24em] hover:decoration-[color:var(--accent-terracotta)]"
        >
          {ctaLabel}
        </a>
      )}
    </article>
  );
}

/** Used by the simple-mode wrapper to know which anchors are sections. */
export const SECTION_ANCHOR_IDS = ANCHORS.filter((a) => a.id !== 0).map((a) => a.id);
