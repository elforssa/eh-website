import "server-only";

import { createHash, createSign } from "node:crypto";
import type { ValidatedTeacherApplication } from "./rules";

// Light flow: the Google Sheet is the only system of record for teacher
// applications (no Supabase table, no CRM). Meta CAPI is best-effort.

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getGoogleAccessToken(signal: AbortSignal) {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Google Sheets credentials are missing.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const unsignedJwt = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedJwt}.${signature}`,
    }),
    signal,
  });
  const result = await response.json();
  if (!response.ok || typeof result.access_token !== "string") {
    throw new Error(`Google authentication failed (${response.status}).`);
  }
  return result.access_token as string;
}

export type AppendResult = "APPENDED" | "DUPLICATE";

export async function appendTeacherApplication(
  applicationId: string,
  values: (string | number)[],
  timeoutMs = 8_000,
): Promise<AppendResult> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_TEACHER_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_TEACHER_SHEET || "Applications";
  if (!spreadsheetId) throw new Error("Teacher spreadsheet ID is missing.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const accessToken = await getGoogleAccessToken(controller.signal);
    const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
    const quotedSheet = `'${sheetName.replace(/'/g, "''")}'`;

    const lookupRange = encodeURIComponent(`${quotedSheet}!A:A`);
    const lookupResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${lookupRange}`,
      { headers, signal: controller.signal },
    );
    const lookup = await lookupResponse.json();
    if (!lookupResponse.ok) throw new Error(`Google Sheet lookup failed (${lookupResponse.status}).`);
    const exists = Array.isArray(lookup.values)
      && lookup.values.some((value: unknown[]) => value?.[0] === applicationId);
    if (exists) return "DUPLICATE";

    const appendRange = encodeURIComponent(`${quotedSheet}!A:AF`);
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      { method: "POST", headers, body: JSON.stringify({ values: [values] }), signal: controller.signal },
    );
    if (!appendResponse.ok) throw new Error(`Google Sheet append failed (${appendResponse.status}).`);
    return "APPENDED";
  } finally {
    clearTimeout(timer);
  }
}

function hashMetaValue(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendTeacherMetaEvent({
  application,
  attribution,
  clientIp,
  userAgent,
  eventSourceUrl,
}: {
  application: ValidatedTeacherApplication;
  attribution: Record<string, string>;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
}): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return false;

  const nameParts = application.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");
  const phone = application.phone.replace(/\D/g, "");
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
  const testEventCode = process.env.META_TEACHER_TEST_EVENT_CODE;
  const clean = (value?: string) => (value && !/\{\{/.test(value) ? value : undefined);

  const payload = {
    data: [{
      event_name: "SubmitApplication",
      event_time: Math.floor(Date.now() / 1000),
      event_id: application.submissionKey,
      action_source: "website",
      event_source_url: eventSourceUrl || "https://english-hills.com/recrutement-professeur-anglais",
      user_data: {
        em: [hashMetaValue(application.email)],
        ph: phone ? [hashMetaValue(phone)] : undefined,
        fn: firstName ? [hashMetaValue(firstName)] : undefined,
        ln: lastName ? [hashMetaValue(lastName)] : undefined,
        external_id: [hashMetaValue(`${application.email}:${phone}`)],
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp: application.metaTracking.fbp,
        fbc: application.metaTracking.fbc,
      },
      custom_data: {
        content_name: "English Teacher (Part-time)",
        content_category: "Recruitment",
        lead_source: "teacher_hiring",
        campaign_name: clean(attribution.utm_campaign_name),
        adset_name: clean(attribution.utm_adset_name),
        ad_name: clean(attribution.utm_ad_name),
        placement: clean(attribution.placement),
      },
    }],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3_500);
  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: accessToken }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    return response.ok && result.events_received === 1;
  } catch (error) {
    console.error("Teacher Meta CAPI error:", error instanceof Error ? error.message : error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
