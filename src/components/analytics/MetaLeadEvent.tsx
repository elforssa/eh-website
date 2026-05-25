"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent } from "./metaPixelEvents";

export function MetaLeadEvent() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    hasTracked.current = true;
    trackMetaEvent("Lead");
  }, []);

  return null;
}
