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
 *
 * Use a raw Location header (not NextURL/NextResponse.redirect): NextURL strips
 * trailing slashes even when skipTrailingSlashRedirect is set (vercel/next.js#66738).
 */
export async function GET(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.endsWith("/")) {
    return new Response(null, {
      status: 308,
      headers: { Location: `${pathname}/${search}` },
    });
  }

  if (!htmlCachePromise) {
    const filePath = path.join(
      process.cwd(),
      "public/design-system/index.html",
    );
    // Only keep a resolved read. Caching a rejected promise permanently
    // 500s every later request on this worker even after the file is restored.
    htmlCachePromise = fs.readFile(filePath, "utf8").catch((err) => {
      htmlCachePromise = null;
      throw err;
    });
  }
  const html = await htmlCachePromise;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
