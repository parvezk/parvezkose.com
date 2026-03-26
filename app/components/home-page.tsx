"use client";

import { DotGrid } from "./dot-grid";

export function HomePage() {
  return (
    <div
      className="homepage-outer"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        fontSize: "12px",
        lineHeight: "1.7",
        WebkitFontSmoothing: "antialiased",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "80px",
        minHeight: "100vh",
      }}
    >
      <div
        className="homepage-card"
        style={{
          width: "100%",
          maxWidth: "640px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            height: "48px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Parvez Kose
          </span>
          <div
            style={{
              fontSize: "10px",
              color: "var(--fg3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            className="topbar-toggle"
          >
            <span
              className="toggle-dot"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--fg3)",
                transition: "background 0.3s",
              }}
            />
            <span>Immersive</span>
          </div>
        </div>

        {/* Hero */}
        <div className="hero-section">
          <div
            style={{
              position: "relative",
              zIndex: 2,
              flexShrink: 0,
            }}
            className="hero-text"
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                lineHeight: "1.15",
                marginBottom: "6px",
              }}
              className="hero-name"
            >
              Parvez Kose
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 400,
                color: "var(--fg2)",
                letterSpacing: "0.01em",
              }}
            >
              Staff Software Engineer
              <br />
              AI Native Full Stack · Front-End
            </div>
          </div>
          <div className="hero-canvas-wrap">
            <DotGrid />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "0 24px",
          }}
        />

        {/* Bio */}
        <div style={{ padding: "24px" }}>
          <p
            style={{
              fontSize: "12px",
              lineHeight: "1.8",
              color: "var(--fg2)",
            }}
          >
            I design and build AI-powered systems that automate complex
            workflows and optimize costs at scale. I bring a designer&apos;s eye
            to engineering problems, with deep roots in data visualization,
            motion design, and generative interfaces.
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "0 24px",
          }}
        />

        {/* Links */}
        <div
          style={{
            padding: "4px 24px 28px",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Substack", href: "https://designlogic.substack.com" },
            { label: "Medium", href: "https://medium.com/@parvez__" },
            {
              label: "LinkedIn",
              href: "https://linkedin.com/in/parvezkose",
            },
            { label: "GitHub", href: "https://github.com/parvezk" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="homepage-link"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--fg2)",
                textDecoration: "none",
                letterSpacing: "0.02em",
                padding: "6px 0",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "14px 24px",
            fontSize: "10px",
            color: "var(--fg3)",
            letterSpacing: "0.04em",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>&copy; 2026</span>
          <span>
            <span style={{ filter: "grayscale(1)" }}>📍</span> New York, NY
          </span>
        </div>

        <style jsx>{`
          .topbar-toggle:hover {
            color: var(--fg) !important;
          }
          .topbar-toggle:hover .toggle-dot {
            background: var(--fg) !important;
          }
          .homepage-link:hover {
            color: var(--fg) !important;
          }
          .hero-section {
            display: flex;
            align-items: center;
            padding: 0 24px;
            height: 260px;
            position: relative;
            overflow: hidden;
          }
          .hero-text {
            max-width: 320px;
          }
          .hero-canvas-wrap {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 50%;
          }
          @media (max-width: 680px) {
            .homepage-outer {
              padding-top: 40px !important;
            }
            .homepage-card {
              max-width: 100% !important;
            }
            .hero-section {
              flex-direction: column;
              height: auto;
              padding-top: 32px;
              padding-bottom: 0;
            }
            .hero-text {
              width: 100%;
              max-width: 100%;
            }
            .hero-canvas-wrap {
              position: relative;
              width: 100%;
              height: 180px;
              margin-top: 16px;
            }
            .hero-name {
              font-size: 24px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
