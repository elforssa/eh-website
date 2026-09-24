"use client";

import { useEffect, useRef } from "react";
import { trackMetaEventWithId } from "./metaPixelEvents";

type RecruitmentThankYouTrackerProps = {
  applicationId?: string;
  token?: string;
};

export function RecruitmentThankYouTracker({ applicationId, token }: RecruitmentThankYouTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!applicationId || !token || tracked.current) return;
    const controller = new AbortController();

    fetch("/api/job-applications/thank-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, token }),
      signal: controller.signal,
    })
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!result?.valid || !result.eventId || tracked.current) return;
        tracked.current = true;
        window.history.replaceState(null, "", "/merci-candidature");
        trackMetaEventWithId("SubmitApplication", result.eventId);
      })
      .catch(() => {
        // The server-side CAPI delivery remains durable if browser tracking is unavailable.
      });

    return () => controller.abort();
  }, [applicationId, token]);

  return null;
}
