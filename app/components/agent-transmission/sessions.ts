/**
 * Agent transmission content — hand-authored vignettes + statusline pools.
 *
 * Each session is one coherent intercept: a creative / ML agent caught
 * mid-thought in the wild. The overlay TYPES the `cmd` lines char-by-char,
 * pauses, then REVEALS the `out` lines line-by-line. Some cycles also draw a
 * loading bar that fills to 100% before the terminal rolls up.
 *
 * Voice: an autonomous creative/ML agent — infer, diffuse, render shader,
 * trace activations, orchestrate. NOT generic devops/server logs.
 *
 * Line count varies (3–8 total). Longer sessions only appear where there's
 * room; the placement logic skips a cycle if a tall box can't be fit clear of
 * tagged content. Edit everything below freely.
 */

export type Session = {
  /** Short slug, used as a React key / debugging aid. */
  id: string;
  /** Command lines, typed char-by-char in order. 1–3 lines. */
  cmd: string[];
  /** Output lines, revealed line-by-line after a pause. 1–5 lines. */
  out: string[];
};

export const SESSIONS: Session[] = [
  {
    id: "diffuse-palette",
    cmd: [
      'infer palette from "volcanic dusk" · 6 swatches',
      "diffuse 1 frame · 24 steps · seed 0x5c233a",
    ],
    out: [
      "→ latent locked · cfg 7.5 · eta 0.0",
      "✓ oxblood · ember · ash · latte · noir",
    ],
  },
  {
    id: "trace-activations",
    cmd: [
      "trace activations · layer 11 · head 4",
      'attribute "horizon line" → top tokens',
      "rank by integrated gradients",
    ],
    out: [
      "→ 0.81 sky   0.62 ridge   0.40 haze",
      "→ 0.22 grain   0.18 vignette",
      "✓ saliency written → /scratch/attn.npy",
    ],
  },
  {
    id: "orchestrate-grid",
    cmd: [
      'orchestrate 3 agents · task "compose grid"',
      "await consensus · quorum 2 of 3",
    ],
    out: [
      "→ a: 8-col    b: 8-col    c: 12-col",
      "→ vote → 8-col carries the room",
      "✓ resolved → 8-col · gutter 0.62rem",
    ],
  },
  {
    id: "render-shader",
    cmd: [
      "render shader · terrain.frag · 1920×1080",
      "march rays · 64 steps · eps 1e-3",
      "denoise · bilateral · sigma 0.8",
    ],
    out: [
      "→ fbm octaves 6 · warp 0.30",
      "✓ frame 00417 · 11.4ms · 0 fireflies",
    ],
  },
  {
    id: "infer-caption",
    cmd: [
      'infer caption · img "aerial, crimson delta"',
      "sample · temp 0.7 · top_p 0.9",
    ],
    out: ['✓ "lava deltas seen from low orbit"'],
  },
  {
    id: "embed-cluster",
    cmd: [
      "embed 2,048 sketches · dim 768",
      "cluster · umap → k-means k=7",
      "label clusters from centroids",
    ],
    out: [
      "→ silhouette 0.58 · 7 motifs",
      "→ inertia 412.6 · converged @ 19",
      '✓ nearest: "isolines" · "contour-ink"',
    ],
  },
  {
    id: "style-transfer",
    cmd: [
      'diffuse style "ink contour" → terrain',
      "blend · strength 0.42 · hold edges",
    ],
    out: ["→ adain stats matched · 3 layers", "✓ delta-E 3.1 · edges preserved"],
  },
  {
    id: "plan-extend",
    cmd: [
      "wake · model fable-vision · ctx 32k",
      'plan · "extend hero into 3 sections"',
      "commit plan → queue",
    ],
    out: [
      "→ step 1: lift grid · step 2: wall labels",
      "→ step 3: parallax on scroll",
      "✓ 3 steps queued · est 9.2s",
    ],
  },
  {
    id: "interp-probe",
    cmd: [
      "probe feature 4096 · sae · layer 7",
      'steer +6σ → generate "warm ridgeline"',
    ],
    out: [
      "→ feature fires on terracotta gradients",
      "→ logit boost: dusk +2.1 · neon −1.4",
      "✓ steered sample saved · drift 0.06",
    ],
  },
  {
    id: "shader-compile",
    cmd: [
      "compile noise.wgsl → spirv",
      "autotune workgroup · 8×8 .. 16×16",
    ],
    out: ["→ best 16×8 · 0.7ms/tile", "✓ pipeline cached · 41 variants"],
  },
];

/* ============================================================
   Statusline pools — Claude-Code-style footer. Pulled per cycle.
   ============================================================ */
export const MODELS = [
  "Opus 4.8",
  "Fable 5",
  "Sonnet 4.6",
  "Haiku 4.5",
  "fable-vision",
];

export const DIRECTORIES = [
  "~/dev2/parvezkose.com",
  "~/agents/atlas",
  "~/scratch/diffuse",
  "~/lab/terrain",
  "~/work/interp",
];

export const BRANCHES = [
  "feat/agent-transmission",
  "diffuse/ink-contour",
  "render/terrain-frag",
  "orchestrate/grid",
  "interp/sae-probe",
  "main",
];

/** Bottom mode-line variants (the `▶▶ …` row). */
export const MODE_LINES = [
  "accept edits on (shift+tab to cycle)",
  "orchestrating · 3 agents · quorum 2/3",
  "diffusing · 24 steps · cfg 7.5",
  "tracing activations · layer 11",
  "rendering · terrain.frag · gpu 0",
  "auto-context on (32k window)",
];

/** Hostnames for the shell-prompt identity (`agent-xxxx@host ~ %`). */
export const HOSTS = [
  "orbital-7",
  "atlas",
  "gpu-node-2",
  "edge-sfo",
  "lab-01",
  "mbp-6",
  "relay-04",
];

/** Labels for the occasional loading bar. */
export const PROGRESS_LABELS = [
  "rendering frame",
  "diffusing latents",
  "tracing activations",
  "embedding corpus",
  "marching rays",
  "compiling shader",
];
