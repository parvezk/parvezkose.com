import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { jetbrainsMono, firaCode, plexSans, plexSerif } from "../fonts";

export const metadata: Metadata = {
  title: "Lab · parvezkose.com",
  description: "Internal previews. Not part of the public site.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const fontVarOverrides: CSSProperties = {
  // Override the @theme font tokens for this subtree so `font-mono`,
  // `font-sans`, `font-serif` utilities resolve to the loaded faces
  // without touching the rest of the site.
  ["--font-family-mono" as string]:
    "var(--font-jetbrains-mono), 'Fira Code', ui-monospace, 'SF Mono', Menlo, monospace",
  ["--font-family-code" as string]:
    "var(--font-fira-code), var(--font-jetbrains-mono), ui-monospace, monospace",
  ["--font-family-sans" as string]:
    "var(--font-plex-sans), ui-sans-serif, system-ui, sans-serif",
  ["--font-family-serif" as string]:
    "var(--font-plex-serif), ui-serif, Georgia, serif",
};

export default function LabLayout({ children }: { children: ReactNode }) {
  const fontClasses = [
    jetbrainsMono.variable,
    firaCode.variable,
    plexSans.variable,
    plexSerif.variable,
  ].join(" ");

  return (
    <div className={fontClasses} style={fontVarOverrides}>
      {children}
    </div>
  );
}
