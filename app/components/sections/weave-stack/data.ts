/**
 * Weave stack data: the agent infrastructure graph under Gravity Wells.
 * Copied unchanged from the approved prototype (weave-stack.html).
 * Tab tags (the `subs` string per tool) are still unconfirmed.
 */

export type LayerKey = "m" | "h" | "v";
export type SubKey = "o" | "p" | "b";

export const COL = {
  bg: "#0a0a0a",
  band: "#0e0e0e",
  fg: "#e8e4e0",
  fg2: "#b8b3ad",
  muted: "#9a9590",
  line: "#3a3530",
  sand: "#c8ad8f",
  ember: "#e2725b",
  gold: "#c4a000",
};

export const SUBS: { id: SubKey; tab: string; line: string }[] = [
  { id: "o", tab: "Agent orchestration", line: "How agents split up work: a router, handoffs between peers, and a supervisor running sub-agents in parallel." },
  { id: "p", tab: "Persistent harness", line: "Durable execution: every step is checkpointed, so a run survives a crash and can wait days for a human approval." },
  { id: "b", tab: "Async background agents", line: "Agents with a standing goal that wake on events and act inside isolated sandboxes, with no prompt to start them." },
];

export const LAYERS: LayerKey[] = ["m", "h", "v"];
export const layerName: Record<LayerKey, string> = { m: "Agents", h: "Harness", v: "Evaluation" };
export const layerColor: Record<LayerKey, string> = { m: COL.sand, h: COL.ember, v: COL.gold };
export const ROOT = "Infrastructure";
export const rootRole = "The tools behind the agent systems I build: agents, harness, evaluation.";
export const hubRole: Record<LayerKey, string> = {
  m: "SDKs, agent runtimes and the protocols that put agents in front of people.",
  h: "Durable execution, state, sandboxing and the event stream.",
  v: "Evals, traces and search grounding that check the work.",
};

const AGUI = "Agent–User Interaction (AG-UI)";
const A2UI = "Agent-Driven Interfaces (A2UI)";

/** [name, layer, role, sub-graphs it serves]. Each layer fills a row of five, then a second row. */
export const TOOLS: [string, LayerKey, string, string][] = [
  ["Vercel AI SDK", "m", "Model calls, streaming and tool loops. The harness owns the transport.", "opb"],
  ["AI Gateway", "m", "One endpoint for every model provider, with fallbacks.", "opb"],
  ["Claude Agent SDK", "m", "Building custom agents and sub-agents.", "o"],
  ["Claude Managed Agents", "m", "Hosted long-running agents that work in their own sandbox.", "b"],
  ["Cloudflare Agents", "m", "Stateful agents on Workers.", "o"],
  [AGUI, "m", "An open protocol that streams agent runs, state and tool calls to the front end as events.", "opb"],
  [A2UI, "m", "The agent describes UI as data, and the client renders it with its own components.", "o"],
  ["LangChain", "m", "Advanced tool calling.", "o"],

  ["DBOS", "h", "Durable workflows: each step checkpointed to Postgres, recv() to suspend.", "op"],
  ["Neon Postgres", "h", "The durable store: event log, checkpoints, incidents, approvals.", "opb"],
  ["Drizzle ORM", "h", "Typed schema for the event bus tables.", "opb"],
  ["Inngest", "h", "Event-driven durable functions: step.run, waitForEvent, retries.", "pb"],
  ["Cloudflare Workflows", "h", "Durable steps and sleeps on Workers.", "pb"],
  ["Upstash Vector", "h", "Vector store for retrieval (RAG).", "op"],
  ["Sandbox runtime", "h", "Runs agent-written code in isolation, with a timeout. node:vm locally, a hosted isolate in production.", "ob"],
  ["Event stream", "h", "Express + WebSocket. Every harness action becomes an event the inspector renders.", "op"],

  ["Braintrust evals", "v", "Scorers and golden datasets. Grades outcome and trajectory.", "ob"],
  ["Braintrust tracing", "v", "Traces every model and tool step.", "opb"],
  ["Tavily", "v", "Web search grounding.", "o"],
];

/** Cross-layer threads. */
export const WEAVE: [string, string][] = [
  ["Vercel AI SDK", "AI Gateway"], ["Vercel AI SDK", "DBOS"], ["Vercel AI SDK", "Inngest"],
  ["LangChain", "Tavily"], ["LangChain", "Upstash Vector"],
  ["DBOS", "Neon Postgres"], ["Inngest", "Neon Postgres"], ["Drizzle ORM", "Neon Postgres"],
  ["Cloudflare Agents", "Cloudflare Workflows"],
  ["Claude Managed Agents", "Sandbox runtime"], ["Claude Agent SDK", "Sandbox runtime"],
  [AGUI, "Event stream"], [A2UI, AGUI],
  ["Braintrust evals", "Vercel AI SDK"], ["Braintrust tracing", "Inngest"], ["Braintrust tracing", "DBOS"],
  ["Event stream", "DBOS"],
];
