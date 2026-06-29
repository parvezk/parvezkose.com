"use client";

/**
 * The five plate specimens. Each is a function-of-hover so it can drive
 * its internal motion off the parent PlateShell's hover state.
 *
 * All five live in one file because they share the same spec source
 * (the design handoff at claude-design/design_handoff_design_system_gallery)
 * and are never imported individually outside the gallery composition.
 *
 * Phase 1 scope: visuals + hover responses. Phase 2 will add wall labels
 * (sustained-hover rationale), cursor parallax, entry stagger, and the
 * reduced-motion gate.
 */

const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

/* ── 01 · UI Kit ──────────────────────────────────────────────────────── */
export function UIKitSpecimen(hover: boolean) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "12px 14px 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent-terracotta)",
        }}
      >
        ┌ surface · 01
      </div>

      {/* Composed unit: title + subtitle + email field */}
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
            fontWeight: 300,
            fontSize: 22,
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            color: "var(--im-text, #e8e4e0)",
          }}
        >
          Parvez Kose
        </div>
        <div
          style={{
            fontFamily: "var(--font-family-code), 'Fira Code', monospace",
            fontSize: 10,
            color: "rgba(232,228,224,0.78)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Designing for intelligence</span>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 1.5,
              background: "var(--accent-terracotta)",
              animation: "immersive-caret-blink 1.1s steps(2) infinite",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 6,
            borderBottom: `1px solid ${hover ? "var(--accent-terracotta)" : "rgba(200,173,143,0.28)"}`,
            paddingBottom: 3,
            fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
            fontSize: 10,
            color: "rgba(232,228,224,0.55)",
            transition: `border-color 220ms ${EASE}`,
          }}
        >
          email_
          <span
            style={{
              color: "var(--accent-terracotta)",
              animation: "immersive-caret-blink 1.1s steps(2) infinite",
            }}
          >
            |
          </span>
        </div>
      </div>

      {/* Dot-grid corner sigil */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: 10,
          opacity: hover ? 0.55 : 0.28,
          transition: `opacity 240ms ${EASE}`,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => {
              const accented = (r + c) % 5 === 0;
              return (
                <circle
                  key={`${r}-${c}`}
                  cx={3 + c * 6}
                  cy={3 + r * 6}
                  r={accented && hover ? 1.6 : 0.9}
                  fill={
                    accented
                      ? "var(--accent-terracotta)"
                      : "rgba(232,228,224,0.5)"
                  }
                />
              );
            }),
          )}
        </svg>
      </div>
    </div>
  );
}

/* ── 02 · Color (crescent arc) ────────────────────────────────────────── */
const COLOR_SWATCHES = [
  "#dc143c", // crimson
  "#722f37", // wine
  "#800020", // burgundy
  "#4e0707", // oxblood
  "#e2725b", // terracotta
  "#c4a000", // golden
] as const;

export function ColorSpecimen(hover: boolean) {
  // Six swatches arranged on a half-moon arc. Hover loosens span + radius
  // and lifts each swatch into a slightly larger shadow.
  const restR = 44;
  const hoverR = 56;
  const restSpan = 130;
  const hoverSpan = 160;
  const span = hover ? hoverSpan : restSpan;
  const radius = hover ? hoverR : restR;
  const startAngle = -span / 2;
  const step = span / (COLOR_SWATCHES.length - 1);
  const baseR = 24;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent-terracotta)",
          marginBottom: 6,
        }}
      >
        ◇ palette · wines + accents
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          transform: "translate(-50%,-50%)",
          width: 160,
          height: 160,
        }}
      >
        {COLOR_SWATCHES.map((c, i) => {
          const angleDeg = startAngle + step * i;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = Math.sin(angleRad) * radius;
          const y = -Math.cos(angleRad) * radius * 0.45;
          return (
            <span
              key={c}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: baseR * 2,
                height: baseR * 2,
                marginLeft: -baseR,
                marginTop: -baseR,
                borderRadius: "50%",
                background: c,
                border: "1px solid rgba(0,0,0,0.4)",
                transform: `translate(${x}px, ${y}px) rotate(${angleDeg * 0.3}deg) scale(${hover ? 1 : 0.95})`,
                transition: `transform 600ms cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 35}ms, box-shadow 320ms ${EASE}`,
                boxShadow: hover
                  ? "0 6px 18px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 3px 10px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)",
                zIndex: i + 1,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 50,
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(232,228,224,0.52)",
          letterSpacing: "0.05em",
        }}
      >
        13 wines · 6 accents
      </div>
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 50,
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(232,228,224,0.4)",
        }}
      >
        #722F37
      </div>
    </div>
  );
}

/* ── 03 · Brand (parvez / kose lockup) ────────────────────────────────── */
export function BrandSpecimen(hover: boolean) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent-terracotta)",
        }}
      >
        ◇ wordmark
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "62%",
          transform: `translateY(-50%) translateX(${hover ? 4 : 0}px)`,
          textAlign: "center",
          transition: `transform 420ms ${EASE}`,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
            fontWeight: 300,
            letterSpacing: "-0.04em",
            fontSize: 38,
            lineHeight: 0.9,
            color: "var(--im-text, #e8e4e0)",
          }}
        >
          parvez
        </div>
        <div
          style={{
            fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
            fontWeight: 300,
            letterSpacing: "-0.04em",
            fontSize: 38,
            lineHeight: 0.9,
            color: hover ? "var(--accent-terracotta)" : "rgba(232,228,224,0.32)",
            transition: "color 320ms",
          }}
        >
          kose
        </div>
        <div
          style={{
            margin: "10px auto 0",
            height: 1,
            background: "var(--accent-terracotta)",
            width: hover ? 84 : 32,
            transition: `width 480ms ${EASE}`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 50,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(232,228,224,0.45)",
          letterSpacing: "0.05em",
        }}
      >
        <span>1 lockup</span>
        <span>· og · favicon ·</span>
      </div>
    </div>
  );
}

/* ── 04 · Typography (Aa + family list) ───────────────────────────────── */
export function TypographySpecimen(hover: boolean) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent-terracotta)",
        }}
      >
        ◇ specimen
      </div>

      <div
        style={{
          position: "absolute",
          left: -8,
          bottom: 30,
          fontFamily: "var(--font-family-serif), 'IBM Plex Serif', serif",
          fontWeight: 400,
          fontSize: 220,
          lineHeight: 0.78,
          color: "var(--im-text, #e8e4e0)",
          letterSpacing: "-0.06em",
          transform: `rotate(${hover ? -4 : 0}deg) translateX(${hover ? 2 : 0}px)`,
          transition: `transform 540ms ${EASE}, color 320ms`,
          textShadow: "0 4px 22px rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      >
        Aa
      </div>

      <div
        style={{
          position: "absolute",
          right: 14,
          top: 36,
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
            fontWeight: 300,
            fontSize: 18,
            letterSpacing: "-0.02em",
            color: "var(--im-text, #e8e4e0)",
          }}
        >
          JetBrains
        </span>
        <span
          style={{
            fontFamily: "var(--font-family-code), 'Fira Code', monospace",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(232,228,224,0.78)",
          }}
        >
          Fira Code
        </span>
        <span
          style={{
            fontFamily: "var(--font-family-sans), 'IBM Plex Sans', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(232,228,224,0.78)",
          }}
        >
          Plex Sans
        </span>
        <span
          style={{
            fontFamily: "var(--font-family-serif), 'IBM Plex Serif', serif",
            fontWeight: 400,
            fontSize: 13,
            fontStyle: "italic",
            color: hover
              ? "var(--accent-terracotta)"
              : "rgba(232,228,224,0.78)",
            transition: "color 240ms",
          }}
        >
          Plex Serif
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 42,
          height: 1,
          background: "rgba(200,173,143,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 26,
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(232,228,224,0.45)",
          letterSpacing: "0.05em",
        }}
      >
        4 families · 4 weights · 14 steps
      </div>
    </div>
  );
}

/* ── 05 · Components (exploded view) ──────────────────────────────────── */
export function ComponentsSpecimen(hover: boolean) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", padding: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent-terracotta)",
        }}
      >
        ◇ exploded view · 09
      </div>

      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: 200, height: 90 }}>
          {/* Back: pill — drifts up-left on hover */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 130,
              height: 28,
              marginLeft: -65,
              marginTop: -14,
              border: "1px solid rgba(200,173,143,0.45)",
              background: "rgba(226,114,91,0.10)",
              color: "var(--accent-terracotta)",
              fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: 999,
              transform: `translate(${hover ? -52 : -4}px, ${hover ? -42 : -6}px) rotate(${hover ? -7 : -1}deg)`,
              transition: "transform 540ms cubic-bezier(0.2, 0.9, 0.3, 1)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent-terracotta)",
              }}
            />
            terracotta
          </div>

          {/* Middle: framed anchor button — stays centered */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 150,
              height: 38,
              marginLeft: -75,
              marginTop: -19,
              border: `1px solid ${hover ? "var(--accent-terracotta)" : "var(--im-text, #e8e4e0)"}`,
              background: "rgba(10,10,10,0.65)",
              color: "var(--im-text, #e8e4e0)",
              fontFamily: "var(--font-family-mono), 'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: `border-color 240ms ${EASE}`,
            }}
          >
            View Specimen
          </div>

          {/* Front: terminal toggle — drifts down-right on hover */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 170,
              height: 30,
              marginLeft: -85,
              marginTop: -15,
              background: "rgba(10,10,10,0.85)",
              border: "1px solid rgba(200,173,143,0.32)",
              color: "rgba(232,228,224,0.88)",
              fontFamily: "var(--font-family-code), 'Fira Code', monospace",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              paddingLeft: 10,
              gap: 6,
              transform: `translate(${hover ? 56 : 6}px, ${hover ? 46 : 8}px) rotate(${hover ? 5 : 1}deg)`,
              transition: "transform 540ms cubic-bezier(0.2, 0.9, 0.3, 1)",
              boxShadow: "0 6px 22px rgba(0,0,0,0.55)",
            }}
          >
            <span style={{ color: "var(--accent-terracotta)" }}>[+]</span>{" "}
            Design Philosophy
          </div>
        </div>
      </div>
    </div>
  );
}
