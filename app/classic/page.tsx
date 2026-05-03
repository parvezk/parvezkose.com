import type { Metadata } from "next";
import { HomePage } from "../components/home-page";
import { jetbrainsMono } from "../fonts";

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
