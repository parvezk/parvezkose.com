import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Serves the static design-system specimen at /design-system/ without relying on
 * next.config rewrites to public/*.html — some hosts (e.g. Amplify) do not apply
 * those rewrites the same way as next start locally.
 */
export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public/design-system/index.html",
  );
  const html = await fs.readFile(filePath, "utf8");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
