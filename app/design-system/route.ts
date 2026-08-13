import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

let htmlCachePromise: Promise<string> | null = null;

/**
 * Serves the static design-system specimen at /design-system/ without relying on
 * next.config rewrites to public/*.html — some hosts (e.g. Amplify) do not apply
 * those rewrites the same way as next start locally.
 */
export async function GET() {
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
