"use client";

import { useEffect } from "react";

const CONFIG = {
  identityPoolId: process.env.NEXT_PUBLIC_CW_RUM_IDENTITY_POOL_ID ?? "",
  endpoint: process.env.NEXT_PUBLIC_CW_RUM_ENDPOINT ?? "",
  applicationId: process.env.NEXT_PUBLIC_CW_RUM_APP_ID ?? "",
  applicationRegion: process.env.NEXT_PUBLIC_CW_RUM_APP_REGION ?? "us-east-1",
};

export function CloudWatchRUM() {
  useEffect(() => {
    if (!CONFIG.applicationId || !CONFIG.identityPoolId) return;

    let isCancelled = false;

    (async () => {
      try {
        const { AwsRum } = await import("aws-rum-web");
        if (isCancelled) return;

        new AwsRum(
          CONFIG.applicationId,
          "1.0.0",
          CONFIG.applicationRegion,
          {
            allowCookies: true,
            endpoint: CONFIG.endpoint || undefined,
            identityPoolId: CONFIG.identityPoolId,
            sessionSampleRate: 1,
            telemetries: ["errors", "performance", "http"],
          }
        );
      } catch {
        // Silently ignore initialization errors so the site is never affected.
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
}
