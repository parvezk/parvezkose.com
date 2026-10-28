/**
 * Gravity Wells data. Ported unchanged from the approved prototype
 * (gravity-wells-site.html, v6). Edit tools, handoffs and copy here.
 */

export type StreamKey = "research" | "design" | "engineering";
export type ToolState = "active" | "evaluating" | "backlog";

export const KEYS: StreamKey[] = ["research", "design", "engineering"];

/** Orbit speed, radians per second. */
export const SPEED = 0.03;

export const STREAMS: Record<
  StreamKey,
  { name: string; dir: 1 | -1; base: number; practices: string[] }
> = {
  research: { name: "Research", dir: 1, base: -Math.PI / 2, practices: ["Synthesis", "Memory", "Coordination"] },
  design: { name: "Design", dir: -1, base: -Math.PI / 2, practices: ["Interfaces", "Media"] },
  engineering: { name: "Engineering", dir: 1, base: Math.PI, practices: ["Agents", "Terminal"] },
};

/** Target on-screen text sizes in CSS pixels. The SVG scales with the stage; the engine converts these to viewBox units. */
export const TEXT = { tool: 13.5, hub: 10.5, well: 13.5 };

export type Layout = {
  W: number;
  H: number;
  maxScale: number;
  pull: number;
  textScale?: number;
  ring: Record<ToolState, number>;
  hub: number;
  pos: Record<StreamKey, [number, number]>;
  cli: {
    cx: number;
    cy: number;
    r: number;
    from: number;
    to: number;
    slots: number[];
    label: { a: number; r: number; anchor: string };
  };
};

/**
 * Two compositions: a triangle on wide screens, a vertical stack on phones.
 * pull = how far other wells can drag a tool in real-mix mode, as a share of the distance between wells.
 * cli = the shared arc: centre, radius, the angles its tools sit at, and where its label goes.
 */
export const LAYOUTS: Record<"wide" | "narrow", Layout> = {
  wide: {
    // Prototype A's triangle, with room above design and below engineering. The CLI arc sits where A's escape arc was.
    // maxScale was 1.3 in the prototype. On laptops the stage is sized from the viewport height and can drop
    // to ~750px wide, so it is raised to keep tool labels near 13.5px on screen; the box collision makes room.
    W: 1200, H: 890, maxScale: 1.65, pull: 0.85,
    ring: { active: 80, evaluating: 130, backlog: 174 }, hub: 44,
    pos: { research: [300, 450], design: [830, 245], engineering: [830, 640] },
    cli: { cx: 830, cy: 640, r: 236, from: -53, to: 21, slots: [-36, -15, 6], label: { a: 28, r: 246, anchor: "middle" } },
  },
  narrow: {
    W: 440, H: 1300, maxScale: 1.3, pull: 0.55, textScale: 0.93,
    ring: { active: 54, evaluating: 88, backlog: 118 }, hub: 30,
    pos: { research: [220, 200], design: [220, 630], engineering: [220, 1060] },
    cli: { cx: 220, cy: 1060, r: 172, from: 52, to: 128, slots: [62, 90, 118], label: { a: 90, r: 230, anchor: "middle" } },
  },
};

export type ToolDatum = {
  id: string;
  ws: StreamKey | "cli";
  p: string;
  state: ToolState;
  /** [research, design, engineering]: placeholder shares of how much each tool serves each stream. */
  mix: [number, number, number];
  /** One line shown on hover. Drafts to edit. */
  brief: string;
  unused?: boolean;
};

export const TOOLS: ToolDatum[] = [
  { id: "NotebookLM",        ws: "research",    p: "Synthesis",    state: "active",     mix: [1, 0, 0],       brief: "Source-grounded notebooks for reading papers, docs and transcripts." },
  { id: "Gemini Canvas",     ws: "research",    p: "Synthesis",    state: "evaluating", mix: [.55, .35, .10], brief: "Drafting docs and quick interactive prototypes with Gemini. Connects to my NotebookLM notebooks." },
  { id: "Code Wiki",         ws: "research",    p: "Memory",       state: "active",     mix: [.55, 0, .45],   brief: "Generated, browsable docs for unfamiliar codebases." },
  { id: "Notion",            ws: "research",    p: "Memory",       state: "backlog",    mix: [.70, .20, .10], brief: "Notes, docs and wikis in one workspace." },
  { id: "Linear",            ws: "research",    p: "Coordination", state: "active",     mix: [.55, .10, .35], brief: "Issue tracking and project planning." },
  { id: "Excalidraw",        ws: "research",    p: "Coordination", state: "active",     mix: [.45, .40, .15], brief: "Hand-drawn whiteboard for quick system and flow diagrams." },
  { id: "GitHub",            ws: "research",    p: "Coordination", state: "active",     mix: [.50, 0, .50],   brief: "Repos, pull requests and code review." },
  { id: "Claude Design",     ws: "design",      p: "Interfaces",   state: "active",     mix: [.10, .60, .30], brief: "Designing and prototyping UI with Claude on a live canvas." },
  { id: "Google Stitch",     ws: "design",      p: "Interfaces",   state: "backlog",    mix: [0, .80, .20],   brief: "Google's AI UI designer. Not in use.", unused: true },
  { id: "AI Studio",         ws: "design",      p: "Interfaces",   state: "active",     mix: [.30, .40, .30], brief: "Google's playground for prompting and building with Gemini models." },
  { id: "Midjourney",        ws: "design",      p: "Media",        state: "backlog",    mix: [.05, .95, 0],   brief: "Image generation for moodboards and visual exploration." },
  { id: "Google Flow / Veo", ws: "design",      p: "Media",        state: "evaluating", mix: [.10, .90, 0],   brief: "Google's AI filmmaking tool, built on the Veo video models." },
  { id: "Antigravity",       ws: "engineering", p: "Agents",       state: "evaluating", mix: [.05, .25, .70], brief: "Google's agent-first IDE, which I use for spec planning." },
  { id: "Cursor",            ws: "engineering", p: "Agents",       state: "active",     mix: [.05, .10, .85], brief: "AI code editor I use for visual review." },
  { id: "Ghostty",           ws: "engineering", p: "Terminal",     state: "active",     mix: [0, 0, 1],       brief: "Fast, native terminal where my CLI agents run." },
  { id: "Tmux",              ws: "engineering", p: "Terminal",     state: "active",     mix: [0, 0, 1],       brief: "Terminal multiplexer. Split panes are how I run Claude Code agent teams side by side." },
  { id: "Claude Code",       ws: "cli",         p: "CLI",          state: "active",     mix: [.15, .15, .70], brief: "Anthropic's agentic coding CLI, my daily driver in Ghostty and Tmux." },
  { id: "Codex",             ws: "cli",         p: "CLI",          state: "backlog",    mix: [.10, 0, .90],   brief: "OpenAI's coding agent CLI, which I reach for in spec planning." },
  { id: "Antigravity CLI",   ws: "cli",         p: "CLI",          state: "evaluating", mix: [.05, .25, .70], brief: "Antigravity's agent from the terminal, outside the IDE." },
];

export const DROPPED = ["Conductor", "Kiro", "Gemini CLI", "Amazon Q"];

/** Where work leaves one tool and continues in another. Pairs listed both ways are two-way handoffs. */
export const HANDOFFS: [string, string][] = [
  ["NotebookLM", "Gemini Canvas"],
  ["Google Flow / Veo", "Gemini Canvas"], ["Gemini Canvas", "Google Flow / Veo"],
  ["Google Flow / Veo", "NotebookLM"],
  ["Google Flow / Veo", "AI Studio"], ["AI Studio", "Google Flow / Veo"],
  ["Antigravity", "Google Flow / Veo"],
  ["AI Studio", "Antigravity"], ["Antigravity", "AI Studio"],
  ["Claude Design", "Claude Code"],
  ["Linear", "Claude Code"],
  ["Code Wiki", "Cursor"],
  ["Claude Code", "GitHub"],
  // Claude Code runs inside Ghostty and Tmux; split panes are what make agent teams possible.
  ["Ghostty", "Claude Code"],
  ["Tmux", "Claude Code"],
];

export const CAPTIONS = {
  home: ["Home workstream", "each tool sits only in the stream it serves most. Read it for where my tools live."],
  blend: ["Real mix", "every stream a tool serves pulls on it in proportion, so shared tools drift between wells. Thicker lines are bigger shares."],
  orbitOn: ["Orbit on", "each well turns slowly. It's only motion, nothing about the data changes."],
  orbitOff: ["Orbit off", "the wells stop turning so you can read every label at rest."],
  handoffsOn: ["Handoffs on", "arrows show where work leaves one tool and continues in another."],
  handoffsOff: ["Handoffs off", "arrows hidden, so only the orbits and commitments are left."],
  scatter: ["Scatter and resettle", "every tool is thrown loose, then the wells pull each one back to its orbit."],
} as const;

export type CaptionKey = keyof typeof CAPTIONS;
