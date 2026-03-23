"use client";

import { AwsRum, type AwsRumConfig } from "aws-rum-web";

const APPLICATION_ID = process.env.NEXT_PUBLIC_CW_RUM_APP_ID ?? "";
const APPLICATION_REGION = process.env.NEXT_PUBLIC_CW_RUM_APP_REGION ?? "";
const IDENTITY_POOL_ID = process.env.NEXT_PUBLIC_CW_RUM_IDENTITY_POOL_ID ?? "";
const ENDPOINT = process.env.NEXT_PUBLIC_CW_RUM_ENDPOINT ?? "";

function deriveRegion(): string {
  if (APPLICATION_REGION) return APPLICATION_REGION;
  const match = ENDPOINT.match(/\.rum\.([a-z0-9-]+)\.amazonaws\.com/);
  return match?.[1] ?? "";
}

function initRum(): AwsRum | null {
  const region = deriveRegion();
  if (!APPLICATION_ID || !IDENTITY_POOL_ID || !region) return null;

  const config: AwsRumConfig = {
    sessionSampleRate: 1,
    identityPoolId: IDENTITY_POOL_ID,
    endpoint: ENDPOINT || undefined,
    telemetries: ["performance", "errors", "http"],
    allowCookies: true,
    enableXRay: false,
    signing: true,
  };

  try {
    return new AwsRum(APPLICATION_ID, "1.0.0", region, config);
  } catch {
    return null;
  }
}

// Runs at module-evaluation time — the earliest point in the client bundle —
// so startup errors and first-paint telemetry are captured.
export const rum = typeof window !== "undefined" ? initRum() : null;

export function CloudWatchRUM() {
  return null;
}
