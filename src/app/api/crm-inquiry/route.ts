import { NextRequest, NextResponse } from "next/server";
import { prepareInquiry } from "@/lib/crm/contract";
import { makeReceipt, receiptCookie } from "@/lib/crm/receipt";
import { sendExistingMetaLead } from "@/lib/crm/legacy-meta";
import { runLegacyMetaCompatibility } from "@/lib/crm/meta-switch";

const canonicalOrigin = "https://www.english-hills.com";

export async function POST(req: NextRequest) {
  const incomingOrigin = req.headers.get("origin");
  if (incomingOrigin && ![req.nextUrl.origin, canonicalOrigin, "https://english-hills.com"].includes(incomingOrigin)) {
    return NextResponse.json({ error: "Demande invalide." }, { status: 403 });
  }
  const endpoint = process.env.CRM_INQUIRY_ENDPOINT;
  const siteKey = process.env.CRM_WEBSITE_SITE_KEY;
  if (!endpoint || !siteKey || (process.env.CRM_WEBSITE_RECEIPT_SECRET || "").length < 32) {
    return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
  }
  let url: URL;
  try { url = new URL(endpoint); } catch { return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 }); }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) {
    return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "Demande invalide." }, { status: 400 }); }
  const prepared = prepareInquiry(raw, siteKey);
  if (!prepared.ok) return NextResponse.json({ error: "Vérifiez vos informations." }, { status: prepared.status });
  if (prepared.honeypot) return NextResponse.json({ success: true });

  // Turnstile tokens are single-use. Browser retries retain request_key but
  // execute a fresh challenge before making another network submission.
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: canonicalOrigin },
      body: JSON.stringify(prepared.value),
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (response.ok) {
      // Compatibility delivery is bounded and never changes CRM acceptance.
      await runLegacyMetaCompatibility(
        process.env.CRM_LEGACY_META_CAPI_ENABLED,
        () => sendExistingMetaLead(req, prepared.value),
        (error) => console.error("Compatibility Meta CAPI delivery failed", error),
      );
      const accepted = NextResponse.json({ success: true });
      if (prepared.value.form_key !== "general_contact_v1") {
        accepted.cookies.set(receiptCookie, makeReceipt(prepared.value.request_key), {
          httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
          path: "/", maxAge: 600,
        });
      }
      return accepted;
    }
    if (response.status === 429) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
    if (response.status === 400 || response.status === 403 || response.status === 422) {
      return NextResponse.json({ error: "Vérifiez vos informations." }, { status: 422 });
    }
  } catch { /* An uncertain response must be retried with a fresh token. */ }
  return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
}
