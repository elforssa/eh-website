"use client";

import { useEffect, useRef } from "react";
import { trackMetaEventWithId } from "./metaPixelEvents";

// Fires the browser SubmitApplication event only when the server confirms a fresh,
// signed receipt (set by a real submission). Direct visits and reloads fire nothing.
export function TeacherThankYouTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    const controller = new AbortController();
    fetch("/api/teacher-applications/thank-you", { method: "POST", signal: controller.signal })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (!result?.valid || !result.eventId || tracked.current) return;
        tracked.current = true;
        trackMetaEventWithId("SubmitApplication", result.eventId);
      })
      .catch(() => {
        // The server-side CAPI event is still sent if browser tracking is unavailable.
      });
    return () => controller.abort();
  }, []);

  return null;
}
