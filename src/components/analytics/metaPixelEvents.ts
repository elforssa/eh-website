"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(eventName: string, attempts = 20) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName);
    return;
  }

  if (attempts <= 0) return;

  window.setTimeout(() => {
    trackMetaEvent(eventName, attempts - 1);
  }, 250);
}
