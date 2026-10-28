"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { jetbrainsMono, plexSans } from "../../../fonts";
import type { GravityWellsHandle } from "./engine";
import "./gravity-wells.css";

const DESKTOP_QUERY = "(min-width: 1024px)";

type Props = Readonly<{
  /** Section ordinal shown in the eyebrow, e.g. "02". */
  ordinal: string;
  /** id for the section title, so the camera wrapper can label itself. */
  titleId?: string;
  /**
   * Whether the section is on screen. The force simulation and orbit
   * timer pause while it is false so off-screen sections cost nothing.
   */
  active: boolean;
  /** Optional "next" cue at the end of the text column (e.g. a link to the graph below). */
  onNext?: () => void;
  nextLabel?: string;
}>;

/**
 * Gravity Wells: the AI dev workflow graph for How I build. The markup
 * mirrors the approved prototype; `mountGravityWells` (D3) draws the SVG
 * and wires the controls after mount, so nothing renders on the server
 * except the static chrome.
 */
export function GravityWellsGraph({
  ordinal,
  titleId,
  active,
  onNext,
  nextLabel,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GravityWellsHandle | null>(null);
  // Also pause when the panel is scrolled out of view (simple mode).
  const [inView, setInView] = useState(true);
  const running = active && inView;
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    // Load D3 and the engine on the client only, after first paint.
    import("./engine").then(({ mountGravityWells }) => {
      if (cancelled) return;
      const desktop = window.matchMedia(DESKTOP_QUERY);
      const handle = mountGravityWells(root, {
        forceWide: () => desktop.matches,
      });
      handle.setActive(runningRef.current);
      handleRef.current = handle;
    });
    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  // Laptop fit: the stage height is the viewport minus everything else in
  // the stage column. The dropped line and legend can wrap, so their
  // height is measured rather than assumed.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const parts = [".dropped", ".key"].map(
      (q) => root.querySelector(q) as HTMLElement,
    );
    const update = () => {
      const h = parts.reduce((sum, el) => sum + (el?.offsetHeight ?? 0), 0);
      root.style.setProperty("--gw-flex-h", `${h}px`);
    };
    const ro = new ResizeObserver(update);
    parts.forEach((el) => el && ro.observe(el));
    update();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    handleRef.current?.setActive(running);
  }, [running]);

  const fonts = {
    "--mono": `${jetbrainsMono.style.fontFamily}, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`,
    "--sans": `${plexSans.style.fontFamily}, system-ui, -apple-system, "Segoe UI", sans-serif`,
  } as CSSProperties;

  return (
    <div ref={rootRef} className="gw-root" style={fonts}>
      {/* Side column on laptops; on smaller screens it dissolves (display: contents) so the
          prototype's single-column order applies. */}
      <div className="gw-side">
        <header className="gw-head">
          <p className="eyebrow">{ordinal} — How I build · AI dev workflow</p>
          <h2 id={titleId}>Gravity wells</h2>
          <p className="lede">
            My work runs in three streams: <span className="s-r">research</span>
            , <span className="s-d">design</span> and{" "}
            <span className="s-e">engineering</span>. Each is a gravity well,
            and the tools I use orbit it. Distance from the centre shows
            commitment. CLI tools sit on their own arc because I use them in
            every stream. Arrows show where work hands off from one tool to the
            next.
          </p>
        </header>

        <div
          className="gw-controls controls"
          role="group"
          aria-label="Graph controls"
        >
          <button data-gw="toggle-orbit" type="button" aria-pressed="true">
            Orbit on
          </button>
          <button data-gw="toggle-handoffs" type="button" aria-pressed="true">
            Handoffs on
          </button>
          <button data-gw="reshuffle" type="button">
            Scatter and resettle
          </button>
          <span className="sep" aria-hidden="true" />
          <button data-gw="mode-blend" type="button" aria-pressed="false">
            Show the real mix
          </button>
          <button data-gw="mode-home" type="button" aria-pressed="true">
            Sort into home workstream
          </button>
        </div>
        <p className="caption" data-gw="caption" aria-live="polite" />
        <p className="readout" data-gw="readout" aria-live="polite">
          Point at a tool to read its mix.
        </p>
        <p className="hint">
          Hover a tool for a one-line brief · double-click a tool to zoom in ·
          drag to pull it out of orbit
        </p>

        <p className="note">
          The long version, with a running tried-and-dropped log, lives{" "}
          <a
            href="https://designlogic.substack.com/p/my-ai-dev-workflow-2026-first-half"
            target="_blank"
            rel="noopener noreferrer"
          >
            here → My AI Dev Workflow - 2026 First Half
          </a>
          .
        </p>
        {onNext && (
          <button type="button" className="next" onClick={onNext}>
            {nextLabel ?? "Next"} ↓
          </button>
        )}
      </div>

      <div className="gw-main">
        <figure className="stage" data-gw="stage">
          <div className="zoombar" role="group" aria-label="Zoom">
            <button
              className="sym"
              data-gw="zoom-in"
              type="button"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              className="sym"
              data-gw="zoom-out"
              type="button"
              aria-label="Zoom out"
            >
              −
            </button>
            <button data-gw="lens" type="button" aria-pressed="false">
              Lens
            </button>
            <button data-gw="zoom-reset" type="button">
              Reset
            </button>
          </div>
          <svg
            className="graph"
            data-gw="graph"
            role="img"
            aria-label="Three workstreams, research, design and engineering, drawn as gravity wells, with tools orbiting each at distances that show how committed I am to them, and CLI tools on a shared arc."
          />
          <p className="dropped" data-gw="dropped" />
          <div className="tip" data-gw="tip" hidden />
        </figure>

        <ul className="key" aria-label="Legend">
          <li>
            <svg viewBox="-15 -15 30 30" aria-hidden="true">
              <circle className="k-ring k-on" r="5.5" />
              <circle className="k-ring" r="9.5" strokeOpacity=".35" />
              <circle className="k-ring" r="13.5" strokeOpacity=".2" />
              <circle cx="5.5" r="2.6" fill="currentColor" />
            </svg>
            Daily · inner orbit
          </li>
          <li>
            <svg viewBox="-15 -15 30 30" aria-hidden="true">
              <circle className="k-ring" r="5.5" strokeOpacity=".35" />
              <circle className="k-ring k-on" r="9.5" />
              <circle className="k-ring" r="13.5" strokeOpacity=".2" />
              <circle
                cx="9.5"
                r="2.6"
                fill="var(--bg)"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            Trying · middle orbit
          </li>
          <li>
            <svg viewBox="-15 -15 30 30" aria-hidden="true">
              <circle className="k-ring" r="5.5" strokeOpacity=".35" />
              <circle className="k-ring" r="9.5" strokeOpacity=".35" />
              <circle className="k-ring k-on" r="13.5" />
              <circle
                cx="13.5"
                r="2.4"
                fill="var(--bg)"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="1.5 1.5"
              />
            </svg>
            Parked · outer orbit
          </li>
          <li>
            <svg className="wide" viewBox="0 0 26 14" aria-hidden="true">
              <path
                d="M2 11Q12 1 21 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M24 8.5l-5 .3 2.3-4z" fill="currentColor" />
            </svg>
            Handoff
          </li>
          <li>
            <svg className="wide" viewBox="0 0 26 14" aria-hidden="true">
              <path
                d="M1 4H25"
                stroke="var(--latte)"
                strokeWidth="3"
                opacity=".6"
              />
              <path
                d="M1 11H25"
                stroke="var(--latte)"
                strokeWidth=".8"
                opacity=".6"
              />
            </svg>
            Pull (real mix)
          </li>
        </ul>
      </div>
    </div>
  );
}
