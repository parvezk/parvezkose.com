"use client";

import { AwsRum, type AwsRumConfig } from "aws-rum-web";
import { useEffect, useRef } from "react";

const APPLICATION_ID = process.env.NEXT_PUBLIC_CW_RUM_APP_ID ?? "";
const APPLICATION_REGION = process.env.NEXT_PUBLIC_CW_RUM_APP_REGION ?? "us-east-1";

const config: AwsRumConfig = {
  sessionSampleRate: 1,
  identityPoolId: process.env.NEXT_PUBLIC_CW_RUM_IDENTITY_POOL_ID ?? "",
  endpoint: process.env.NEXT_PUBLIC_CW_RUM_ENDPOINT ?? "",
  telemetries: ["performance", "errors", "http"],
  allowCookies: true,
  enableXRay: false,
  signing: true,
};

export function CloudWatchRUM() {
  const rumRef = useRef<AwsRum | null>(null);

  useEffect(() => {
    if (rumRef.current) return;
    if (!APPLICATION_ID || !config.identityPoolId) return;

    try {
      rumRef.current = new AwsRum(
        APPLICATION_ID,
        "1.0.0",
        APPLICATION_REGION,
        config
      );
    } catch {
      // Ignore errors thrown during CloudWatch RUM web client initialization
    }
  }, []);

  return null;
}
