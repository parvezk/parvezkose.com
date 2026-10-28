import {
  arc as d3arc,
  drag as d3drag,
  easeCubicInOut,
  easeCubicOut,
  forceSimulation,
  pointer,
  select,
  timer as d3timer,
  zoom as d3zoom,
  zoomIdentity,
  zoomTransform,
  type Selection,
} from "d3";
import {
  CAPTIONS,
  DROPPED,
  HANDOFFS,
  KEYS,
  LAYOUTS,
  SPEED,
  STREAMS,
  TEXT,
  TOOLS,
  type CaptionKey,
} from "./data";

/**
 * The Gravity Wells force graph. A straight port of the approved
 * prototype's script (gravity-wells-site.html, v6) into a mount function
 * so React can own its lifetime. Behaviour and drawing are unchanged; the
 * differences are plumbing:
 *   - elements are looked up inside `root` by `data-gw` instead of by id,
 *   - SVG ids are prefixed with `gw-` so they can't clash with the page,
 *   - `setActive(false)` pauses the simulation and orbit timer while the
 *     section is off screen,
 *   - `destroy()` stops every timer, observer and listener.
 */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export type GravityWellsHandle = {
  setActive: (on: boolean) => void;
  destroy: () => void;
};


export function mountGravityWells(root: HTMLElement): GravityWellsHandle {
  const $ = <T extends Element = HTMLElement>(k: string) =>
    root.querySelector(`[data-gw="${k}"]`) as unknown as T;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ui = { orbiting: !reduceMotion, handoffs: true, mode: "home", lens: false, active: true };
  const rot: Record<string, number> = { research: 0, design: 0, engineering: 0 };

  const svgEl = $<SVGSVGElement>("graph");
  const svg = select(svgEl) as unknown as Selection<SVGSVGElement, unknown, null, undefined>;
  const stageEl = $("stage");
  const tipEl = $("tip");
  const readout = $("readout");
  const captionEl = $("caption");
  const defaultText = readout.textContent;
  const stateWord: Record<string, string> = { active: "daily use", evaluating: "trying", backlog: "parked" };
  const ringWord: Record<string, string> = { active: "daily use orbit", evaluating: "trying orbit", backlog: "parked orbit" };
  const pct = (v: number) => Math.round(v * 100) + "%";

  $("dropped").innerHTML =
    `<span class="tag">Dropped</span>` +
    DROPPED.map((d) => `<span>${d}</span>`).join(`<span class="sep" aria-hidden="true">•</span>`);

  function caption(key: CaptionKey) {
    const [t, s] = CAPTIONS[key];
    captionEl.innerHTML = `<b>${t}:</b>${s}`;
  }
  caption("home");

  function showTip(html: string, el: Element) {
    tipEl.innerHTML = html;
    tipEl.hidden = false;
    const s = stageEl.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    const half = tipEl.offsetWidth / 2;
    const x = Math.max(half + 6, Math.min(s.width - half - 6, r.left - s.left + r.width / 2));
    const y = r.top - s.top;
    tipEl.style.left = x + "px";
    tipEl.style.top = y + "px";
    tipEl.style.transform = y - tipEl.offsetHeight - 14 < 0 ? `translate(-50%, ${r.height + 12}px)` : "";
  }
  function hideTip() {
    tipEl.hidden = true;
  }

  type Built = {
    name: string;
    sim: any;
    setMode: (m: string) => void;
    scatter: () => void;
    resize: () => void;
    destroy: () => void;
    zoomBy: (f: number) => void;
    zoomReset: () => void;
    setLens: (on: boolean) => void;
    pause: () => void;
    resume: () => void;
  };
  let current: Built | null = null;

  function build(name: "wide" | "narrow"): Built {
    const L = LAYOUTS[name];
    const { W, H, ring: RING } = L;
    const WELLS: Record<string, any> = {};
    Object.entries(STREAMS).forEach(([k, s]) => {
      WELLS[k] = { ...s, key: k, x: L.pos[k][0], y: L.pos[k][1] };
    });
    const CLI = { x: L.cli.cx, y: L.cli.cy };
    const centre = (n: any) => (n.ws === "cli" ? CLI : WELLS[n.ws]);

    svg.selectAll("*").remove();
    svg
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("max-width", W + "px")
      .classed("handoffs-off", !ui.handoffs)
      .classed("picking", false);

    const fs: Record<string, number> = {};
    function sizeText() {
      const scale = Math.min(
        L.maxScale,
        Math.max(1, W / (svgEl.clientWidth || W), H / (svgEl.clientHeight || H)),
      );
      Object.entries(TEXT).forEach(([k, px]) => {
        fs[k] = px * scale * (L.textScale || 1);
        svgEl.style.setProperty("--fs-" + k, fs[k] + "px");
      });
    }
    sizeText();

    // ---- Nodes ----
    const hubs: any[] = [];
    Object.entries(WELLS).forEach(([ws, w]) => {
      const n = w.practices.length;
      w.practices.forEach((p: string, i: number) =>
        hubs.push({ kind: "hub", id: ws + ":" + p, label: p.toUpperCase(), ws, p, theta: w.base + i * (TAU / n) }),
      );
    });
    const hubById = new Map(hubs.map((h) => [h.id, h]));

    const tools: any[] = TOOLS.map((t) => ({ kind: "tool", label: t.id, ...t, pull: [0, 0, 0] }));
    Object.entries(WELLS).forEach(([ws, w]) => {
      const sector = TAU / w.practices.length;
      w.practices.forEach((p: string) => {
        const group = tools.filter((t) => t.ws === ws && t.p === p);
        const m = group.length;
        const spread = Math.min(0.55, (sector * 0.75) / m);
        const hub = hubById.get(ws + ":" + p);
        group.forEach((t, j) => {
          t.theta = hub.theta + (j - (m - 1) / 2) * spread;
          t.r = RING[t.state];
          t.hub = hub;
        });
      });
    });
    tools
      .filter((t) => t.ws === "cli")
      .forEach((t, i) => {
        t.r = L.cli.r;
        t.theta = L.cli.slots[i] * DEG;
        t.fixedAngle = true;
      });

    const blendPull = (t: any) => KEYS.map((k, i) => (k === t.ws ? 0 : t.mix[i]));
    tools.forEach((t) => {
      t.pull = ui.mode === "blend" ? blendPull(t) : [0, 0, 0];
    });

    const nodes: any[] = [...hubs, ...tools];

    function target(n: any): [number, number] {
      const c = centre(n);
      const r = n.kind === "hub" ? L.hub : n.r;
      const a = n.theta + (n.fixedAngle ? 0 : rot[n.ws]);
      const sx = c.x + r * Math.cos(a),
        sy = c.y + r * Math.sin(a);
      // Pull is measured from the well centre for well tools (the whole orbit shifts) and from the slot for CLI tools.
      const ox = n.ws === "cli" ? sx : c.x,
        oy = n.ws === "cli" ? sy : c.y;
      let x = sx,
        y = sy;
      if (n.pull)
        KEYS.forEach((k, i) => {
          if (k === n.ws || !n.pull[i]) return;
          x += n.pull[i] * L.pull * (WELLS[k].x - ox);
          y += n.pull[i] * L.pull * (WELLS[k].y - oy);
        });
      return [x, y];
    }
    nodes.forEach((n) => {
      [n.x, n.y] = target(n);
    });

    function orbitForce(alpha: number) {
      const k = 0.22 * alpha;
      for (const n of nodes) {
        if (n.fx != null) continue;
        const [tx, ty] = target(n);
        n.vx += (tx - n.x) * k;
        n.vy += (ty - n.y) * k;
      }
    }

    // ---- Label placement, shared by drawing and collision. Labels sit on the side facing away from the centre. ----
    function place(n: any) {
      const c = centre(n);
      const dx = n.x - c.x,
        dy = n.y - c.y,
        len = Math.hypot(dx, dy) || 1;
      const ux = dx / len,
        uy = dy / len;
      const f = n.kind === "hub" ? fs.hub : fs.tool * (n.unused ? 0.8 : 1);
      const gap = (n.kind === "hub" ? 7 : 10) + f * 0.15;
      // Hysteresis: a label only flips sides once it is clearly past the turn, so it doesn't flicker.
      let anchor = n.anc || (ux > 0.25 ? "start" : ux < -0.25 ? "end" : "middle");
      if (ux > 0.35) anchor = "start";
      else if (ux < -0.35) anchor = "end";
      else if (Math.abs(ux) < 0.15) anchor = "middle";
      n.anc = anchor;
      const oy = anchor === "middle" ? (uy > 0 ? f * 0.9 : -f * 0.9) : 0;
      return { ox: ux * gap, oy: uy * gap + oy, anchor, f };
    }
    function box(n: any) {
      const p = place(n),
        w = n.lw || n.label.length * p.f * 0.62;
      const lx = n.x + p.ox,
        ly = n.y + p.oy;
      const x0 = p.anchor === "start" ? lx : p.anchor === "end" ? lx - w : lx - w / 2;
      const r = n.kind === "hub" ? 5 : 8;
      return {
        x0: Math.min(x0, n.x - r),
        x1: Math.max(x0 + w, n.x + r),
        y0: Math.min(ly - p.f * 0.62, n.y - r),
        y1: Math.max(ly + p.f * 0.62, n.y + r),
      };
    }

    // ---- Scene: everything that zooms ----
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "gw-arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("class", "arrowhead")
      .attr("d", "M0 1L10 5L0 9z");
    const lensClip = defs.append("clipPath").attr("id", "gw-lens-clip").append("circle").attr("r", 0);

    const scene = svg.append("g").attr("id", "gw-scene");
    scene
      .append("rect")
      .attr("class", "lens-bg")
      .attr("x", -W)
      .attr("y", -H)
      .attr("width", W * 3)
      .attr("height", H * 3);

    // Orbit rings, coloured by stream; inner rings strongest. Each has a wide invisible hit stroke for hover.
    const gRings = scene.append("g");
    const ringData: any[] = [];
    Object.values(WELLS).forEach((w) =>
      Object.entries(RING).forEach(([state, r]) => ringData.push({ w, state, r })),
    );
    const rings = gRings
      .selectAll("circle.ring")
      .data(ringData)
      .join("circle")
      .attr("class", "ring")
      .attr("cx", (d) => d.w.x)
      .attr("cy", (d) => d.w.y)
      .attr("r", (d) => d.r);
    gRings
      .selectAll("circle.ring-hit")
      .data(ringData)
      .join("circle")
      .attr("class", "ring-hit")
      .attr("cx", (d) => d.w.x)
      .attr("cy", (d) => d.w.y)
      .attr("r", (d) => d.r)
      .on("pointerenter", function (this: any, _e: any, d: any) {
        rings.classed("lit", (r) => r === d);
        showTip(
          `<b>${d.w.name} · ${ringWord[d.state]}</b>${
            tools
              .filter((t) => t.ws === d.w.key && t.state === d.state)
              .map((t) => t.id)
              .join(", ") || "Nothing here right now."
          }`,
          this,
        );
      })
      .on("pointerleave", () => {
        rings.classed("lit", false);
        hideTip();
      });

    // The CLI arc: tools I use in every stream.
    const staticText: any[] = [];
    const c = L.cli;
    scene
      .append("path")
      .attr("class", "cli-arc")
      .attr(
        "d",
        (d3arc() as any)({
          innerRadius: c.r,
          outerRadius: c.r,
          startAngle: c.from * DEG + Math.PI / 2,
          endAngle: c.to * DEG + Math.PI / 2,
        }),
      )
      .attr("transform", `translate(${c.cx},${c.cy})`);
    staticText.push(
      scene
        .append("text")
        .attr("class", "cli-label")
        .attr("x", c.cx + c.label.r * Math.cos(c.label.a * DEG))
        .attr("y", c.cy + c.label.r * Math.sin(c.label.a * DEG))
        .attr("text-anchor", c.label.anchor)
        .attr("dominant-baseline", "middle")
        .text("CLI · every stream"),
    );

    const gHandoffs = scene.append("g");
    const gPulls = scene.append("g");
    const gTree = scene.append("g");
    const gCores = scene.append("g");
    const gNodes = scene.append("g");

    const toolById = new Map(tools.map((t) => [t.id, t]));
    const handoffs = HANDOFFS.map(([a, b]) => ({ s: toolById.get(a), t: toolById.get(b) })).filter(
      (h) => h.s && h.t,
    );
    const handoffPaths = gHandoffs
      .selectAll("path")
      .data(handoffs)
      .join("path")
      .attr("class", "handoff")
      .attr("marker-end", "url(#gw-arrow)");

    const pullData = tools.flatMap((t) =>
      KEYS.map((k, i) => ({ t, k, i })).filter((d) => d.k !== t.ws && t.mix[d.i] > 0),
    );
    const pulls = gPulls.selectAll("line").data(pullData).join("line").attr("class", "pull");

    const trunks = gTree.selectAll("line.trunk").data(hubs).join("line").attr("class", "trunk");
    const branches = gTree
      .selectAll("line.branch")
      .data(tools.filter((t) => t.hub))
      .join("line")
      .attr("class", "branch");

    const hubG = gNodes.selectAll("g.hubg").data(hubs).join("g").attr("class", "hubg").attr("aria-hidden", "true");
    hubG.append("rect").attr("class", "hub").attr("x", -3.5).attr("y", -3.5).attr("width", 7).attr("height", 7);
    hubG
      .append("text")
      .attr("class", "hub-label")
      .attr("dominant-baseline", "middle")
      .text((d) => d.p);

    const coreG = gCores
      .selectAll("g")
      .data(Object.values(WELLS))
      .join("g")
      .attr("class", "coreg")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);
    coreG
      .append("circle")
      .attr("class", (d) => "well-core wl-" + d.key)
      .style("fill", "var(--bg)")
      .attr("r", 10);
    const wellText = coreG
      .append("text")
      .attr("class", (d) => "well-label wl-" + d.key)
      .style("stroke", "var(--bg)")
      .attr("text-anchor", "middle")
      .attr("y", -20)
      .text((d) => d.name);

    const toolG = gNodes
      .selectAll("g.tool")
      .data(tools)
      .join("g")
      .attr("class", (d) => "tool s-" + d.state + (d.unused ? " unused" : ""))
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr("aria-label", (d) => describe(d));
    toolG.append("circle").attr("class", "hit").attr("r", 16);
    toolG
      .append("circle")
      .attr("class", "dot")
      .attr("r", (d) => (d.unused ? 4 : d.state === "backlog" ? 5 : 6));
    toolG
      .append("text")
      .attr("class", "tool-label")
      .attr("dominant-baseline", "middle")
      .text((d) => d.id);

    // Lens: a magnified live copy of the scene, clipped to a circle that follows the pointer.
    const lensG = svg.append("g").attr("pointer-events", "none").style("display", "none");
    // The scene has no ground of its own (the panel is translucent), so the lens gets a backing disc.
    const lensBack = lensG.append("circle").attr("class", "lens-back");
    const lensUse = lensG.append("g").attr("clip-path", "url(#gw-lens-clip)").append("use").attr("href", "#gw-scene");
    const lensRing = lensG.append("circle").attr("class", "lens-ring");
    const LENS = { r: 0, k: 2 };

    // Fixed obstacles: well names and cores, the CLI label.
    let obstacles: any[] = [];
    function measure() {
      toolG.each(function (this: any, d: any) {
        d.lw = this.querySelector("text").getComputedTextLength();
      });
      hubG.each(function (this: any, d: any) {
        d.lw = this.querySelector("text").getComputedTextLength();
      });
      obstacles = [];
      wellText.each(function (this: any, d: any) {
        const b = this.getBBox();
        obstacles.push({ x0: d.x + b.x - 4, x1: d.x + b.x + b.width + 4, y0: d.y + b.y - 2, y1: d.y + 12 });
      });
      staticText.forEach((t) => {
        const b = t.node().getBBox();
        obstacles.push({ x0: b.x - 3, x1: b.x + b.width + 3, y0: b.y, y1: b.y + b.height });
      });
      // The zoom buttons float over the stage's top-right corner; keep labels out from under them.
      const zb = stageEl.querySelector(".zoombar");
      if (zb && svgEl.clientWidth) {
        const s = svgEl.getBoundingClientRect(),
          z = zb.getBoundingClientRect(),
          k = W / s.width;
        obstacles.push({
          x0: (z.left - s.left) * k - 4,
          x1: (z.right - s.left) * k + 4,
          y0: (z.top - s.top) * k - 4,
          y1: (z.bottom - s.top) * k + 4,
        });
      }
      LENS.r = 70 * Math.max(1, W / (svgEl.clientWidth || W), H / (svgEl.clientHeight || H));
    }
    measure();

    // Box collision: each node and its label form one box. Overlapping boxes are moved apart along the
    // shallower axis after every step, and kept inside the stage. A dragged node holds still and others give way.
    const PAD = 4,
      STR = 0.4;
    function shove(n: any, dx: number, dy: number) {
      n.x += dx;
      n.y += dy;
      if (dx && n.vx * dx < 0) n.vx = 0;
      if (dy && n.vy * dy < 0) n.vy = 0;
    }
    function resolveBoxes() {
      const bs = nodes.map(box);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i],
          A = bs[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j],
            B = bs[j];
          const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0) + PAD;
          const oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0) + PAD;
          if (ox <= 0 || oy <= 0) continue;
          const aFixed = a.fx != null,
            bFixed = b.fx != null;
          if (aFixed && bFixed) continue;
          const wa = aFixed ? 0 : bFixed ? 1 : 0.5,
            wb = 1 - wa;
          if (ox < oy) {
            const s = Math.sign(A.x0 + A.x1 - (B.x0 + B.x1)) || (i % 2 ? 1 : -1);
            shove(a, s * ox * STR * wa, 0);
            shove(b, -s * ox * STR * wb, 0);
          } else {
            const s = Math.sign(A.y0 + A.y1 - (B.y0 + B.y1)) || (i % 2 ? 1 : -1);
            shove(a, 0, s * oy * STR * wa);
            shove(b, 0, -s * oy * STR * wb);
          }
        }
        if (a.fx != null) continue;
        for (const O of obstacles) {
          const ox = Math.min(A.x1, O.x1) - Math.max(A.x0, O.x0) + PAD;
          const oy = Math.min(A.y1, O.y1) - Math.max(A.y0, O.y0) + PAD;
          if (ox <= 0 || oy <= 0) continue;
          if (ox < oy) shove(a, Math.sign(A.x0 + A.x1 - (O.x0 + O.x1)) * ox * STR, 0);
          else shove(a, 0, Math.sign(A.y0 + A.y1 - (O.y0 + O.y1)) * oy * STR);
        }
        const m = 6;
        if (A.x0 < m) shove(a, m - A.x0, 0);
        if (A.x1 > W - m) shove(a, -(A.x1 - (W - m)), 0);
        if (A.y0 < m) shove(a, 0, m - A.y0);
        if (A.y1 > H - m) shove(a, 0, -(A.y1 - (H - m)));
      }
    }

    function arcPath(d: any) {
      const sx = d.s.x,
        sy = d.s.y,
        tx = d.t.x,
        ty = d.t.y;
      const mx = (sx + tx) / 2,
        my = (sy + ty) / 2;
      const dx = tx - sx,
        dy = ty - sy,
        len = Math.hypot(dx, dy) || 1;
      const bend = Math.min(90, len * 0.22);
      const cx = mx - (dy / len) * bend,
        cy = my + (dx / len) * bend;
      const ex = tx - cx,
        ey = ty - cy,
        el = Math.hypot(ex, ey) || 1;
      const cl = Math.hypot(cx - sx, cy - sy) || 1;
      return `M${sx + ((cx - sx) / cl) * 10},${sy + ((cy - sy) / cl) * 10}Q${cx},${cy} ${tx - (ex / el) * 11},${ty - (ey / el) * 11}`;
    }

    let hot: any = null;
    function placeText(sel: any) {
      sel.each(function (this: any, d: any) {
        const p = place(d);
        select(this).select("text").attr("x", p.ox).attr("y", p.oy).attr("text-anchor", p.anchor);
      });
    }
    function render() {
      trunks
        .attr("x1", (d) => WELLS[d.ws].x)
        .attr("y1", (d) => WELLS[d.ws].y)
        .attr("x2", (d) => d.x)
        .attr("y2", (d) => d.y);
      branches
        .attr("x1", (d) => d.hub.x)
        .attr("y1", (d) => d.hub.y)
        .attr("x2", (d) => d.x)
        .attr("y2", (d) => d.y);
      hubG.attr("transform", (d) => `translate(${d.x},${d.y})`);
      placeText(hubG);
      toolG.attr("transform", (d) => `translate(${d.x},${d.y})`);
      placeText(toolG);
      handoffPaths.attr("d", arcPath);
      pulls.each(function (this: any, d: any) {
        const w = d.t.pull[d.i],
          o = WELLS[d.k];
        select(this)
          .attr("x1", d.t.x)
          .attr("y1", d.t.y)
          .attr("x2", o.x)
          .attr("y2", o.y)
          .attr("stroke-width", 0.4 + 3 * w)
          .attr("stroke-opacity", w < 0.01 ? 0 : hot && hot !== d.t ? 0.03 : 0.08 + 0.4 * w);
      });
    }

    const sim = forceSimulation(nodes)
      .velocityDecay(0.38)
      .force("orbit", orbitForce as any)
      .on("tick", () => {
        settle();
        render();
      })
      .stop();
    function settle() {
      for (let k = 0; k < 2; k++) resolveBoxes();
    }
    for (let i = 0; i < 260; i++) {
      sim.tick();
      settle();
    }
    render();
    if (ui.active) sim.alpha(0.3).alphaTarget(ui.orbiting ? 0.12 : 0).restart();

    // ---- Zoom: double-click a tool, or use the buttons. Drag the background to pan. Wheel scroll stays with the page. ----
    const zoom = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 4])
      .filter(
        (e: any) =>
          (e.type === "mousedown" || e.type === "touchstart") &&
          !e.button &&
          !e.target.closest(".tool, .ring-hit"),
      )
      .on("start", () => svg.classed("panning", true))
      .on("end", () => svg.classed("panning", false))
      .on("zoom", (e: any) => scene.attr("transform", e.transform));
    svg.call(zoom).on("dblclick.zoom", null).on("wheel.zoom", null);
    const zt = () => zoomTransform(svgEl);
    const ease = (sel: any) => (reduceMotion ? sel : sel.transition().duration(420).ease(easeCubicOut));
    function zoomTo(d: any) {
      const k = Math.min(4, zt().k * 1.25);
      ease(svg).call(zoom.transform, zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-d.x, -d.y));
    }
    const zoomBy = (f: number) => ease(svg).call(zoom.scaleBy, f);
    const zoomReset = () => ease(svg).call(zoom.transform, zoomIdentity);

    toolG.call(
      (d3drag() as any)
        .on("start", (e: any, d: any) => {
          if (!e.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          hideTip();
        })
        .on("drag", (e: any, d: any) => {
          d.fx = Math.max(10, Math.min(W - 10, e.x));
          d.fy = Math.max(10, Math.min(H - 10, e.y));
        })
        .on("end", (e: any, d: any) => {
          if (!e.active) sim.alphaTarget(ui.orbiting ? 0.12 : 0);
          d.fx = null;
          d.fy = null;
        }),
    );
    toolG.on("dblclick", (e: any, d: any) => {
      e.preventDefault();
      e.stopPropagation();
      zoomTo(d);
    });

    // ---- Picking: hover or keyboard focus ----
    function pick(d: any, el?: Element) {
      hot = d;
      const linked = new Set();
      handoffs.forEach((h) => {
        if (h.s === d) linked.add(h.t);
        if (h.t === d) linked.add(h.s);
      });
      svg.classed("picking", !!d);
      toolG.classed("hot", (t) => t === d).classed("linked", (t) => linked.has(t));
      handoffPaths.classed("hot", (h) => !!d && (h.s === d || h.t === d));
      coreG.classed("dim", (w) => !!d && !(d.mix[KEYS.indexOf(w.key)] > 0));
      rings.classed("lit", (r) => !!d && r.w.key === d.ws && r.state === d.state);
      render();
      readout.textContent = d ? readoutFor(d, handoffs) : defaultText;
      if (d && el) showTip(`<b>${d.id}</b>${d.brief}`, el.querySelector(".dot") as Element);
      else hideTip();
    }
    toolG
      .on("pointerenter", function (this: any, e: any, d: any) {
        if (e.buttons) return;
        pick(d, this);
      })
      .on("pointerleave", () => pick(null))
      .on("focus", function (this: any, _e: any, d: any) {
        pick(d, this);
      })
      .on("blur", () => pick(null))
      .on("keydown", (e: any, d: any) => {
        if (e.key === "Enter" || e.key === "+") {
          e.preventDefault();
          zoomTo(d);
        }
      });

    // ---- Lens ----
    function moveLens(e: any) {
      if (!ui.lens) return;
      const [px, py] = pointer(e, svgEl);
      lensG.style("display", null);
      lensClip.attr("cx", px).attr("cy", py).attr("r", LENS.r);
      lensRing.attr("cx", px).attr("cy", py).attr("r", LENS.r);
      lensBack.attr("cx", px).attr("cy", py).attr("r", LENS.r);
      lensUse.attr("transform", `translate(${px},${py}) scale(${LENS.k}) translate(${-px},${-py})`);
    }
    svg.on("pointermove.lens", moveLens).on("pointerleave.lens", () => lensG.style("display", "none"));
    function setLens(on: boolean) {
      if (!on) lensG.style("display", "none");
    }

    let last: number | null = null;
    const orbitTick = (now: number) => {
      if (last == null) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!ui.orbiting) return;
      Object.keys(rot).forEach((ws) => {
        rot[ws] += WELLS[ws].dir * SPEED * dt;
      });
    };
    const timer = d3timer(orbitTick);
    if (!ui.active) timer.stop();

    let morph: any = null;
    function setMode(mode: string) {
      const from = tools.map((t) => t.pull.slice());
      const to = tools.map((t) => (mode === "blend" ? blendPull(t) : [0, 0, 0]));
      if (morph) morph.stop();
      const dur = reduceMotion ? 1 : 1200;
      morph = d3timer((el) => {
        const p = easeCubicInOut(Math.min(1, el / dur));
        tools.forEach((t, i) => {
          t.pull = from[i].map((v: number, j: number) => v + (to[i][j] - v) * p);
        });
        sim.alpha(Math.max(sim.alpha(), 0.5)).restart();
        if (p >= 1) morph.stop();
      });
    }
    function scatter() {
      nodes.forEach((n) => {
        n.x = W / 2 + (Math.random() - 0.5) * W * 0.45;
        n.y = H / 2 + (Math.random() - 0.5) * H * 0.45;
        n.vx = n.vy = 0;
      });
      sim.alpha(1).restart();
    }
    function resize() {
      sizeText();
      measure();
      if (ui.active) sim.alpha(Math.max(sim.alpha(), 0.3)).restart();
    }
    function pause() {
      sim.stop();
      timer.stop();
    }
    function resume() {
      last = null;
      timer.restart(orbitTick);
      sim.alphaTarget(ui.orbiting ? 0.12 : 0).alpha(Math.max(sim.alpha(), 0.2)).restart();
    }
    function destroy() {
      sim.stop();
      timer.stop();
      if (morph) morph.stop();
      svg.interrupt();
      hideTip();
    }

    return { name, sim, setMode, scatter, resize, destroy, zoomBy, zoomReset, setLens, pause, resume };
  }

  function mixText(d: any) {
    return KEYS.map((k, i) => [k, d.mix[i]] as [string, number])
      .filter((p) => p[1] > 0)
      .sort((a, b) => b[1] - a[1])
      .map((p) => pct(p[1]) + " " + p[0]);
  }
  function describe(d: any) {
    const where = d.ws === "cli" ? "a CLI used across streams" : `${d.p} in ${d.ws}`;
    return `${d.id}, ${stateWord[d.state]}, ${where}. ${d.brief} Mix: ${mixText(d).join(", ")}.`;
  }
  function readoutFor(d: any, handoffs: any[]) {
    const ins = handoffs.filter((h) => h.t === d).map((h) => h.s.id);
    const outs = handoffs.filter((h) => h.s === d).map((h) => h.t.id);
    let s = `${d.id} · ${d.p} · ${mixText(d).join(" · ")} · ${stateWord[d.state]}`;
    if (ins.length) s += ` · from ${ins.join(", ")}`;
    if (outs.length) s += ` · to ${outs.join(", ")}`;
    return s;
  }

  // ---- Controls ----
  const ac = new AbortController();
  const on = (k: string, fn: () => void) => $(k).addEventListener("click", fn, { signal: ac.signal });
  const orbitBtn = $("toggle-orbit");
  const handBtn = $("toggle-handoffs");
  const blendBtn = $("mode-blend");
  const homeBtn = $("mode-home");
  const lensBtn = $("lens");
  function sync() {
    orbitBtn.setAttribute("aria-pressed", String(ui.orbiting));
    orbitBtn.textContent = ui.orbiting ? "Orbit on" : "Orbit off";
    handBtn.setAttribute("aria-pressed", String(ui.handoffs));
    handBtn.textContent = ui.handoffs ? "Handoffs on" : "Handoffs off";
    blendBtn.setAttribute("aria-pressed", String(ui.mode === "blend"));
    homeBtn.setAttribute("aria-pressed", String(ui.mode === "home"));
    lensBtn.setAttribute("aria-pressed", String(ui.lens));
  }
  on("toggle-orbit", () => {
    ui.orbiting = !ui.orbiting;
    sync();
    caption(ui.orbiting ? "orbitOn" : "orbitOff");
    current?.sim.alphaTarget(ui.orbiting ? 0.12 : 0).alpha(Math.max(current.sim.alpha(), 0.2)).restart();
  });
  on("toggle-handoffs", () => {
    ui.handoffs = !ui.handoffs;
    sync();
    caption(ui.handoffs ? "handoffsOn" : "handoffsOff");
    svg.classed("handoffs-off", !ui.handoffs);
  });
  on("mode-blend", () => {
    ui.mode = "blend";
    sync();
    caption("blend");
    current?.setMode("blend");
  });
  on("mode-home", () => {
    ui.mode = "home";
    sync();
    caption("home");
    current?.setMode("home");
  });
  on("reshuffle", () => {
    caption("scatter");
    current?.scatter();
  });
  on("zoom-in", () => current?.zoomBy(1.25));
  on("zoom-out", () => current?.zoomBy(0.8));
  on("zoom-reset", () => current?.zoomReset());
  on("lens", () => {
    ui.lens = !ui.lens;
    sync();
    current?.setLens(ui.lens);
  });
  sync();

  // ---- Layout follows the stage width; text size follows the scale ----
  const layoutFor = (w: number): "wide" | "narrow" => (w >= 760 ? "wide" : "narrow");
  function ensure() {
    const want = layoutFor(stageEl.clientWidth);
    if (current && current.name === want) {
      current.resize();
      return;
    }
    if (current) current.destroy();
    current = build(want);
  }
  ensure();
  const ro = new ResizeObserver(() => ensure());
  ro.observe(stageEl);
  let alive = true;
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => {
      if (alive && current) current.resize();
    });

  return {
    setActive(next: boolean) {
      if (next === ui.active) return;
      ui.active = next;
      if (!current) return;
      if (next) current.resume();
      else current.pause();
    },
    destroy() {
      alive = false;
      ro.disconnect();
      ac.abort();
      if (current) current.destroy();
      current = null;
      svg.on(".zoom", null).on(".lens", null);
      svg.selectAll("*").remove();
    },
  };
}
