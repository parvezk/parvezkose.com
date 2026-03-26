import "./global.css";
import type { Metadata } from "next";
import { baseUrl } from "./sitemap";
import { CloudWatchRUM } from "./components/cloudwatch-rum";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "parvezkose.com",
    template: "%s",
  },
  description: "parvezkose.com",
  openGraph: {
    title: "parvezkose.com",
    description: "parvezkose.com",
    url: baseUrl,
    siteName: "parvezkose.com",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <CloudWatchRUM />
      </body>
    </html>
  );
}
