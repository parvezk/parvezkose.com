import { JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { HomePage } from "../components/home-page";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Classic layout — Parvez Kose",
  description:
    "Previous card layout with dot-grid hero (legacy landing alternative).",
};

export default function ClassicLandingPage() {
  return (
    <div className={jetbrainsMono.className}>
      <HomePage />
    </div>
  );
}
