import { Fira_Code, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ImmersiveHeroClient } from "./components/immersive-hero-client";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
