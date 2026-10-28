import { forceSimulation, forceX, forceY, type Simulation } from "d3";
import {
  COL,
  LAYERS,
  ROOT,
  SUBS,
  TOOLS,
  WEAVE,
  hubRole,
  layerColor,
  layerName,
  rootRole,
  type LayerKey,
} from "./data";

/**
 * The Weave stack graph: agent infrastructure in three layers. A port of
 * the approved prototype (weave-stack.html) into a mount function.
 *
 * Wide (container ≥ 1000px): the prototype unchanged. A 1240px artboard,
 * scaled down a little when the container is narrower.
 *
 * Narrow (phones, tablets): the same structure turned on its side. One
 * straight line runs down the left: root, then each layer's hub, with
 * that layer's tools hanging off it on short horizontal ticks and their
 * labels to the right. Cross-layer threads arc through the left margin, so
 * they never cross a label. Tapping a tool opens its role and threads in
 * place, and the rows below slide down to make room.
 */

const NS = "http://www.w3.org/2000/svg";
const WIDE_MIN = 1000;
const WIDE_W = 1240;

type Mode = "wide" | "narrow";

type WNode = {
  id: string;
  kind: "root" | "hub" | "tool";
  layer: LayerKey | null;
  role: string;
  subs?: string;
  sx: number;
  sy: number;
  side: "above" | "below" | "right";
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  // Collision box, relative to the node centre.
  bx0: number;
  bx1: number;
  top: number;
  bottom: number;
  /** Narrow row height. */
  rh: number;
};

type WLink = { source: string; target: string; kind: "trunk" | "tree" | "weave"; el?: SVGPathElement };

export type WeaveStackHandle = { setActive: (on: boolean) => void; destroy: () => void };

export function mountWeaveStack(root: HTMLElement): WeaveStackHandle {
  const $ = <T extends HTMLElement = HTMLElement>(k: string) =>
    root.querySelector(`[data-ws="${k}"]`) as T;
  const holder = $("holder");
  const art = $("art");
  const graph = $("graph");
  const bandsEl = $("bands");
  const nodesEl = $("nodes");
  const svg = root.querySelector('[data-ws="links"]') as unknown as SVGSVGElement;
  const detail = $("detail");
  const ac = new AbortController();
  const listen = (el: EventTarget, type: string, fn: (e: any) => void) =>
    el.addEventListener(type, fn, { signal: ac.signal });

  const app = {
    sub: "o",
    sel: null as string | null,
    hover: null as string | null,
    drag: null as WNode | null,
    mode: null as Mode | null,
    W: WIDE_W,
    H: 600,
    detailH: 0,
    active: true,
  };

  /* ------------------------------ nodes ------------------------------------ */
  const blank = { sx: 0, sy: 0, side: "below" as const, bx0: 0, bx1: 0, top: 0, bottom: 0, rh: 34 };
  const nodes: WNode[] = [{ ...blank, id: ROOT, kind: "root", layer: null, role: rootRole }];
  LAYERS.forEach((k) => nodes.push({ ...blank, id: layerName[k], kind: "hub", layer: k, role: hubRole[k] }));
  TOOLS.forEach(([id, layer, role, subs]) => nodes.push({ ...blank, id, layer, role, subs, kind: "tool" }));
  const byId: Record<string, WNode> = {};
  nodes.forEach((n) => {
    byId[n.id] = n;
  });

  const links: WLink[] = [];
  LAYERS.forEach((k) => links.push({ source: ROOT, target: layerName[k], kind: "trunk" }));
  TOOLS.forEach(([id, layer]) => links.push({ source: layerName[layer], target: id, kind: "tree" }));
  WEAVE.forEach(([a, b]) => links.push({ source: a, target: b, kind: "weave" }));
  const adj: Record<string, Set<string>> = {};
  nodes.forEach((n) => {
    adj[n.id] = new Set();
  });
  links.forEach((l) => {
    adj[l.source].add(l.target);
    adj[l.target].add(l.source);
  });

  const markSize = (n: WNode) => (n.kind === "root" ? 24 : n.kind === "hub" ? 18 : n.layer === "v" ? 10 : 12);

  /* ------------------------------ layouts ---------------------------------- */
  type Band = { top: number; h: number };
  let bands: Band[] = [];

  // The prototype's layout, unchanged.
  function layoutWide() {
    const PER_ROW = 5,
      X0 = 300,
      DX = 210,
      SPINE = 46,
      HUB_X = 62;
    const W = WIDE_W;
    const r = byId[ROOT];
    r.sx = HUB_X;
    r.sy = 34;
    r.side = "below";
    bands = [];
    let bandTop = 86;
    LAYERS.forEach((k) => {
      const members = nodes.filter((n) => n.layer === k && n.kind === "tool");
      const hub = byId[layerName[k]];
      hub.sx = HUB_X;
      hub.side = "below";
      let bottom: number;
      if (members.length <= PER_ROW) {
        const spine = bandTop + 24,
          row = spine + SPINE;
        members.forEach((n, i) => {
          n.sx = X0 + i * DX;
          n.sy = row;
          n.side = "below";
        });
        hub.sy = spine;
        bottom = row + 46;
      } else {
        const rowA = bandTop + 38,
          spine = rowA + SPINE,
          rowB = spine + SPINE;
        const second = members.slice(PER_ROW);
        members.slice(0, PER_ROW).forEach((n, i) => {
          n.sx = X0 + i * DX;
          n.sy = rowA;
          n.side = "above";
        });
        second.forEach((n, i) => {
          const idx = second.length > 1 ? Math.round((i * (PER_ROW - 2)) / (second.length - 1)) : 0;
          n.sx = X0 + DX / 2 + idx * DX;
          n.sy = rowB;
          n.side = "below";
        });
        hub.sy = spine;
        bottom = rowB + 46;
      }
      bands.push({ top: bandTop, h: bottom - bandTop });
      bandTop = bottom + 24;
    });
    nodes.forEach((n) => {
      const lw = n.kind === "tool" ? n.id.length * 8.5 : n.id.length * 9.2;
      const hw = Math.max(16, lw / 2 + 5);
      n.bx0 = -hw;
      n.bx1 = hw;
      n.top = n.side === "above" ? 32 : 12;
      n.bottom = n.side === "above" ? 12 : 30;
    });
    app.W = W;
    app.H = bandTop - 14;
  }

  // Narrow geometry.
  const TX = 40; // the line down the left: root and hubs
  const MX = TX + 30; // tool marks
  const LX = MX + 14; // tool labels start
  const ROW = 34;

  function layoutNarrow(W: number) {
    const maxw = Math.max(120, W - LX - 6);
    const r = byId[ROOT];
    r.sx = TX;
    r.sy = 26;
    r.side = "right";
    bands = [];
    let y = 62;
    LAYERS.forEach((k) => {
      const hub = byId[layerName[k]];
      hub.sx = TX;
      hub.sy = y + 22;
      hub.side = "right";
      let c = hub.sy + 18;
      nodes
        .filter((n) => n.layer === k && n.kind === "tool")
        .forEach((n) => {
          const lines = n.id.length * 8.5 + 8 > maxw ? 2 : 1;
          n.rh = lines === 1 ? ROW : ROW + 18;
          n.sx = MX;
          n.sy = c + n.rh / 2;
          n.side = "right";
          c += n.rh;
          if (app.sel === n.id && app.detailH) c += app.detailH + 10;
        });
      const bottom = c + 10;
      bands.push({ top: y, h: bottom - y });
      y = bottom + 14;
    });
    nodes.forEach((n) => {
      const lw = Math.min(maxw, n.id.length * 8.5 + 8);
      n.bx0 = -10;
      n.bx1 = 14 + lw;
      n.top = n.bottom = n.kind === "tool" ? n.rh / 2 - 2 : 12;
    });
    app.W = W;
    app.H = y - 4;
    root.style.setProperty("--ws-lw", `${maxw}px`);
  }

  /* -------------------------------- DOM ------------------------------------ */
  const bandEls = LAYERS.map(() => {
    const d = document.createElement("div");
    d.className = "bandbox";
    bandsEl.appendChild(d);
    return d;
  });
  links.forEach((l) => {
    l.el = document.createElementNS(NS, "path");
    l.el.setAttribute("fill", "none");
  });
  // Hub lines first, cross-layer threads on top.
  links
    .filter((l) => l.kind !== "weave")
    .concat(links.filter((l) => l.kind === "weave"))
    .forEach((l) => svg.appendChild(l.el!));
  const firstWeave = links.find((l) => l.kind === "weave")!.el!;
  let lastFocus: string | null = null;

  const els = new Map<string, { b: HTMLButtonElement; mark: HTMLSpanElement; label: HTMLSpanElement }>();
  nodes.forEach((n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "node" + (n.kind === "tool" ? "" : " hub") + (n.kind === "root" ? " root" : "");
    const mark = document.createElement("span");
    mark.className = "mark";
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = n.id;
    b.append(mark, label);
    listen(b, "pointerdown", (e) => down(n, e));
    listen(b, "click", () => select(n.id));
    listen(b, "mouseenter", () => {
      app.hover = n.id;
      queue();
    });
    listen(b, "mouseleave", () => {
      app.hover = null;
      queue();
    });
    listen(b, "focus", () => {
      app.hover = n.id;
      queue();
    });
    listen(b, "blur", () => {
      app.hover = null;
      queue();
    });
    nodesEl.appendChild(b);
    els.set(n.id, { b, mark, label });
  });
  listen(graph, "click", (e) => {
    if (e.target === e.currentTarget || e.target === nodesEl) select(null);
  });

  const tabsEl = $("tabs");
  SUBS.forEach((s) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s.tab;
    listen(b, "click", () => {
      app.sub = s.id;
      panel();
    });
    tabsEl.appendChild(b);
  });

  /* ------------------------------ physics ---------------------------------- */
  // Label-box collision, so a dragged tool pushes its neighbours' labels too.
  function boxCollide() {
    let ns: WNode[] = [];
    function force(alpha: number) {
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i],
            b = ns[j];
          const ax0 = a.x! + a.bx0,
            ax1 = a.x! + a.bx1,
            bx0 = b.x! + b.bx0,
            bx1 = b.x! + b.bx1;
          const ox = Math.min(ax1, bx1) - Math.max(ax0, bx0);
          if (ox <= 0) continue;
          const ay0 = a.y! - a.top,
            ay1 = a.y! + a.bottom,
            by0 = b.y! - b.top,
            by1 = b.y! + b.bottom;
          const oy = Math.min(ay1, by1) - Math.max(ay0, by0);
          if (oy <= 0) continue;
          const k = 0.5 * Math.min(1, alpha * 4 + 0.2);
          const af = a.fx != null,
            bf = b.fx != null;
          if (ox < oy) {
            const dx = (bx0 + bx1) / 2 - (ax0 + ax1) / 2;
            const s = (dx >= 0 ? 1 : -1) * ox * k;
            if (!af) a.vx! -= bf ? s * 2 : s;
            if (!bf) b.vx! += af ? s * 2 : s;
          } else {
            const s = (b.y! - a.y! >= 0 ? 1 : -1) * oy * k;
            if (!af) a.vy! -= bf ? s * 2 : s;
            if (!bf) b.vy! += af ? s * 2 : s;
          }
        }
      }
    }
    force.initialize = (n: WNode[]) => {
      ns = n;
    };
    return force;
  }

  const sim: Simulation<WNode, undefined> = forceSimulation<WNode>([])
    .force("collide", boxCollide() as any)
    .force("x", forceX<WNode>((d) => d.sx).strength(0.24))
    .force("y", forceY<WNode>((d) => d.sy).strength(0.24))
    .alphaDecay(0.018)
    .velocityDecay(0.32)
    .on("tick", () => {
      const narrow = app.mode === "narrow";
      nodes.forEach((n) => {
        n.x = Math.max(narrow ? TX + 16 : 40, Math.min(app.W - (narrow ? 20 : 40), n.x!));
        n.y = Math.max(20, Math.min(app.H - (narrow ? 20 : 50), n.y!));
      });
      queue();
    })
    .stop();

  /** Lay the graph out for a mode. `slide` starts tools a little left of their slots so rows slide in. */
  function relayout(slide: boolean) {
    if (app.mode === "wide") layoutWide();
    else layoutNarrow(graph.clientWidth || 360);
    graph.style.height = app.H + "px";
    svg.setAttribute("width", String(app.W));
    svg.setAttribute("height", String(app.H));
    bands.forEach((b, i) => {
      bandEls[i].style.top = b.top + "px";
      bandEls[i].style.height = b.h + "px";
    });
    const off = app.mode === "wide" ? 70 : 24;
    nodes.forEach((n) => {
      const pinned = n.kind !== "tool";
      if (slide || n.x == null) {
        n.x = n.sx - (pinned ? 0 : off);
        n.y = n.sy;
      }
      if (pinned) {
        n.fx = n.sx;
        n.fy = n.sy;
      }
    });
    if (sim.nodes().length === 0) sim.nodes(nodes);
    // forceX/forceY cache their targets, so hand them the new slots.
    (sim.force("x") as any).x((d: WNode) => d.sx);
    (sim.force("y") as any).y((d: WNode) => d.sy);
    sim.alpha(slide ? 1 : 0.6);
    if (app.active) sim.restart();
    queue();
  }

  function down(n: WNode, e: PointerEvent) {
    // Pointer capture is left to the window listeners below, as in the prototype.
    if (e.button) return;
    app.drag = n;
    n.fx = n.x;
    n.fy = n.y;
    sim.alphaTarget(0.25);
    if (app.active) sim.restart();
    select(n.id);
  }
  listen(window, "pointermove", (e: PointerEvent) => {
    const n = app.drag;
    if (!n) return;
    const rect = graph.getBoundingClientRect();
    const s = rect.width / app.W || 1;
    n.fx = (e.clientX - rect.left) / s;
    n.fy = (e.clientY - rect.top) / s;
  });
  const up = () => {
    const n = app.drag;
    if (!n) return;
    n.fx = n.kind !== "tool" ? n.sx : null;
    n.fy = n.kind !== "tool" ? n.sy : null;
    app.drag = null;
    sim.alphaTarget(0);
  };
  listen(window, "pointerup", up);
  listen(window, "pointercancel", up);

  /* ------------------------------ render ----------------------------------- */
  let queued = false;
  let raf = 0;
  function queue() {
    if (queued) return;
    queued = true;
    raf = requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }
  const r1 = (v: number) => Math.round(v * 10) / 10;
  const edgeY = (n: WNode, dir: number) => n.y! + dir * (markSize(n) / 2 + 3);
  const edgeX = (n: WNode, dir: number) => n.x! + dir * (markSize(n) / 2 + 3);

  // Wide: one horizontal line runs out from the hub; each tool hangs off it on a short vertical tick.
  // Narrow: the same, turned: down the left line, then a short horizontal tick to the tool.
  // Every tool's path covers the line up to its own tick, so a focused tool lights its whole route.
  function fanPath(hub: WNode, n: WNode) {
    if (app.mode === "narrow") return `M ${r1(hub.x!)} ${r1(edgeY(hub, 1))} V ${r1(n.y!)} H ${r1(edgeX(n, -1))}`;
    const hx = hub.x! + markSize(hub) / 2 + 4;
    return `M ${r1(hx)} ${r1(hub.y!)} H ${r1(n.x!)} V ${r1(edgeY(n, n.y! < hub.y! ? 1 : -1))}`;
  }
  // Solid mixes instead of opacity, so paths that share the hub line don't stack up brighter.
  function mix(hex: string, t: number) {
    const a = parseInt(hex.slice(1), 16),
      b = parseInt(COL.band.slice(1), 16);
    const ch = (v: number, sh: number) => (v >> sh) & 255;
    const c = (sh: number) => Math.round(ch(b, sh) + (ch(a, sh) - ch(b, sh)) * t);
    return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
  }
  function trunkPath(rt: WNode, hub: WNode) {
    return `M ${r1(rt.x!)} ${r1(edgeY(rt, 1) + 4)} L ${r1(hub.x!)} ${r1(edgeY(hub, -1))}`;
  }
  function weavePath(a: WNode, b: WNode) {
    const dy = b.y! - a.y!,
      dx = b.x! - a.x!;
    if (app.mode === "narrow") {
      // Arc through the left margin, away from the labels.
      const cx = TX - 8 - Math.min(TX - 14, 6 + Math.abs(dy) * 0.05);
      return `M ${r1(edgeX(a, -1))} ${r1(a.y!)} C ${r1(cx)} ${r1(a.y!)} ${r1(cx)} ${r1(b.y!)} ${r1(edgeX(b, -1))} ${r1(b.y!)}`;
    }
    if (Math.abs(dy) < 30) {
      // Same row: bow toward the spine, away from the labels.
      const dir = a.side === "above" ? 1 : -1;
      const y = a.y! + dir * (26 + Math.abs(dx) * 0.06);
      return `M ${r1(a.x!)} ${r1(edgeY(a, dir))} C ${r1(a.x!)} ${r1(y)} ${r1(b.x!)} ${r1(y)} ${r1(b.x!)} ${r1(edgeY(b, dir))}`;
    }
    const [p, q] = dy > 0 ? [a, b] : [b, a];
    const m = (p.y! + q.y!) / 2;
    // A long, nearly vertical thread would run through the tools between its ends; swing it aside.
    const off = Math.abs(dx) < 60 && Math.abs(dy) > 200 ? 90 : 0;
    return `M ${r1(p.x!)} ${r1(edgeY(p, 1))} C ${r1(p.x! + off)} ${r1(m)} ${r1(q.x! + off)} ${r1(m)} ${r1(q.x!)} ${r1(edgeY(q, -1))}`;
  }

  function render() {
    const narrow = app.mode === "narrow";
    const focus = app.hover || app.sel;
    const fadj = focus ? adj[focus] : null;
    const inSub = (n: WNode) => n.kind !== "tool" || n.subs!.includes(app.sub);
    const colorOf = (n: WNode) => (n.kind === "root" ? COL.fg : layerColor[n.layer!]);

    links.forEach((l) => {
      const s = byId[l.source],
        t = byId[l.target];
      const weaveL = l.kind === "weave";
      l.el!.setAttribute("d", weaveL ? weavePath(s, t) : l.kind === "trunk" ? trunkPath(s, t) : fanPath(s, t));
      const hot = !!focus && (s.id === focus || t.id === focus);
      const lit = inSub(s) && inSub(t);
      let stroke: string,
        op: number,
        w = 1;
      if (weaveL) {
        stroke = hot ? COL.fg : COL.muted;
        op = focus ? (hot ? 0.9 : 0.05) : lit ? 0.38 : 0.1;
        l.el!.setAttribute("stroke-dasharray", "3 4");
      } else {
        stroke = mix(colorOf(t), focus ? (hot ? 0.95 : 0.12) : lit ? 0.55 : 0.18);
        op = 1;
      }
      if (hot) w = 1.5;
      l.el!.setAttribute("stroke", stroke);
      l.el!.setAttribute("stroke-opacity", String(op));
      l.el!.setAttribute("stroke-width", String(w));
    });
    // Lit routes draw over the shared hub line.
    if (focus !== lastFocus) {
      lastFocus = focus;
      links
        .filter((l) => l.kind !== "weave" && focus && (l.source === focus || l.target === focus))
        .forEach((l) => svg.insertBefore(l.el!, firstWeave));
    }

    nodes.forEach((n) => {
      const el = els.get(n.id)!;
      const c = colorOf(n);
      const lit = focus ? n.id === focus || fadj!.has(n.id) : inSub(n);
      const size = markSize(n);
      const filled = n.kind === "hub" || (n.kind === "tool" && n.id === focus);
      el.b.style.left = r1(n.x!) + "px";
      el.b.style.top = r1(n.y!) + "px";
      el.b.style.opacity = lit ? "1" : "0.34";
      el.b.setAttribute("aria-pressed", app.sel === n.id ? "true" : "false");
      const m = el.mark.style;
      m.width = size + "px";
      m.height = size + "px";
      m.border = `1.5px solid ${c}`;
      m.background = filled ? c : COL.bg;
      m.borderRadius = n.kind === "root" || n.layer === "m" ? "50%" : n.layer === "v" ? "1px" : "2px";
      m.transform = n.layer === "v" ? "rotate(45deg)" : "";
      m.boxShadow = n.kind === "root" ? `0 0 0 5px ${COL.bg}, 0 0 0 6px ${COL.fg}` : "none";
      const t = el.label.style;
      // Narrow labels sit to the right of the mark; the stylesheet places them.
      t.top = narrow
        ? ""
        : (n.side === "above" ? -6 : n.kind === "root" ? 38 : n.kind === "hub" ? 34 : 30) + "px";
      t.fontWeight = n.kind !== "tool" || n.id === focus ? "700" : "400";
      t.color = n.kind !== "tool" ? c : lit ? COL.fg : COL.muted;
    });

    // Narrow: the selected tool's role and threads open in place, under its label.
    const sel = narrow && app.sel ? byId[app.sel] : null;
    if (sel && sel.kind === "tool") {
      detail.hidden = false;
      detail.style.top = r1(sel.y! + sel.rh / 2 - 4) + "px";
      detail.style.left = r1(sel.x! + 12) + "px";
    } else {
      detail.hidden = true;
    }
  }

  /* ------------------------------- panel ----------------------------------- */
  function roleOf(n: WNode) {
    let role = n.role;
    if (n.kind === "tool") {
      const where = SUBS.filter((s) => n.subs!.includes(s.id)).map((s) => s.tab.toLowerCase());
      role += " Used in " + (where.length === 3 ? "all three" : where.join(" and ")) + ".";
    }
    return role;
  }
  const threadsOf = (n: WNode) =>
    Array.from(adj[n.id])
      .filter((x) => x !== ROOT)
      .sort();

  function panel() {
    Array.from(tabsEl.children).forEach((b, i) =>
      b.setAttribute("aria-pressed", SUBS[i].id === app.sub ? "true" : "false"),
    );
    const S = SUBS.find((s) => s.id === app.sub)!;
    $("oneLiner").textContent = S.line;
    const used = TOOLS.filter((t) => t[3].includes(app.sub)).length;
    $("caption").textContent = `fig. 02 — ${TOOLS.length} tools · 3 layers · ${WEAVE.length} cross-layer threads · ${used} used in ${S.tab.toLowerCase()}`;

    const n = app.sel ? byId[app.sel] : null;
    $("sel").hidden = !n;
    $("noSel").hidden = !!n;
    if (n) {
      $("selName").textContent = n.id;
      const sl = $("selLayer");
      sl.textContent = n.kind === "root" ? "Root" : n.kind === "hub" ? "Layer" : layerName[n.layer!];
      sl.style.color = n.kind === "root" ? COL.fg : layerColor[n.layer!];
      $("selRole").textContent = roleOf(n);
      const threads = threadsOf(n);
      $("threadCount").textContent = String(threads.length);
      $("chips").replaceChildren(
        ...threads.map((name) => {
          const s = document.createElement("span");
          s.textContent = name;
          return s;
        }),
      );
    }
    queue();
  }

  function select(id: string | null) {
    if (app.sel === id) return;
    app.sel = id;
    panel();
    if (app.mode !== "narrow") return;
    const n = id ? byId[id] : null;
    if (n && n.kind === "tool") {
      const threads = threadsOf(n).filter((x) => byId[x].kind === "tool");
      detail.innerHTML = "";
      const p = document.createElement("p");
      p.textContent = roleOf(n);
      detail.append(p);
      if (threads.length) {
        const t = document.createElement("p");
        t.className = "threads";
        t.textContent = "Threads · " + threads.join(", ");
        detail.append(t);
      }
      detail.hidden = false;
      app.detailH = detail.offsetHeight;
    } else {
      app.detailH = 0;
    }
    relayout(false);
  }

  function legend() {
    const item = (inner: string, text: string) =>
      `<span><svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true">${inner}</svg>${text}</span>`;
    const st = (c: string) => `stroke="${c}" stroke-width="1.5" fill="${COL.bg}"`;
    $("legend").innerHTML = [
      item(`<circle r="5.5" ${st(COL.sand)}/>`, "Agents"),
      item(`<rect x="-5.5" y="-5.5" width="11" height="11" rx="2" ${st(COL.ember)}/>`, "Harness"),
      item(`<rect x="-4.5" y="-4.5" width="9" height="9" transform="rotate(45)" ${st(COL.gold)}/>`, "Evaluation"),
      item(`<line x1="-8" x2="8" stroke="${COL.muted}" stroke-dasharray="3 3"/>`, "Cross-layer thread"),
    ].join("");
  }

  /* -------------------------------- fit ------------------------------------ */
  let lastNarrowW = 0;
  function fit() {
    const w = holder.clientWidth;
    const mode: Mode = w >= WIDE_MIN ? "wide" : "narrow";
    const changed = mode !== app.mode;
    if (changed) {
      app.mode = mode;
      root.classList.toggle("ws-narrow", mode === "narrow");
      root.classList.toggle("ws-wide", mode === "wide");
    }
    if (mode === "wide") {
      const k = Math.min(1, w / WIDE_W);
      art.style.transform = k < 1 ? `scale(${k})` : "";
      if (changed) relayout(true);
      holder.style.height = Math.ceil(art.offsetHeight * k) + "px";
    } else {
      art.style.transform = "";
      holder.style.height = "";
      const gw = graph.clientWidth;
      if (changed || Math.abs(gw - lastNarrowW) > 1) {
        lastNarrowW = gw;
        if (app.sel && byId[app.sel].kind === "tool") {
          detail.hidden = false;
          app.detailH = detail.offsetHeight;
        }
        relayout(changed);
      }
    }
  }

  legend();
  panel();
  fit();
  const ro = new ResizeObserver(() => fit());
  ro.observe(holder);
  let alive = true;
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => {
      if (alive) fit();
    });

  return {
    setActive(on: boolean) {
      if (on === app.active) return;
      app.active = on;
      if (!on) sim.stop();
      else if (sim.alpha() > sim.alphaMin()) sim.restart();
    },
    destroy() {
      alive = false;
      ac.abort();
      ro.disconnect();
      sim.stop();
      cancelAnimationFrame(raf);
      [bandsEl, nodesEl, tabsEl, $("legend"), $("chips")].forEach((el) => el.replaceChildren());
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    },
  };
}
