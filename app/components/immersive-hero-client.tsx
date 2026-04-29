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

// Terminal index — rendered inside the [+] Design Philosophy panel as
// the navigation surface into the design system. Replaces the single
// "View Design System →" link so users see this is multi-page, not
// a one-link footnote. Concept D from the v2.1 gallery exploration.
type SpecRow = Readonly<{
  slug: string;          // numbered folder label, e.g. "01-overview"
  href: string;          // destination URL (relative for /design-system pages)
  event: string;         // PostHog event payload identifier
  badge?: "LIVE";        // optional pin (atoms only)
}>;

const SPEC_INDEX: ReadonlyArray<SpecRow> = [
  { slug: "01-overview",   href: "/design-system/",            event: "overview" },
  { slug: "02-brand",      href: "/design-system/Brand.html",  event: "brand" },
  { slug: "03-colors",     href: "/design-system/Colors.html", event: "colors" },
  { slug: "04-type",       href: "/design-system/Type.html",   event: "type" },
  { slug: "05-spacing",    href: "/design-system/Spacing.html",event: "spacing" },
  { slug: "06-components", href: "/design-system/Components.html", event: "components" },
  { slug: "07-ui-kit",     href: "/design-system/UIKit.html",  event: "ui_kit" },
];

const ATOMS_ROW: SpecRow = {
  slug: "atoms",
  href: "/lab/atoms",
  event: "atoms_live",
  badge: "LIVE",
};

type MenuItem = Readonly<{
  label: string;
  href: string;
  external?: boolean;
  // PostHog event payload identifier
  event: string;
}>;

// Single flat row. Order + labels mirror the top-left floating nav so
// users see the same vocabulary in both surfaces. The Design System
// entry is the new addition the menu exists to introduce.
const MENU_ITEMS: ReadonlyArray<MenuItem> = [
  {
    label: "GitHub",
    href: "https://github.com/parvezk",
    external: true,
    event: "github",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/parvezkose",
    external: true,
    event: "linkedin",
  },
  {
    label: "Substack",
    href: "https://designlogic.substack.com",
    external: true,
    event: "substack",
  },
  {
    label: "Medium",
    href: "https://medium.com/@parvez__",
    external: true,
    event: "medium",
  },
  {
    label: "Design System",
    href: "/design-system/",
    external: true,
    event: "design_system",
  },
];

export function ImmersiveHeroClient({
  jetbrainsClassName,
  firaClassName,
}: ImmersiveHeroClientProps) {
  const [philosophyOpen, setPhilosophyOpen] = useState(false);
  const philosophyToggleId = useId();
  const philosophyPanelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleId = useId();
  const menuPanelId = useId();

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

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
                className={`${firaClassName} cursor-pointer text-sm font-normal tracking-normal text-white/75 transition-[color,text-shadow,letter-spacing] duration-300 ease-out [text-shadow:0_1px_2px_rgba(0,0,0,0.85)] hover:tracking-[0.14em] hover:text-white/95 sm:text-base sm:hover:tracking-[0.18em]`}
              >
                {philosophyOpen ? "[−]" : "[+]"} Design Philosophy
              </button>
              <span aria-hidden className="text-white/30 [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">·</span>
              <button
                type="button"
                id={menuToggleId}
                aria-expanded={menuOpen}
                aria-controls={menuPanelId}
                onClick={() => {
                  const next = !menuOpen;
                  setMenuOpen(next);
                  posthog.capture("immersive_menu_toggled", {
                    action: next ? "opened" : "closed",
                  });
                }}
                className={`${firaClassName} cursor-pointer text-sm font-normal tracking-normal text-white/75 transition-[color,text-shadow,letter-spacing] duration-300 ease-out [text-shadow:0_1px_2px_rgba(0,0,0,0.85)] hover:tracking-[0.14em] hover:text-white/95 sm:text-base sm:hover:tracking-[0.18em]`}
              >
                {menuOpen ? "[−]" : "[+]"} Menu
              </button>
            </div>

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
                      className="mb-2.5 [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]"
                    >
                      {para}
                    </p>
                  ))}
                  <p className="mb-3 mt-1 text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
                    This site has its own design system — built for agentic terrain.
                  </p>

                  {/* Terminal index · ls -lh design-system/ */}
                  <div
                    className="mt-2 rounded border border-white/8 bg-black/35 px-3 py-2.5 font-mono text-[10.5px] leading-[1.7] sm:text-[11px]"
                    aria-label="Design system pages"
                  >
                    <p className="mb-1.5 text-white/55 [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]">
                      <span className="text-[color:var(--accent-terracotta)]">$</span>{" "}
                      ls -lh design-system/
                    </p>
                    <ul className="m-0 list-none p-0">
                      {SPEC_INDEX.map((row) => (
                        <li key={row.event}>
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              posthog.capture("design_system_link_clicked", {
                                location: "immersive_philosophy_terminal",
                                target: row.event,
                              })
                            }
                            className="group flex items-center justify-between gap-3 py-0.5 text-white/80 transition-[color] duration-200 ease-out hover:text-[color:var(--accent-terracotta)] [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]"
                          >
                            <span className="truncate">
                              <span className="text-white/35">·</span>{" "}
                              <span>{row.slug}/</span>
                            </span>
                            <span
                              aria-hidden
                              className="shrink-0 text-white/30 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[color:var(--accent-terracotta)]"
                            >
                              ↗
                            </span>
                          </a>
                        </li>
                      ))}
                      {/* atoms — set apart with continuation glyph + LIVE pill */}
                      <li className="mt-1.5">
                        <a
                          href={ATOMS_ROW.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            posthog.capture("design_system_link_clicked", {
                              location: "immersive_philosophy_terminal",
                              target: ATOMS_ROW.event,
                            })
                          }
                          className="group flex items-center justify-between gap-3 py-0.5 text-white/80 transition-[color] duration-200 ease-out hover:text-[color:var(--accent-terracotta)] [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="text-white/35">⤷</span>
                            <span>{ATOMS_ROW.slug}/</span>
                            <span className="rounded-full border border-[color:var(--accent-terracotta)]/70 px-1.5 py-px text-[8.5px] font-medium tracking-[0.18em] uppercase text-[color:var(--accent-terracotta)]">
                              {ATOMS_ROW.badge}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className="shrink-0 text-white/30 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[color:var(--accent-terracotta)]"
                          >
                            ↗
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>

            <div
              className={`mt-3 grid w-full max-w-xl transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="min-h-0 overflow-hidden">
                <section
                  id={menuPanelId}
                  aria-labelledby={menuToggleId}
                  aria-hidden={!menuOpen}
                  className={`${firaClassName} rounded-md border border-white/12 bg-black/50 px-4 py-3 text-left text-[11px] font-normal leading-relaxed text-white/92 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-opacity duration-500 ease-out motion-reduce:transition-none sm:text-[12px] ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 uppercase tracking-[0.12em] text-[10px] sm:text-[11px]">
                    {MENU_ITEMS.map((item) =>
                      item.external ? (
                        <li key={item.event}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              posthog.capture("immersive_menu_link_clicked", {
                                target: item.event,
                                external: true,
                              })
                            }
                            className="inline-block font-medium text-white/85 transition-[color,letter-spacing] duration-300 ease-out hover:tracking-[0.18em] hover:text-[color:var(--accent-terracotta)] [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]"
                          >
                            {item.label}
                          </a>
                        </li>
                      ) : (
                        <li key={item.event}>
                          <Link
                            href={item.href}
                            onClick={() =>
                              posthog.capture("immersive_menu_link_clicked", {
                                target: item.event,
                                external: false,
                              })
                            }
                            className="inline-block font-medium text-white/85 transition-[color,letter-spacing] duration-300 ease-out hover:tracking-[0.18em] hover:text-[color:var(--accent-terracotta)] [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
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
