"use client";

import { useEffect } from "react";

type ThankYouTrackerProps = {
  leadId?: string;
  token?: string;
};

export function ThankYouTracker({ leadId, token }: ThankYouTrackerProps) {
  useEffect(() => {
    if (!leadId || !token) return;

    const controller = new AbortController();

    fetch("/api/ad-leads/thank-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, token }),
      signal: controller.signal,
    }).catch(() => {
      // Conversion marking is best-effort; the thank-you page should still render.
    });

    return () => controller.abort();
  }, [leadId, token]);

  return null;
}
