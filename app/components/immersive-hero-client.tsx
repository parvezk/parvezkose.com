"use client";

import Link from "next/link";
import { useId, useState } from "react";
import posthog from "posthog-js";
import { GenerativeHeroWebGL } from "./generative-hero-webgl";

type ImmersiveHeroClientProps = Readonly<{
  jetbrainsClassName: string;
  firaClassName: string;
}>;

const DESIGN_PHILOSOPHY = [
  "I build AI-augmented interfaces and agentic systems with a deliberate break from generic SaaS design: craft rooted in culture and material honesty.",
  "Visual interpretability shapes how I build. I'm drawn to what lives under the surface and what the model is actually doing. And I think the people using it should too.",
] as const;

export function ImmersiveHeroClient({
  jetbrainsClassName,
  firaClassName,
}: ImmersiveHeroClientProps) {
  const [philosophyOpen, setPhilosophyOpen] = useState(false);
  const philosophyToggleId = useId();
  const philosophyPanelId = useId();

  return (
    <div
      className={`relative min-h-screen w-full bg-neutral-950 ${jetbrainsClassName}`}
    >
      {/* Warm HTTP cache for WebGL; raw <img> so Next does not re-encode. Low-res first, full-res in parallel at lower priority. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional preload URLs match WebGL textures */}
      <img
        src="/textures/volcanic-terrain-hero-low.png"
        alt=""
        width={1}
        height={1}
        fetchPriority="high"
        decoding="async"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional preload */}
      <img
        src="/textures/volcanic-terrain-hero.png"
        alt=""
        width={1}
        height={1}
        fetchPriority="low"
        decoding="async"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        aria-hidden
      />
      <GenerativeHeroWebGL />

      <nav
        aria-label="Site and social links"
        className="pointer-events-auto absolute left-0 top-0 z-20 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 pr-8 text-[11px] font-medium uppercase sm:px-5 sm:py-3.5 sm:pr-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Link
          href="/classic"
          onClick={() => posthog.capture("layout_switched", { to: "classic", from: "immersive" })}
          className="tracking-[0.12em] text-white/55 transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.2em] hover:text-white/90"
        >
          ← Home
        </Link>
        <a
          href="https://github.com/parvezk"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog.capture("social_link_clicked", { platform: "GitHub", location: "immersive_nav" })}
          className="tracking-[0.12em] text-white/55 transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.2em] hover:text-white/90"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/parvezkose"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog.capture("social_link_clicked", { platform: "LinkedIn", location: "immersive_nav" })}
          className="tracking-[0.12em] text-white/55 transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.2em] hover:text-white/90"
        >
          LinkedIn
        </a>
        <a
          href="https://designlogic.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog.capture("social_link_clicked", { platform: "Substack", location: "immersive_nav" })}
          className="tracking-[0.12em] text-white/55 transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.2em] hover:text-white/90"
        >
          Substack
        </a>
        <a
          href="https://medium.com/@parvez__"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog.capture("social_link_clicked", { platform: "Medium", location: "immersive_nav" })}
          className="tracking-[0.12em] text-white/55 transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.2em] hover:text-white/90"
        >
          Medium
        </a>
      </nav>

      <div className="pointer-events-none absolute inset-0 z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-20 text-center">
          <div className="group pointer-events-auto relative inline-flex max-w-3xl flex-col items-center px-7 py-6 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-6 before:w-6 before:border-l-2 before:border-t-2 before:border-white/80 before:content-[''] after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:h-6 after:w-6 after:border-b-2 after:border-r-2 after:border-white/80 after:content-[''] sm:px-9 sm:py-8 sm:before:h-7 sm:before:w-7 sm:after:h-7 sm:after:w-7 md:px-11 md:py-9 md:before:h-8 md:before:w-8 md:after:h-8 md:after:w-8">
            <h1
              className="mb-3 max-w-3xl text-4xl font-light tracking-[-0.02em] text-white transition-[text-shadow,filter] duration-300 sm:text-5xl md:text-6xl [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_28px_rgba(0,0,0,0.65),0_0_56px_rgba(0,0,0,0.35)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.55)] group-hover:[text-shadow:0_2px_6px_rgba(0,0,0,1),0_0_36px_rgba(0,0,0,0.85),0_0_72px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_6px_28px_rgba(0,0,0,0.75)]"
              style={{ fontWeight: 300 }}
            >
              Parvez Kose
            </h1>
            <p
              className={`${firaClassName} flex max-w-xl flex-wrap justify-center text-sm font-normal leading-relaxed text-white/90 transition-[text-shadow,color] duration-300 sm:text-base [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_18px_rgba(0,0,0,0.8),0_0_36px_rgba(0,0,0,0.45)] group-hover:text-white group-hover:[text-shadow:0_2px_4px_rgba(0,0,0,1),0_0_26px_rgba(0,0,0,0.95),0_0_48px_rgba(0,0,0,0.6)]`}
            >
              <span className="relative inline-block">
                <span>Designing interfaces for intelligence</span>
                <span
                  className="immersive-caret-blink absolute left-full ml-[0.12ch] h-[2px] w-[1ch] min-w-[9px] bg-white [bottom:0.14em]"
                  aria-hidden
                />
              </span>
            </p>

            <button
              type="button"
              id={philosophyToggleId}
              aria-expanded={philosophyOpen}
              aria-controls={philosophyPanelId}
              onClick={() => {
                const next = !philosophyOpen;
                setPhilosophyOpen(next);
                posthog.capture("design_philosophy_toggled", {
                  action: next ? "opened" : "closed",
                });
              }}
              className={`${firaClassName} mt-5 cursor-pointer text-sm font-normal tracking-normal text-white/75 transition-[color,text-shadow,letter-spacing] duration-300 ease-out [text-shadow:0_1px_2px_rgba(0,0,0,0.85)] hover:tracking-[0.14em] hover:text-white/95 sm:text-base sm:hover:tracking-[0.18em]`}
            >
              {philosophyOpen ? "[−]" : "[+]"} Design Philosophy
            </button>

            <div
              className={`mt-3 grid w-full max-w-xl transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${philosophyOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="min-h-0 overflow-hidden">
                <section
                  id={philosophyPanelId}
                  aria-labelledby={philosophyToggleId}
                  aria-hidden={!philosophyOpen}
                  className={`${firaClassName} rounded-md border border-white/12 bg-black/50 px-4 py-3 text-left text-[11px] font-normal leading-relaxed text-white/92 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-opacity duration-500 ease-out motion-reduce:transition-none sm:text-[12px] sm:leading-relaxed ${philosophyOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  {DESIGN_PHILOSOPHY.map((para) => (
                    <p
                      key={para}
                      className="mb-2.5 last:mb-0 [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]"
                    >
                      {para}
                    </p>
                  ))}
                  <a
                    href="/design-system/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      posthog.capture("design_system_link_clicked", {
                        location: "immersive_philosophy_panel",
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 border-b border-white/30 pb-0.5 text-[11px] tracking-[0.04em] text-white/85 transition-[color,border-color,letter-spacing] duration-300 ease-out hover:border-[color:var(--accent-terracotta)] hover:tracking-[0.08em] hover:text-[color:var(--accent-terracotta)] sm:text-[12px] [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]"
                    aria-label="View the design system in a new tab"
                  >
                    <span>View design system</span>
                    <span aria-hidden>→</span>
                  </a>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex shrink-0 justify-center px-6 pb-14">
          <div
            className="w-fit max-w-[min(100%,22rem)] rounded-md px-7 py-3.5 text-center sm:max-w-[min(100%,28rem)] sm:px-9"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div className="flex flex-col items-center gap-1 text-[11px] font-normal uppercase leading-relaxed text-white/88 sm:text-xs [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
              <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
                Agentic systems.
              </span>
              <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
                Generative UI.
              </span>
              <span className="inline-block tracking-[0.14em] transition-[letter-spacing,color] duration-300 ease-out hover:tracking-[0.24em] hover:text-white sm:tracking-[0.16em] sm:hover:tracking-[0.28em]">
                Visual interpretability.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
