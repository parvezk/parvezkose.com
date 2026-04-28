import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      // Static design system specimens live in public/design-system/ and need
      // an explicit directory-index rewrite — Next does not auto-resolve
      // /some-dir/ to /some-dir/index.html for static assets.
      {
        source: "/design-system",
        destination: "/design-system/index.html",
      },
      {
        source: "/design-system/",
        destination: "/design-system/index.html",
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
