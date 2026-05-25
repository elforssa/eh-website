"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaLeadEvent() {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current || typeof window.fbq !== "function") return;

    hasTracked.current = true;
    window.fbq("track", "Lead");
  }, []);

  return null;
}
