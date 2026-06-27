import type { Metadata } from "next";
import { AgentTransmission } from "../../components/agent-transmission/agent-transmission";

export const metadata: Metadata = {
  title: "Agent Transmission · Lab",
  description: "Standalone preview of the ambient agent-transmission overlay.",
  robots: { index: false, follow: false },
};

/**
 * Phase 1 standalone preview.
 *
 * A placeholder dark backdrop stands in for the WebGL terrain. Two
 * `data-agent-keepout` blocks (a faux nav strip + a centered text card) let
 * you watch the reject-and-retry placement avoid content. The overlay is
 * mounted in `devFast` so transmissions fire every ~6s for tuning.
 *
 * The page is taller than the viewport so you can confirm the (fixed) overlay
 * persists across scroll.
 */
export default function AgentTransmissionLab() {
  return (
    <main
      className="font-mono"
      style={{
        position: "relative",
        minHeight: "220vh",
        // Placeholder terrain: a dark field with one latte-white patch so you
        // can check legibility over high-contrast regions.
        background:
          "radial-gradient(60% 50% at 80% 22%, #d8c6a8 0%, rgba(216,198,168,0) 42%), linear-gradient(160deg, #0a0a0a 0%, #141014 50%, #0a0a0a 100%)",
        color: "#e8e4e0",
        overflowX: "hidden",
      }}
    >
      {/* faux nav — kept clear */}
      <div
        data-agent-keepout
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: "flex",
          gap: "1.25rem",
          padding: "0.9rem 1.25rem",
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(232,228,224,0.85)",
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0) 100%)",
        }}
      >
        <span>parvezkose</span>
        <span style={{ opacity: 0.6 }}>work</span>
        <span style={{ opacity: 0.6 }}>about</span>
      </div>

      {/* centered text card — kept clear */}
      <div
        data-agent-keepout
        style={{
          position: "absolute",
          top: "38vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(640px, 86vw)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, letterSpacing: "0.06em", opacity: 0.55, margin: 0 }}>
          ◦ PLACEHOLDER TERRAIN
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 300, margin: "0.75rem 0 0" }}>
          Agent Transmission — Phase 1
        </h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: "0.75rem", lineHeight: 1.6 }}>
          A satellite locks onto a coordinate and intercepts an agent mid-run.
          This card and the nav strip are tagged <code>data-agent-keepout</code>;
          the overlay places itself clear of them, biased toward the edges.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "6vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 12,
          opacity: 0.4,
        }}
      >
        scroll — the transmission overlay stays fixed
      </div>

      <AgentTransmission devFast config={{ firstDelayMs: 1500 }} />
    </main>
  );
}
