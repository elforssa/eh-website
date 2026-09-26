"use client";

import { useEffect, useRef } from "react";
import { trackMetaEventWithId } from "./metaPixelEvents";

export function InquiryThankYouTracker() {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    fetch("/api/crm-inquiry/thank-you", { method: "POST", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!result?.valid || !result.eventId || tracked.current) return;
        tracked.current = true;
        trackMetaEventWithId("Lead", result.eventId);
      })
      .catch(() => { /* A conversion failure never changes the inquiry receipt. */ });
  }, []);
  return null;
}
