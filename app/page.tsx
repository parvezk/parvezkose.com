import type { Metadata } from "next";
import { ImmersiveHeroClient } from "./components/immersive-hero-client";
import { jetbrainsMono, firaCode } from "./fonts";

export const metadata: Metadata = {
  title: "Parvez Kose",
  description:
    "Designing interfaces for intelligence. AI-augmented interfaces, agentic systems, and visual interpretability.",
};

export default function HomePage() {
  return (
    <ImmersiveHeroClient
      jetbrainsClassName={jetbrainsMono.className}
      firaClassName={firaCode.className}
    />
  );
}
