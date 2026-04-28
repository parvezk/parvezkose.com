/**
 * Design System atoms — Parvez Kose Site DS
 *
 * Server-renderable primitives that consume the tokens defined in
 * app/global.css (@theme + :root) and design-system/tokens.json. None of
 * these atoms own surface state; wrap them in <Surface mode="…"> to scope
 * their --surface-* vars.
 *
 * Showcase: /lab/atoms (noindex). Live mounts pending — / and /classic are
 * intentionally untouched until atom parity is verified.
 */
export { Surface } from "./surface";
export type { DsSurfaceMode } from "./surface";

export { Eyebrow } from "./eyebrow";
export { Caret } from "./caret";
export { NavCapsLink } from "./nav-caps-link";
export { Divider } from "./divider";

export { Pill } from "./pill";
export type { PillTone } from "./pill";

export { Button } from "./button";
export type { DsButtonVariant } from "./button";

export { LinkRow } from "./link-row";
export { TopBar } from "./top-bar";
export { Footer } from "./footer";
export { HeroFrame } from "./hero-frame";
