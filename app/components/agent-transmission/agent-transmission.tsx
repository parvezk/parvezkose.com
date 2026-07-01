"use client";

/**
 * <AgentTransmission /> — an ambient "agent transmission" overlay.
 *
 * Concept: a satellite intermittently locks onto a coordinate and intercepts a
 * brief burst of an autonomous agent running code in the wild. An INTERCEPT,
 * not a console. It renders over the WebGL terrain and persists across scroll
 * sections; a single transmission runs at a time.
 *
 * Phase 1: standalone. Every tuning knob lives in DEFAULTS below so feel can be
 * dialed before the overlay touches the real layout. Mount once at app root.
 *
 * DOM + CSS only (no canvas). Pauses when the tab is hidden, and respects
 * prefers-reduced-motion (no typing / no respawn — one static faint line).
 */

import { useEffect, useState } from "react";
import {
  SESSIONS,
  MODELS,
  DIRECTORIES,
  BRANCHES,
  MODE_LINES,
  PROGRESS_LABELS,
  HOSTS,
  type Session,
} from "./sessions";

/* ============================================================
   TUNING KNOBS — dial feel here. Every value is overridable
   per-instance via the `config` prop (and a few via top-level
   props: devFast, accent, fontClassName).
   ============================================================ */
const DEFAULTS = {
  /* ---- cadence ---- */
  intervalMs: 120_000, // idle gap between transmissions (default)
  devFastIntervalMs: 6_000, // `devFast` cadence, for tuning
  firstDelayMs: null as number | null, // null → use interval for the first cycle

  /* ---- vignette timing ---- */
  fadeInMs: 850,
  typeCharMs: 38, // base per-char typing speed
  typeJitterMs: 58, // random 0..jitter added per char
  lineGapMs: 230, // pause between typed command lines
  preOutputMs: 500, // pause after commands, before outputs
  outputLineMs: 220, // gap between revealed output lines
  progressEvery: 2, // draw a loading bar every Nth intercept (0 → use progressChance)
  progressChance: 0.5, // fallback odds when progressEvery is 0
  progressFillMs: 1800, // time for the loading bar to reach 100%
  holdMs: 4000, // dwell after content, caret blinking, before roll-up
  collapseMs: 460, // roll-up duration
  fadeOutMs: 420, // fade after the roll-up

  /* ---- appearance ---- */
  fontSizePx: 12,
  textOpacity: 0.94, // resting opacity (the ambient feel comes from the fade,
  //                    not from permanently see-through text)
  textColor: "#e8e4e0", // desaturated warm near-white
  accent: "#e2725b", // terracotta — telemetry tag, prompt sigil, caret
  // Legibility leans on dark placement (spawnZones) + a per-glyph halo, NOT a
  // visible box. The scrim is blur-only — no dark fill — so no "black box".
  scrimStrength: 0.5, // 0..1 — glyph-halo strength
  scrimBlurPx: 2.5, // backdrop blur behind the text (softens terrain detail)
  reticleOpacity: 0.32, // corner crop-mark brackets
  zIndex: 3, // above terrain, below hero content (z-10) + nav (z-30)

  /* ---- statusline (Claude-Code-style footer) ---- */
  statusline: true,
  modeLine: true,

  /* ---- positioning / collision ---- */
  minCols: 46, // floor on box width, in mono columns
  maxCandidates: 20, // reject-and-retry budget; skip the cycle if none fit
  overflowRatio: 0.4, // box may run off a viewport edge by up to 40%
  edgeBias: 0.72, // 0..1 — edge/corner bias when spawnZones is null
  keepoutMargin: 16, // px breathing room around data-agent-keepout rects
  // Allowed spawn regions, as viewport-fraction ranges for the box CENTER.
  // Tuned to the home-anchor terrain's DARK areas so text stays legible
  // without a heavy scrim. null → roam the whole viewport (edge-biased).
  // The center zone clears itself when the hero panel expands (the hero
  // keep-out box grows over it). Light bottom-left/right corners are excluded.
  // cx pushed toward the edges so the wide box clears the centered hero by
  // running off the viewport edge (the "caught mid-frame" overflow), rather
  // than overlapping the title. Validated: even spread, no hero/nav overlap,
  // never the light bottom band.
  spawnZones: [
    { cx: [0.1, 0.14], cy: [0.17, 0.33] }, // top-left
    { cx: [0.86, 0.9], cy: [0.17, 0.33] }, // top-right
    { cx: [0.4, 0.6], cy: [0.55, 0.74] }, // center, below the hero title
  ] as Array<{ cx: [number, number]; cy: [number, number] }> | null,

  /* ---- reduced motion ---- */
  reducedMotionMode: "static" as "static" | "none",
};

type Config = typeof DEFAULTS;

export type AgentTransmissionProps = {
  /** ~6s cadence instead of 120s, for tuning. */
  devFast?: boolean;
  /** Accent color (telemetry tag, prompt sigil, caret, branch). Defaults to terracotta. */
  accent?: string;
  /**
   * Class that loads the mono face. Defaults to the `font-mono` utility (which
   * resolves to JetBrains Mono inside /lab and anywhere the @theme token is set).
   * At app root, pass the next/font className instead (e.g. jetbrainsMono.className).
   */
  fontClassName?: string;
  /** Override any tuning knob. */
  config?: Partial<Config>;
};

/* Statusline segment colors — design-system warm palette. */
const STATUS_COLORS = {
  time: "#c8ad8f", // latte
  dir: "#c3b091", // khaki
  model: "#c54b6c", // mulberry
  cost: "#c4a000", // golden
  mode: "#c8ad8f", // latte
};

/* ============================================================
   Types
   ============================================================ */
type Box = { width: number; height: number };
type Pos = { left: number; top: number };
type Rect = { left: number; top: number; right: number; bottom: number };

type Line =
  | { kind: "cmd"; text: string; reveal: number; prompt: boolean }
  | { kind: "out"; text: string; reveal: number }
  | { kind: "progress"; text: string; pct: number };

type Status = {
  time: string;
  dir: string;
  branch: string;
  model: string;
  cost: string;
};

type Shell = {
  user: string; // e.g. agent-36e5
  host: string; // e.g. orbital-7
  cwd: string; // e.g. ~
  prompt: string; // flattened `user@host cwd %`, for measurement
};

type Frame = {
  telemetry: string;
  status: Status;
  shell: Shell;
  modeLine: string | null;
  statusText: string; // flattened, for width measurement
};

type View = {
  pos: Pos;
  box: Box;
  frame: Frame;
  lines: Line[];
  caret: number | null; // index of the line carrying the caret, or null
  visible: boolean; // drives the opacity fade-in
  rolling: boolean; // drives the roll-up + fade-out
};

/* ============================================================
   Cancellable scheduler — one token per running loop. `cancel()`
   rejects every pending sleep so the async driver unwinds cleanly.
   ============================================================ */
const CANCELLED = Symbol("cancelled");

function makeToken() {
  let cancelled = false;
  const pending = new Set<() => void>();
  return {
    get cancelled() {
      return cancelled;
    },
    cancel() {
      cancelled = true;
      pending.forEach((rej) => rej());
      pending.clear();
    },
    sleep(ms: number) {
      return new Promise<void>((resolve, reject) => {
        if (cancelled) {
          reject(CANCELLED);
          return;
        }
        const onCancel = () => {
          clearTimeout(timer);
          pending.delete(onCancel);
          reject(CANCELLED);
        };
        const timer = setTimeout(() => {
          pending.delete(onCancel);
          resolve();
        }, ms);
        pending.add(onCancel);
      });
    },
  };
}
type Token = ReturnType<typeof makeToken>;

/* ============================================================
   Content helpers
   ============================================================ */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function makeAgentId(): string {
  let id = "";
  for (let i = 0; i < 8; i++) id += Math.floor(Math.random() * 16).toString(16);
  return id;
}

function buildFrame(cfg: Config): Frame {
  // One agent id ties the telemetry tag to the shell user — same intercept.
  const id = makeAgentId();
  const lat = (Math.random() * 180 - 90).toFixed(2);
  const lon = (Math.random() * 360 - 180).toFixed(2);
  const telemetry = `◦ ${lat}, ${lon} · AGENT-${id} · INTERCEPT`;

  const now = new Date();
  const status: Status = {
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`,
    dir: pick(DIRECTORIES),
    branch: pick(BRANCHES),
    model: pick(MODELS),
    cost: `$${(Math.random() * 0.9 + 0.01).toFixed(4)}`,
  };

  const user = `agent-${id.slice(0, 4)}`;
  const host = pick(HOSTS);
  const cwd = "~";
  const shell: Shell = { user, host, cwd, prompt: `${user}@${host} ${cwd} %` };

  const modeLine = cfg.modeLine ? pick(MODE_LINES) : null;
  const statusText = `${status.time}  ${status.dir}  ${status.branch}  ${status.model}  ${status.cost}`;
  return { telemetry, status, shell, modeLine, statusText };
}

function buildLines(session: Session, withProgress: boolean): Line[] {
  const lines: Line[] = [
    // The first command line carries the shell prompt (agent identity);
    // the rest read as its sub-steps with the `›` sigil.
    ...session.cmd.map((text, i) => ({
      kind: "cmd" as const,
      text,
      reveal: 0,
      prompt: i === 0,
    })),
    ...session.out.map((text) => ({ kind: "out" as const, text, reveal: 0 })),
  ];
  if (withProgress) {
    lines.push({ kind: "progress", text: pick(PROGRESS_LABELS), pct: 0 });
  }
  return lines;
}

/* ============================================================
   Layout: estimate the rendered footprint (telemetry + body +
   statusline), then place it clear of keep-out rects, biased
   toward edges/corners.
   ============================================================ */
const SIGIL_COLS = 2; // "› " prefix on continuation command lines

function lineCols(line: Line, promptCols: number): number {
  if (line.kind === "progress") return line.text.length + 28; // label + bar + pct
  if (line.kind === "cmd") {
    return line.text.length + (line.prompt ? promptCols + 1 : SIGIL_COLS);
  }
  return line.text.length;
}

function estimateBox(
  lines: Line[],
  frame: Frame,
  cfg: Config,
): Box & { bodyRows: number; statusRows: number } {
  const charW = cfg.fontSizePx * 0.6; // mono advance width
  const lineH = cfg.fontSizePx * 1.55;

  const bodyRows = lines.length;
  const statusRows = cfg.statusline ? 1 + (frame.modeLine ? 1 : 0) : 0;
  const promptCols = frame.shell.prompt.length;

  const cols = Math.max(
    cfg.minCols,
    frame.telemetry.length,
    cfg.statusline ? frame.statusText.length : 0,
    ...lines.map((l) => lineCols(l, promptCols)),
  );

  const padX = 7;
  const padY = 5;
  const width = Math.ceil(cols * charW) + padX * 2;

  // telemetry row + gap + body rows + (divider gap + status rows).
  // Reserve generously: the container is overflow-hidden with a fixed
  // max-height, so under-reserving would clip the statusline.
  let height = lineH + lineH * 0.5 + bodyRows * lineH;
  if (cfg.statusline) height += lineH * 0.9 + statusRows * lineH;
  height = Math.ceil(height) + padY * 2 + 6;

  return { width, height, bodyRows, statusRows };
}

function rectsOverlap(a: Rect, b: Rect, margin: number): boolean {
  return (
    a.left < b.right + margin &&
    a.right > b.left - margin &&
    a.top < b.bottom + margin &&
    a.bottom > b.top - margin
  );
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** One coordinate, biased toward the two ends of [min, max]. */
function edgeBiased(min: number, max: number, bias: number): number {
  if (max <= min) return min;
  const span = max - min;
  if (Math.random() < bias) {
    const band = span * 0.22;
    return Math.random() < 0.5
      ? min + Math.random() * band
      : max - Math.random() * band;
  }
  return min + Math.random() * span;
}

function readKeepouts(): Rect[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const els = document.querySelectorAll<HTMLElement>("[data-agent-keepout]");
  const rects: Rect[] = [];
  els.forEach((el) => {
    // Skip effectively-invisible keep-outs (e.g. faded-out section cards that
    // have drifted away in camera mode) so they don't over-constrain placement.
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return;
    if (parseFloat(cs.opacity) < 0.05) return;

    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    // Skip rects entirely outside the viewport.
    if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) return;

    rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  });
  return rects;
}

function pickPosition(box: Box, cfg: Config): Pos | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const keepouts = readKeepouts();

  // Allowed top-left range, permitting up to overflowRatio off each edge.
  const overX = box.width * cfg.overflowRatio;
  const overY = box.height * cfg.overflowRatio;
  const minLeft = -overX;
  const maxLeft = vw - box.width + overX;
  const minTop = -overY;
  const maxTop = vh - box.height + overY;

  const zones = cfg.spawnZones;

  for (let i = 0; i < cfg.maxCandidates; i++) {
    let left: number;
    let top: number;
    if (zones && zones.length) {
      // Sample the box CENTER inside a random allowed (dark) zone.
      const z = zones[Math.floor(Math.random() * zones.length)];
      const cx = (z.cx[0] + Math.random() * (z.cx[1] - z.cx[0])) * vw;
      const cy = (z.cy[0] + Math.random() * (z.cy[1] - z.cy[0])) * vh;
      left = clamp(cx - box.width / 2, minLeft, maxLeft);
      top = clamp(cy - box.height / 2, minTop, maxTop);
    } else {
      left = edgeBiased(minLeft, maxLeft, cfg.edgeBias);
      top = edgeBiased(minTop, maxTop, cfg.edgeBias);
    }
    const candidate: Rect = {
      left,
      top,
      right: left + box.width,
      bottom: top + box.height,
    };
    const collides = keepouts.some((k) =>
      rectsOverlap(candidate, k, cfg.keepoutMargin),
    );
    if (!collides) return { left, top };
  }
  return null; // nothing fit — caller skips the cycle
}

/* ============================================================
   Component
   ============================================================ */
export function AgentTransmission({
  devFast = false,
  accent,
  fontClassName = "font-mono",
  config,
}: AgentTransmissionProps) {
  const cfg: Config = {
    ...DEFAULTS,
    ...config,
    ...(accent ? { accent } : null),
  };

  const [view, setView] = useState<View | null>(null);
  const [reduced, setReduced] = useState(false);

  // Functional updates keep the async driver in sync with the latest view
  // without re-subscribing the loop on every keystroke.
  const update = (mut: (v: View) => View) => {
    setView((prev) => (prev ? mut(prev) : prev));
  };

  /* ---- prefers-reduced-motion ---- */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* ---- the driver: idle → vignette → idle, paused while hidden ---- */
  useEffect(() => {
    if (reduced) return; // static path handled in render

    const interval = devFast ? cfg.devFastIntervalMs : cfg.intervalMs;
    const firstDelay = cfg.firstDelayMs ?? interval;

    let token: Token | null = null;

    async function runVignette(
      t: Token,
      session: Session,
      pos: Pos,
      box: Box,
      frame: Frame,
      lines: Line[],
    ) {
      // Mount hidden, then fade in (CSS opacity transition).
      setView({
        pos,
        box,
        frame,
        lines,
        caret: 0,
        visible: false,
        rolling: false,
      });
      await t.sleep(30); // allow the hidden frame to commit
      update((v) => ({ ...v, visible: true }));
      await t.sleep(cfg.fadeInMs);

      // Type command lines char-by-char with timing jitter.
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].kind !== "cmd") continue;
        update((v) => ({ ...v, caret: i }));
        const text = lines[i].text;
        for (let c = 1; c <= text.length; c++) {
          update((v) => {
            const next = v.lines.slice();
            next[i] = { ...next[i], reveal: c } as Line;
            return { ...v, lines: next };
          });
          await t.sleep(cfg.typeCharMs + Math.random() * cfg.typeJitterMs);
        }
        await t.sleep(cfg.lineGapMs);
      }

      await t.sleep(cfg.preOutputMs);

      // Reveal output lines whole, faster.
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].kind !== "out") continue;
        update((v) => {
          const next = v.lines.slice();
          next[i] = { ...next[i], reveal: next[i].text.length } as Line;
          return { ...v, lines: next, caret: i };
        });
        await t.sleep(cfg.outputLineMs);
      }

      // Fill the loading bar (if this cycle has one) to 100%.
      const progressIndex = lines.findIndex((l) => l.kind === "progress");
      if (progressIndex >= 0) {
        update((v) => ({ ...v, caret: progressIndex }));
        const steps = 28;
        for (let s = 1; s <= steps; s++) {
          const pct = Math.round((s / steps) * 100);
          update((v) => {
            const next = v.lines.slice();
            next[progressIndex] = { kind: "progress", text: next[progressIndex].text, pct };
            return { ...v, lines: next };
          });
          await t.sleep(cfg.progressFillMs / steps);
        }
      }

      // Dwell so it can actually be read, caret still blinking.
      await t.sleep(cfg.holdMs);

      // Roll up from the bottom, then fade.
      update((v) => ({ ...v, rolling: true, caret: null }));
      await t.sleep(cfg.collapseMs + cfg.fadeOutMs);
      setView(null);
    }

    async function loop(t: Token) {
      let first = true;
      let shown = 0; // count of intercepts actually rendered
      while (!t.cancelled) {
        await t.sleep(first ? firstDelay : interval);
        first = false;
        const session = pick(SESSIONS);
        const frame = buildFrame(cfg);
        const withProgress =
          cfg.progressEvery > 0
            ? (shown + 1) % cfg.progressEvery === 0
            : Math.random() < cfg.progressChance;
        const lines = buildLines(session, withProgress);
        const box = estimateBox(lines, frame, cfg);
        const pos = pickPosition(box, cfg);
        if (!pos) continue; // no clear spot this cycle — stay idle
        shown++;
        await runVignette(t, session, pos, box, frame, lines);
      }
    }

    const start = () => {
      if (token) return; // single instance — guard double-start on vis flips
      token = makeToken();
      const active = token;
      loop(active).catch((err) => {
        if (err !== CANCELLED) throw err;
      });
    };
    const stop = () => {
      token?.cancel();
      token = null;
      setView(null);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, devFast]);

  /* ---- reduced motion: one static, faint intercept ---- */
  if (reduced) {
    if (cfg.reducedMotionMode === "none") return null;
    const session = SESSIONS[0];
    const frame = buildFrame(cfg);
    return (
      <div
        aria-hidden
        className={fontClassName}
        style={{
          position: "fixed",
          right: "1.25rem",
          bottom: "1.25rem",
          zIndex: cfg.zIndex,
          pointerEvents: "none",
          fontSize: cfg.fontSizePx,
          lineHeight: 1.55,
          color: cfg.textColor,
          opacity: cfg.textOpacity * 0.8,
          textShadow:
            "0 0 1px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,0.95)",
          whiteSpace: "pre",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div style={{ color: cfg.accent, opacity: 0.85, fontSize: cfg.fontSizePx - 1 }}>
          {frame.telemetry}
        </div>
        <div>
          <ShellPrompt shell={frame.shell} accent={cfg.accent} textColor={cfg.textColor} />
          {session.cmd[0]}
        </div>
      </div>
    );
  }

  if (!view) return null;

  const lineH = cfg.fontSizePx * 1.55;
  const reticleColor = `color-mix(in srgb, ${cfg.textColor} ${Math.round(
    cfg.reticleOpacity * 100,
  )}%, transparent)`;

  const s = cfg.scrimStrength;
  // Dark glyph halo — a tight outline + soft glow so near-white text reads on
  // bright-red, black, AND latte-white terrain. The single biggest legibility win.
  const haloAlpha = Math.min(1, 0.62 + s * 0.38);
  const textShadow =
    `0 0 1px rgba(0,0,0,${haloAlpha}),` +
    `0 0 2px rgba(0,0,0,${haloAlpha}),` +
    `0 0 5px rgba(0,0,0,${(haloAlpha * 0.85).toFixed(3)}),` +
    `0 1px 1px rgba(0,0,0,${haloAlpha})`;

  return (
    <>
      <style>{CARET_KEYFRAMES}</style>
      <div
        aria-hidden
        className={fontClassName}
        style={{
          position: "fixed",
          left: view.pos.left,
          top: view.pos.top,
          width: view.box.width,
          zIndex: cfg.zIndex,
          pointerEvents: "none",
          padding: "6px 9px",
          fontSize: cfg.fontSizePx,
          lineHeight: 1.55,
          color: cfg.textColor,
          whiteSpace: "pre",
          fontVariantNumeric: "tabular-nums",
          overflow: "hidden",
          // Roll-up: collapse max-height toward the top while fading.
          maxHeight: view.rolling ? 0 : view.box.height,
          opacity: view.rolling ? 0 : view.visible ? cfg.textOpacity : 0,
          transition: view.rolling
            ? `max-height ${cfg.collapseMs}ms ease-in, opacity ${cfg.fadeOutMs}ms ease ${cfg.collapseMs}ms`
            : `opacity ${cfg.fadeInMs}ms ease`,
          textShadow,
        }}
      >
        {/* Backdrop scrim: blur ONLY (no dark fill) — softens busy terrain
          detail behind the text without tinting a visible box. Feathered mask
          so the edges dissolve. Legibility comes from dark placement + halo. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backdropFilter: `blur(${cfg.scrimBlurPx}px) saturate(0.85)`,
            WebkitBackdropFilter: `blur(${cfg.scrimBlurPx}px) saturate(0.85)`,
            maskImage:
              "radial-gradient(125% 135% at 50% 46%, #000 0%, #000 55%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(125% 135% at 50% 46%, #000 0%, #000 55%, transparent 92%)",
          }}
        />

        {/* Content sits above the scrim. */}
        <div style={{ position: "relative", zIndex: 1 }}>
        {/* corner crop-marks (matches hero L-bracket style) */}
        <Reticle color={reticleColor} />

        {/* telemetry label */}
        <div
          style={{
            color: cfg.accent,
            opacity: 0.9,
            fontSize: cfg.fontSizePx - 1,
            letterSpacing: "0.02em",
            height: lineH,
            marginBottom: lineH * 0.5,
          }}
        >
          {view.frame.telemetry}
        </div>

        {/* transmission body */}
        {view.lines.map((line, i) => (
          <div key={i} style={{ height: lineH }}>
            {line.kind === "progress" ? (
              <ProgressBar
                label={line.text}
                pct={line.pct}
                accent={cfg.accent}
                textColor={cfg.textColor}
              />
            ) : (
              <>
                {line.kind === "cmd" &&
                  (line.prompt ? (
                    <ShellPrompt
                      shell={view.frame.shell}
                      accent={cfg.accent}
                      textColor={cfg.textColor}
                    />
                  ) : (
                    <span style={{ color: cfg.accent, opacity: 0.7 }}>{"› "}</span>
                  ))}
                <span>{line.text.slice(0, line.reveal)}</span>
                {view.caret === i && <Caret accent={cfg.accent} />}
              </>
            )}
          </div>
        ))}

        {/* statusline footer */}
        {cfg.statusline && (
          <Statusline
            status={view.frame.status}
            modeLine={view.frame.modeLine}
            accent={cfg.accent}
            textColor={cfg.textColor}
            lineH={lineH}
          />
        )}
        </div>
      </div>
    </>
  );
}

/* ---- pieces ---- */

function ShellPrompt({
  shell,
  accent,
  textColor,
}: {
  shell: Shell;
  accent: string;
  textColor: string;
}) {
  return (
    <span style={{ opacity: 0.85 }}>
      <span style={{ color: textColor, opacity: 0.7 }}>
        {shell.user}
        <span style={{ opacity: 0.5 }}>@</span>
        {shell.host}
      </span>
      <span style={{ color: textColor, opacity: 0.6 }}>{` ${shell.cwd} `}</span>
      <span style={{ color: accent, opacity: 0.85 }}>{"% "}</span>
    </span>
  );
}

function Caret({ accent }: { accent: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.55em",
        height: "0.95em",
        marginLeft: "0.08em",
        verticalAlign: "-0.1em",
        background: accent,
        animation: "at-caret-blink 1.05s steps(1, end) infinite",
      }}
    />
  );
}

function ProgressBar({
  label,
  pct,
  accent,
  textColor,
}: {
  label: string;
  pct: number;
  accent: string;
  textColor: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6em", width: "100%" }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span
        style={{
          position: "relative",
          flex: 1,
          height: "0.62em",
          // cell texture, like an ASCII bar track
          backgroundImage: `repeating-linear-gradient(90deg, ${cellColor(textColor, 0.16)} 0 3px, transparent 3px 5px)`,
          borderTop: `1px solid ${cellColor(textColor, 0.18)}`,
          borderBottom: `1px solid ${cellColor(textColor, 0.18)}`,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: accent,
            opacity: 0.65,
            transition: "width 80ms linear",
          }}
        />
      </span>
      <span style={{ opacity: 0.7, minWidth: "2.6em", textAlign: "right" }}>
        {pct}%
      </span>
    </span>
  );
}

function Statusline({
  status,
  modeLine,
  accent,
  textColor,
  lineH,
}: {
  status: Status;
  modeLine: string | null;
  accent: string;
  textColor: string;
  lineH: number;
}) {
  const sep = (
    <span style={{ color: textColor, opacity: 0.3 }}>{"  ·  "}</span>
  );
  return (
    <div
      style={{
        marginTop: lineH * 0.4,
        paddingTop: lineH * 0.3,
        borderTop: `1px solid ${cellColor(textColor, 0.16)}`,
        fontSize: cfg11(),
      }}
    >
      <div style={{ height: lineH, whiteSpace: "nowrap" }}>
        <span style={{ color: STATUS_COLORS.time }}>{status.time}</span>
        {sep}
        <span style={{ color: STATUS_COLORS.dir }}>{status.dir}</span>
        {sep}
        <span style={{ color: accent }}>{status.branch}</span>
        {sep}
        <span style={{ color: STATUS_COLORS.model }}>{status.model}</span>
        {sep}
        <span style={{ color: STATUS_COLORS.cost }}>{status.cost}</span>
      </div>
      {modeLine && (
        <div style={{ height: lineH, color: STATUS_COLORS.mode, opacity: 0.85 }}>
          <span style={{ color: accent }}>{"▶▶ "}</span>
          {modeLine}
        </div>
      )}
    </div>
  );
}

/* L-shaped corner brackets — small crop-marks, one per corner. */
function Reticle({ color }: { color: string }) {
  const len = 9;
  const w = 1;
  const base = { position: "absolute" as const, width: len, height: len };
  return (
    <>
      <span style={{ ...base, left: 0, top: 0, borderLeft: `${w}px solid ${color}`, borderTop: `${w}px solid ${color}` }} />
      <span style={{ ...base, right: 0, top: 0, borderRight: `${w}px solid ${color}`, borderTop: `${w}px solid ${color}` }} />
      <span style={{ ...base, left: 0, bottom: 0, borderLeft: `${w}px solid ${color}`, borderBottom: `${w}px solid ${color}` }} />
      <span style={{ ...base, right: 0, bottom: 0, borderRight: `${w}px solid ${color}`, borderBottom: `${w}px solid ${color}` }} />
    </>
  );
}

function cellColor(textColor: string, alpha: number): string {
  return `color-mix(in srgb, ${textColor} ${Math.round(alpha * 100)}%, transparent)`;
}

// Statusline runs one notch smaller than the body.
function cfg11(): string {
  return "0.92em";
}

const CARET_KEYFRAMES = `@keyframes at-caret-blink{0%,49%{opacity:1}50%,100%{opacity:0}}`;
