import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import type { InquiryPayload } from "./contract";
import { legacyMetaCapiEnabled } from "./meta-switch";

function hash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Compatibility with the existing campaign Lead CAPI event. The website
// request_key is its event ID, so a repeated accepted request can be deduped.
export async function sendExistingMetaLead(req: NextRequest, inquiry: InquiryPayload) {
  if (!legacyMetaCapiEnabled(process.env.CRM_LEGACY_META_CAPI_ENABLED)) return;
  if (inquiry.form_key === "general_contact_v1") return;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;
  const contact = inquiry.contact;
  const name = contact.name || "";
  const phone = contact.phone || "";
  const email = contact.email || "";
  const firstName = name.split(/\s+/)[0] || "";
  const lastName = name.split(/\s+/).slice(1).join(" ");
  const attribution = inquiry.attribution || {};
  const sourceUrl = attribution.landing_page || "https://www.english-hills.com";
  const payload = {
    data: [{
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: inquiry.request_key,
      action_source: "website",
      event_source_url: sourceUrl,
      user_data: {
        em: email ? [hash(email)] : undefined,
        ph: phone ? [hash(phone.replace(/[^\d+]/g, ""))] : undefined,
        fn: firstName ? [hash(firstName)] : undefined,
        ln: lastName ? [hash(lastName)] : undefined,
        external_id: [hash(`${email || "no-email"}:${phone.replace(/[^\d+]/g, "")}`)],
        client_ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined,
        client_user_agent: req.headers.get("user-agent") || undefined,
        fbp: attribution.fbp,
        fbc: attribution.fbc,
      },
      custom_data: {
        content_name: inquiry.answers.program_interest,
        content_category: inquiry.answers.learner_type,
        lead_source: inquiry.form_key,
        traffic_source: attribution.utm_source,
        campaign_id: attribution.utm_campaign,
        ad_id: attribution.utm_content,
      },
    }],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
    access_token: token,
  };
  const response = await fetch(`https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v23.0"}/${pixelId}/events`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`Meta CAPI returned ${response.status}`);
}
