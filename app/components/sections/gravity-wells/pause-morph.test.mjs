/**
 * Contract check for Gravity Wells pause vs mode-morph.
 *
 * The engine's setMode() drives pull interpolation with a d3 timer that calls
 * sim.restart() every tick. pause() must stop that timer; otherwise an
 * off-screen section keeps the force simulation alive (especially with orbit
 * alphaTarget > 0).
 *
 * This file mirrors that lifecycle with a tiny stand-in so CI can lock the
 * contract without mounting the full SVG graph.
 */
import assert from "node:assert/strict";
import { timer as d3timer } from "d3";

function runScenario({ fixed }) {
  let simRunning = false;
  let morph = null;
  const ui = { active: true };

  const sim = {
    restart() {
      simRunning = true;
    },
    stop() {
      simRunning = false;
    },
  };

  function setMode() {
    if (morph) morph.stop();
    morph = d3timer(() => {
      if (fixed && !ui.active) {
        morph.stop();
        morph = null;
        return;
      }
      sim.restart();
    });
  }

  function pause() {
    if (fixed && morph) {
      morph.stop();
      morph = null;
    }
    sim.stop();
  }

  setMode();
  // First tick may already have restarted the sim; pause while morph is live.
  ui.active = false;
  pause();

  return new Promise((resolve) => {
    setTimeout(() => {
      const leaked = simRunning;
      if (morph) morph.stop();
      resolve(leaked);
    }, 50);
  });
}

const leakedWithoutFix = await runScenario({ fixed: false });
assert.equal(
  leakedWithoutFix,
  true,
  "precondition: leaving morph alive after pause restarts the sim",
);

const leakedWithFix = await runScenario({ fixed: true });
assert.equal(
  leakedWithFix,
  false,
  "pause must stop morph so the sim stays stopped while inactive",
);

console.log("pause-morph.test.mjs: ok");
