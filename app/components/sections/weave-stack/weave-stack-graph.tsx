"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { jetbrainsMono } from "../../../fonts";
import type { WeaveStackHandle } from "./engine";
import "./weave-stack.css";

type Props = Readonly<{
  /** Whether the section is on screen; the simulation pauses while false. */
  active: boolean;
}>;

/**
 * Weave stack: the agent infrastructure I build, in three layers. Sits under
 * Gravity Wells in How I build. Markup mirrors the approved prototype; the
 * engine (D3 force) builds the graph and wires the tabs after mount.
 */
export const WeaveStackGraph = forwardRef<HTMLDivElement, Props>(
  function WeaveStackGraph({ active }, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<WeaveStackHandle | null>(null);
    const [inView, setInView] = useState(true);
    const running = active && inView;
    const runningRef = useRef(running);
    runningRef.current = running;

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      let cancelled = false;
      import("./engine").then(({ mountWeaveStack }) => {
        if (cancelled) return;
        const handle = mountWeaveStack(root);
        handle.setActive(runningRef.current);
        handleRef.current = handle;
      });
      return () => {
        cancelled = true;
        handleRef.current?.destroy();
        handleRef.current = null;
      };
    }, []);

    useEffect(() => {
      const root = rootRef.current;
      if (!root || typeof IntersectionObserver === "undefined") return;
      const io = new IntersectionObserver(([entry]) =>
        setInView(entry.isIntersecting),
      );
      io.observe(root);
      return () => io.disconnect();
    }, []);

    useEffect(() => {
      handleRef.current?.setActive(running);
    }, [running]);

    const style = {
      "--mono": `${jetbrainsMono.style.fontFamily}, ui-monospace, SFMono-Regular, Menlo, monospace`,
    } as CSSProperties;

    return (
      <div
        ref={(el) => {
          rootRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className="ws-root"
        style={style}
        aria-label="Agent infrastructure stack"
        role="region"
      >
        <div className="holder" data-ws="holder">
          <div className="art" data-ws="art">
            <div className="bar">
              <div
                className="seg"
                data-ws="tabs"
                role="group"
                aria-label="Kind of system"
              />
              <div className="seg view" role="group" aria-label="View">
                <button type="button" aria-pressed="true">
                  Stack
                </button>
                <button
                  type="button"
                  aria-disabled="true"
                  aria-label="Workflow, coming soon"
                >
                  Workflow
                </button>
              </div>
            </div>
            <div className="intro">
              <p className="one-liner" data-ws="oneLiner" />
              <p className="hint">
                Pick any tool to trace its threads across layers. Drag one to
                feel what it pulls with it.
              </p>
            </div>

            <div className="graph" data-ws="graph">
              <div data-ws="bands" />
              <svg data-ws="links" aria-hidden="true" />
              <div data-ws="nodes" />
              <div
                className="detail"
                data-ws="detail"
                aria-live="polite"
                hidden
              />
            </div>

            <div className="panel">
              <div className="col span2">
                <span className="caps">02 — How I build</span>
                <h3>Agent infrastructure, end to end.</h3>
                <p>
                  Three layers: the agents I build, the harness that keeps long
                  runs durable, and the evals that check the work. Each tab
                  lights the tools one kind of system depends on.
                </p>
              </div>
              <div className="col selected">
                <div className="sel" data-ws="sel" hidden>
                  <div className="sel-head">
                    <span className="sel-name" data-ws="selName" />
                    <span className="caps" data-ws="selLayer" />
                  </div>
                  <span className="sel-role" data-ws="selRole" />
                  <span className="caps">
                    Threads · <span data-ws="threadCount" />
                  </span>
                  <div className="chips" data-ws="chips" />
                </div>
                <span className="no-sel" data-ws="noSel">
                  <span
                    className="caps"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    Selected tool
                  </span>
                  None yet.
                </span>
              </div>
              <div className="col">
                <div className="legend" data-ws="legend" />
              </div>
            </div>
            <div className="caps" data-ws="caption" />
          </div>
        </div>
      </div>
    );
  },
);
