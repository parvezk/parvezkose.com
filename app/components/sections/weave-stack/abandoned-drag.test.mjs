/**
 * Contract check for Weave Stack abandoned-drag cleanup.
 *
 * pointerdown sets sim.alphaTarget(0.25) so the force sim keeps heating while
 * the user drags. If pointerup never arrives (Alt-Tab / release outside the
 * page) and setActive(false) only calls sim.stop(), a later setActive(true)
 * restarts the sim with alphaTarget still elevated — RAF render loops forever.
 *
 * setActive(false) must end the drag (clear drag + alphaTarget) before stop.
 */
import assert from "node:assert/strict";

function runScenario({ fixed }) {
  let alphaTarget = 0;
  let running = false;
  let drag = null;

  const sim = {
    alphaTarget(v) {
      if (arguments.length === 0) return alphaTarget;
      alphaTarget = v;
      return this;
    },
    alpha() {
      // While a stuck heat target is set, treat alpha as above the stop floor.
      return alphaTarget > 0 ? 1 : 0.0005;
    },
    alphaMin() {
      return 0.001;
    },
    restart() {
      running = true;
    },
    stop() {
      running = false;
    },
  };

  function endDrag() {
    if (!drag) return;
    drag = null;
    sim.alphaTarget(0);
  }

  function down() {
    drag = { id: "tool" };
    sim.alphaTarget(0.25);
    sim.restart();
  }

  function setActive(on) {
    if (!on) {
      if (fixed) endDrag();
      sim.stop();
    } else if (sim.alpha() > sim.alphaMin()) {
      sim.restart();
    }
  }

  down();
  // Abandon the gesture: no pointerup / endDrag from the window.
  setActive(false);
  setActive(true);

  return { running, alphaTarget, drag };
}

const broken = runScenario({ fixed: false });
assert.equal(broken.alphaTarget, 0.25, "precondition: abandoned drag leaves alphaTarget hot");
assert.equal(broken.running, true, "precondition: reactivation restarts a hot sim");
assert.ok(broken.drag, "precondition: drag handle is still held");

const fixed = runScenario({ fixed: true });
assert.equal(fixed.alphaTarget, 0, "setActive(false) must cool alphaTarget");
assert.equal(fixed.running, false, "cooled sim must not restart on reactivation");
assert.equal(fixed.drag, null, "setActive(false) must clear the drag handle");

console.log("abandoned-drag.test.mjs: ok");
