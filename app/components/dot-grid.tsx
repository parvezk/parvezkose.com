"use client";

import { useRef, useEffect, useCallback } from "react";

const CFG = {
  dotSize: 4,
  gap: 9,
  baseAlpha: 0.1,
  cursorAlpha: 0.8,
  burstAlpha: 0.5,
  resolveAlpha: 0.3,
  radius: 1.2,
  burstRadius: 4,
  resolveCount: 3,
  resolveSize: [2, 5] as [number, number],
  cursorSpeed: 0.04,
  moveInterval: [1200, 3200] as [number, number],
  blinkInterval: [400, 800] as [number, number],
  burstDuration: 600,
  resolveDuration: [800, 1600] as [number, number],
};

const dotBaseRGB = "140, 140, 140";
const dotCursorRGB = "60, 60, 60";

function randRange(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function randInt(a: number, b: number) {
  return Math.floor(randRange(a, b + 1));
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface Dot {
  alpha: number;
  targetAlpha: number;
}

interface Resolve {
  col: number;
  row: number;
  size: number;
  duration: number;
  elapsed: number;
  peakAlpha: number;
}

interface Burst {
  col: number;
  row: number;
  elapsed: number;
  duration: number;
}

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    cols: number;
    rows: number;
    dots: Dot[][];
    cursor: {
      col: number;
      row: number;
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      visible: boolean;
    };
    blinkTimer: number;
    blinkState: boolean;
    moveTimer: number;
    resolves: Resolve[];
    bursts: Burst[];
    offsetX: number;
    offsetY: number;
    lastTime: number;
    animId: number;
  } | null>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    const s = stateRef.current;
    if (!s) return;

    s.cols = Math.floor((rect.width - 12) / CFG.gap);
    s.rows = Math.floor((rect.height - 12) / CFG.gap);
    s.offsetX = (rect.width - (s.cols - 1) * CFG.gap) / 2;
    s.offsetY = (rect.height - (s.rows - 1) * CFG.gap) / 2;
    s.dots = [];
    for (let r = 0; r < s.rows; r++) {
      s.dots[r] = [];
      for (let c = 0; c < s.cols; c++)
        s.dots[r][c] = { alpha: CFG.baseAlpha, targetAlpha: CFG.baseAlpha };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    stateRef.current = {
      cols: 0,
      rows: 0,
      dots: [],
      cursor: {
        col: 0,
        row: 0,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        visible: true,
      },
      blinkTimer: 0,
      blinkState: true,
      moveTimer: 0,
      resolves: [],
      bursts: [],
      offsetX: 0,
      offsetY: 0,
      lastTime: 0,
      animId: 0,
    };

    const s = stateRef.current;

    function colToX(c: number) {
      return s.offsetX + c * CFG.gap;
    }
    function rowToY(r: number) {
      return s.offsetY + r * CFG.gap;
    }

    function spawnResolve() {
      const size = randInt(...CFG.resolveSize);
      s.resolves.push({
        col: randInt(0, s.cols - size),
        row: randInt(0, s.rows - size),
        size,
        duration: randRange(...CFG.resolveDuration),
        elapsed: 0,
        peakAlpha: CFG.resolveAlpha + Math.random() * 0.12,
      });
    }

    function spawnBurst(col: number, row: number) {
      s.bursts.push({ col, row, elapsed: 0, duration: CFG.burstDuration });
    }

    function moveCursorToNew() {
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(3, Math.min(s.cols, s.rows) * 0.35);
      s.cursor.col = clamp(
        Math.round(s.cursor.col + Math.cos(angle) * dist),
        1,
        s.cols - 2
      );
      s.cursor.row = clamp(
        Math.round(s.cursor.row + Math.sin(angle) * dist),
        1,
        s.rows - 2
      );
      s.cursor.targetX = colToX(s.cursor.col);
      s.cursor.targetY = rowToY(s.cursor.row);
      setTimeout(() => spawnBurst(s.cursor.col, s.cursor.row), 200);
    }

    function update(dt: number) {
      s.blinkTimer -= dt;
      if (s.blinkTimer <= 0) {
        s.blinkState = !s.blinkState;
        s.blinkTimer = randRange(...CFG.blinkInterval);
      }
      s.cursor.visible = s.blinkState;
      s.moveTimer -= dt;
      if (s.moveTimer <= 0) {
        moveCursorToNew();
        s.moveTimer = randRange(...CFG.moveInterval);
      }
      s.cursor.x = lerp(s.cursor.x, s.cursor.targetX, CFG.cursorSpeed);
      s.cursor.y = lerp(s.cursor.y, s.cursor.targetY, CFG.cursorSpeed);

      for (let i = s.resolves.length - 1; i >= 0; i--) {
        const res = s.resolves[i];
        res.elapsed += dt;
        if (res.elapsed >= res.duration) {
          s.resolves.splice(i, 1);
          spawnResolve();
          continue;
        }
        const intensity = Math.sin((res.elapsed / res.duration) * Math.PI);
        for (
          let r = res.row;
          r < Math.min(res.row + res.size, s.rows);
          r++
        )
          for (
            let c = res.col;
            c < Math.min(res.col + res.size, s.cols);
            c++
          )
            s.dots[r][c].targetAlpha = Math.max(
              s.dots[r][c].targetAlpha,
              CFG.baseAlpha + intensity * (res.peakAlpha - CFG.baseAlpha)
            );
      }

      for (let i = s.bursts.length - 1; i >= 0; i--) {
        const b = s.bursts[i];
        b.elapsed += dt;
        if (b.elapsed >= b.duration) {
          s.bursts.splice(i, 1);
          continue;
        }
        const intensity = 1 - easeOut(b.elapsed / b.duration);
        for (
          let r = b.row - CFG.burstRadius;
          r <= b.row + CFG.burstRadius;
          r++
        )
          for (
            let c = b.col - CFG.burstRadius;
            c <= b.col + CFG.burstRadius;
            c++
          ) {
            if (r < 0 || r >= s.rows || c < 0 || c >= s.cols) continue;
            const dist = Math.sqrt((r - b.row) ** 2 + (c - b.col) ** 2);
            if (dist > CFG.burstRadius) continue;
            s.dots[r][c].targetAlpha = Math.max(
              s.dots[r][c].targetAlpha,
              CFG.baseAlpha +
                intensity *
                  (1 - dist / CFG.burstRadius) *
                  (CFG.burstAlpha - CFG.baseAlpha)
            );
          }
      }

      const cgc = (s.cursor.x - s.offsetX) / CFG.gap;
      const cgr = (s.cursor.y - s.offsetY) / CFG.gap;
      const glowR = 3;
      for (
        let r = Math.max(0, Math.floor(cgr - glowR));
        r <= Math.min(s.rows - 1, Math.ceil(cgr + glowR));
        r++
      )
        for (
          let c = Math.max(0, Math.floor(cgc - glowR));
          c <= Math.min(s.cols - 1, Math.ceil(cgc + glowR));
          c++
        ) {
          const d = Math.sqrt((r - cgr) ** 2 + (c - cgc) ** 2);
          if (d < glowR)
            s.dots[r][c].targetAlpha = Math.max(
              s.dots[r][c].targetAlpha,
              CFG.baseAlpha + (1 - d / glowR) * 0.2
            );
        }

      for (let r = 0; r < s.rows; r++)
        for (let c = 0; c < s.cols; c++) {
          const d = s.dots[r][c];
          d.alpha = lerp(d.alpha, d.targetAlpha, 0.08);
          d.targetAlpha = lerp(d.targetAlpha, CFG.baseAlpha, 0.02);
        }
    }

    function draw() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);
      const half = CFG.dotSize / 2;
      for (let r = 0; r < s.rows; r++)
        for (let c = 0; c < s.cols; c++) {
          ctx!.fillStyle = `rgba(${dotBaseRGB}, ${s.dots[r][c].alpha})`;
          ctx!.beginPath();
          ctx!.roundRect(
            colToX(c) - half,
            rowToY(r) - half,
            CFG.dotSize,
            CFG.dotSize,
            CFG.radius
          );
          ctx!.fill();
        }
      if (s.cursor.visible) {
        ctx!.fillStyle = `rgba(${dotCursorRGB}, 0.12)`;
        ctx!.beginPath();
        ctx!.roundRect(
          s.cursor.x - half * 2.5,
          s.cursor.y - half * 2.5,
          CFG.dotSize * 2.5,
          CFG.dotSize * 2.5,
          CFG.radius * 2
        );
        ctx!.fill();
        ctx!.fillStyle = `rgba(${dotCursorRGB}, ${CFG.cursorAlpha})`;
        ctx!.beginPath();
        ctx!.roundRect(
          s.cursor.x - half,
          s.cursor.y - half,
          CFG.dotSize,
          CFG.dotSize,
          CFG.radius
        );
        ctx!.fill();
      }
    }

    function loop(time: number) {
      const dt = s.lastTime ? Math.min(time - s.lastTime, 50) : 16;
      s.lastTime = time;
      update(dt);
      draw();
      s.animId = requestAnimationFrame(loop);
    }

    resize();

    s.cursor.col = Math.floor(s.cols * 0.5);
    s.cursor.row = Math.floor(s.rows * 0.4);
    s.cursor.x = s.cursor.targetX = colToX(s.cursor.col);
    s.cursor.y = s.cursor.targetY = rowToY(s.cursor.row);
    s.moveTimer = randRange(...CFG.moveInterval);
    s.blinkTimer = randRange(...CFG.blinkInterval);
    for (let i = 0; i < CFG.resolveCount; i++) spawnResolve();

    s.animId = requestAnimationFrame(loop);

    const handleResize = () => {
      resize();
      s.cursor.x = colToX(clamp(s.cursor.col, 0, s.cols - 1));
      s.cursor.y = rowToY(clamp(s.cursor.row, 0, s.rows - 1));
      s.cursor.targetX = s.cursor.x;
      s.cursor.targetY = s.cursor.y;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (s.animId) cancelAnimationFrame(s.animId);
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
