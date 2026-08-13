import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

let htmlCachePromise: Promise<string> | null = null;

/**
 * Serves the static design-system specimen at /design-system/ without relying on
 * next.config rewrites to public/*.html — some hosts (e.g. Amplify) do not apply
 * those rewrites the same way as next start locally.
 *
 * skipTrailingSlashRedirect is enabled for PostHog, so /design-system (no slash)
 * would otherwise serve this HTML at a URL where relative CSS/nav assets resolve
 * to the site root and 404. Canonicalize to /design-system/.
 */
export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 308);
  }

  if (!htmlCachePromise) {
    const filePath = path.join(
      process.cwd(),
      "public/design-system/index.html",
    );
    htmlCachePromise = fs.readFile(filePath, "utf8");
  }
  const html = await htmlCachePromise;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
