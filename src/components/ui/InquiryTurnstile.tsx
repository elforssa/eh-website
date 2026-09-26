"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import Script from "next/script";
import { CRM_TURNSTILE_ERROR, TurnstileError } from "@/lib/crm/transport";
import { CRM_TURNSTILE_ACTION } from "@/lib/crm/turnstile-config";

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    execution: "execute";
    appearance: "always";
    callback: (token: string) => void;
    "error-callback": () => void;
    "expired-callback": () => void;
    "timeout-callback": () => void;
  }) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
type PendingToken = { resolve: (token: string) => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> };

export type InquiryTurnstileHandle = { requestToken: () => Promise<string> };

export const InquiryTurnstile = forwardRef<InquiryTurnstileHandle>(function InquiryTurnstile(_props, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const pending = useRef<PendingToken | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");

  const fail = useCallback(() => {
    const current = pending.current;
    pending.current = null;
    if (current) {
      clearTimeout(current.timeout);
      current.reject(new TurnstileError());
    }
    setError(CRM_TURNSTILE_ERROR);
  }, []);

  useEffect(() => {
    if (!scriptReady || !siteKey || !container.current || !window.turnstile) return;
    // The Admin contract accepts only tokens issued on its configured www origin.
    if (process.env.NODE_ENV === "production" && window.location.hostname !== "www.english-hills.com") return;
    const api = window.turnstile;
    let widgetId: string;
    try {
      widgetId = api.render(container.current, {
        sitekey: siteKey,
        action: CRM_TURNSTILE_ACTION,
        execution: "execute",
        appearance: "always",
        callback: (token) => {
          const current = pending.current;
          pending.current = null;
          if (current) {
            clearTimeout(current.timeout);
            current.resolve(token);
          }
        },
        "error-callback": fail,
        "expired-callback": fail,
        "timeout-callback": fail,
      });
    } catch { queueMicrotask(fail); return; }
    widget.current = widgetId;
    return () => {
      const current = pending.current;
      pending.current = null;
      if (current) {
        clearTimeout(current.timeout);
        current.reject(new TurnstileError());
      }
      widget.current = null;
      try { api.remove(widgetId); } catch { /* Widget may already be gone. */ }
    };
  }, [scriptReady, fail]);

  const requestToken = useCallback(async () => {
    const api = window.turnstile;
    const widgetId = widget.current;
    if (!siteKey || !api || !widgetId || pending.current ||
      (process.env.NODE_ENV === "production" && window.location.hostname !== "www.english-hills.com")) {
      throw new TurnstileError();
    }
    setError("");
    // Always reset before execute. A previous network attempt may have consumed
    // its token even when the browser never received the response.
    try { api.reset(widgetId); } catch { fail(); throw new TurnstileError(); }
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(fail, 90_000);
      pending.current = { resolve, reject, timeout };
      try { api.execute(widgetId); } catch { fail(); }
    });
  }, [fail]);

  useImperativeHandle(ref, () => ({ requestToken }), [requestToken]);
  return <div className="space-y-2">
    <div ref={container} aria-label="Vérification anti-robot" />
    {siteKey && <Script src={scriptUrl} strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={fail} />}
    {(!siteKey || error) && <p role="alert" className="text-sm text-red-600">{CRM_TURNSTILE_ERROR}</p>}
  </div>;
});
