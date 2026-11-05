/**
 * Pure-function checks for dwell scroll compensation.
 * Run: node --input-type=module app/lib/camera/path.dwell.test.mjs
 */
import {
  DWELL_ANCHOR,
  SEGMENT_COUNT,
  dwellScrollCompensation,
  sampleScroll,
  scrollForAnchor,
} from "./path.ts";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const R0 = 3000;
const D = 1400;
const yAhead = scrollForAnchor(3, R0, 0);
assert(sampleScroll(yAhead, R0, 0).nearestAnchor === 3, "ahead @ dwell 0");

const R1 = R0 + D;
assert(
  sampleScroll(yAhead, R1, D).nearestAnchor === 2,
  "uncompensated scroll must snap into build dwell",
);

const shift = dwellScrollCompensation(yAhead, R1, 0, D);
assert(shift === D, `expected shift ${D}, got ${shift}`);
assert(
  sampleScroll(yAhead + shift, R1, D).nearestAnchor === 3,
  "compensated scroll must stay on Thinking Ahead",
);

assert(dwellScrollCompensation(100, R1, 0, D) === 0, "pre-dwell: no shift");

const base = R1 - D;
const at = (DWELL_ANCHOR / SEGMENT_COUNT) * base;
assert(
  dwellScrollCompensation(at + 500, R1, 1000, D) === 0,
  "inside prior dwell: no shift",
);
assert(
  dwellScrollCompensation(at + 1000 + 10, R1, 1000, D) === 400,
  "past prior dwell: shift by delta",
);

console.log("path.dwell.test.mjs: ok");
