"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent, trackMetaEventWithId } from "./metaPixelEvents";

type MetaLeadEventProps = {
  eventId?: string;
};

export function MetaLeadEvent({ eventId }: MetaLeadEventProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    hasTracked.current = true;
    if (eventId) {
      trackMetaEventWithId("Lead", eventId);
      return;
    }

    trackMetaEvent("Lead");
  }, [eventId]);

  return null;
}
