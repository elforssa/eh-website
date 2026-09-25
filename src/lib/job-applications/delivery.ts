import "server-only";

import { createHash, createSign } from "node:crypto";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "./supabase";

type DeliveryStatus = "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED";

type JobApplicationRow = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  area: string;
  preferred_shift: string;
  start_availability: string;
  experience_categories: string[];
  sales_experience_duration: string;
  previous_prospecting: string;
  comfortable_prospecting: string;
  comfortable_targets: boolean;
  french_level: string;
  darija_level: string;
  english_level: string;
  crm_tools_experience: string;
  sales_scenario_response: string;
  cv_storage_path: string;
  automatic_score: number;
  application_status: string;
  knockout_reasons: string[];
  lead_source: string;
  fbp: string | null;
  fbc: string | null;
  normalized_phone: string;
  normalized_email: string;
  client_ip_address: string | null;
  client_user_agent: string | null;
  meta_event_id: string;
  meta_campaign_id: string | null;
  meta_campaign_name: string | null;
  meta_adset_id: string | null;
  meta_adset_name: string | null;
  meta_ad_id: string | null;
  meta_ad_name: string | null;
  placement: string | null;
  landing_page: string | null;
  meta_delivery_status: DeliveryStatus;
  meta_delivery_attempts: number;
  meta_delivery_claim_id: string | null;
  sheet_sync_status: DeliveryStatus;
  sheet_sync_attempts: number;
  sheet_sync_claim_id: string | null;
};

const labels: Record<string, string> = {
  MORNING: "Matin — 09h00–15h00",
  AFTERNOON: "Après-midi — 15h00–20h00",
  EITHER: "Les deux me conviennent",
  IMMEDIATELY: "Immédiatement",
  UNDER_ONE_WEEK: "Dans moins d'une semaine",
  ONE_TO_TWO_WEEKS: "Dans 1–2 semaines",
  OVER_TWO_WEEKS: "Dans plus de 2 semaines",
  SALES: "Vente / commercial",
  CALL_CENTER: "Centre d'appel",
  TELEPROSPECTING: "Téléprospection",
  CUSTOMER_SERVICE: "Service client",
  RECEPTION: "Réception",
  EDUCATION_ADMISSIONS: "Éducation / admissions",
  NONE: "Aucun de ces domaines",
  OTHER: "Autre",
  UNDER_SIX_MONTHS: "Moins de 6 mois",
  SIX_TO_TWELVE_MONTHS: "6–12 mois",
  ONE_TO_TWO_YEARS: "1–2 ans",
  OVER_TWO_YEARS: "Plus de 2 ans",
  REGULARLY: "Oui, régulièrement",
  SOMETIMES: "Oui, quelques fois",
  NEVER: "Non",
  YES: "Oui",
  WITH_TRAINING: "Oui, avec une formation",
  NO: "Non",
  BASIC: "Basique",
  AVERAGE: "Moyen",
  GOOD: "Bon",
  VERY_GOOD: "Très bon",
  SOMEWHAT: "Un peu",
};

function label(value: string) {
  return labels[value] || value;
}

function hashMetaValue(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function googlePrivateKey() {
  return process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

async function getGoogleAccessToken(signal: AbortSignal) {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = googlePrivateKey();
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

function retryAt(attempts: number) {
  const delaysMinutes = [5, 15, 60, 360, 1440, 1440, 1440, 1440];
  const delay = delaysMinutes[Math.min(Math.max(attempts - 1, 0), delaysMinutes.length - 1)];
  return new Date(Date.now() + delay * 60_000).toISOString();
}

function safeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "Unknown delivery error";
}

async function sendMetaApplication(row: JobApplicationRow, signal: AbortSignal) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) throw new Error("Meta CAPI configuration is missing.");

  const nameParts = row.full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
  const testEventCode = process.env.META_RECRUITMENT_TEST_EVENT_CODE;
  const payload = {
    data: [{
      event_name: "SubmitApplication",
      event_time: Math.floor(new Date(row.created_at).getTime() / 1000),
      event_id: row.meta_event_id,
      action_source: "website",
      event_source_url: row.landing_page || "https://english-hills.com/recrutement-receptionniste",
      user_data: {
        em: [hashMetaValue(row.normalized_email)],
        ph: [hashMetaValue(row.normalized_phone)],
        fn: firstName ? [hashMetaValue(firstName)] : undefined,
        ln: lastName ? [hashMetaValue(lastName)] : undefined,
        external_id: [hashMetaValue(`${row.normalized_email}:${row.normalized_phone}`)],
        client_ip_address: row.client_ip_address || undefined,
        client_user_agent: row.client_user_agent || undefined,
        fbp: row.fbp || undefined,
        fbc: row.fbc || undefined,
      },
      custom_data: {
        content_name: "Chargé(e) d’Accueil & Admissions",
        content_category: "Recruitment",
        lead_source: "receptionist_hiring",
        campaign_id: row.meta_campaign_id || undefined,
        campaign_name: row.meta_campaign_name || undefined,
        adset_id: row.meta_adset_id || undefined,
        adset_name: row.meta_adset_name || undefined,
        ad_id: row.meta_ad_id || undefined,
        ad_name: row.meta_ad_name || undefined,
        placement: row.placement || undefined,
      },
    }],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, access_token: accessToken }),
    signal,
  });
  const result = await response.json();
  if (!response.ok || result.events_received !== 1) {
    throw new Error(`Meta rejected SubmitApplication (${response.status}).`);
  }
}

const CV_SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60;

function sheetHyperlink(url: string, label: string) {
  const escapeFormulaValue = (value: string) => value.replace(/"/g, '""');
  return `=HYPERLINK("${escapeFormulaValue(url)}","${escapeFormulaValue(label)}")`;
}

function sheetRow(row: JobApplicationRow, signedCvUrl: string) {
  return [
    row.created_at,
    row.full_name,
    row.phone,
    row.email,
    row.area,
    label(row.preferred_shift),
    label(row.start_availability),
    row.experience_categories.map(label).join(", "),
    label(row.sales_experience_duration),
    label(row.previous_prospecting),
    label(row.comfortable_prospecting),
    row.comfortable_targets ? "Oui" : "Non",
    label(row.french_level),
    label(row.darija_level),
    label(row.english_level),
    label(row.crm_tools_experience),
    row.automatic_score,
    "",
    "",
    row.application_status,
    sheetHyperlink(signedCvUrl, "View CV"),
    "",
    row.sales_scenario_response,
    row.knockout_reasons.join(", "),
    row.meta_campaign_name || row.meta_campaign_id || "",
    row.meta_adset_name || row.meta_adset_id || "",
    row.meta_ad_name || row.meta_ad_id || "",
    row.lead_source,
    row.id,
  ];
}

async function writeGoogleSheet(row: JobApplicationRow, signal: AbortSignal) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_RECRUITMENT_SPREADSHEET_ID;
  const configuredRange = process.env.GOOGLE_SHEETS_RECRUITMENT_RANGE || "Applications!A:AC";
  if (!spreadsheetId) throw new Error("Recruitment spreadsheet ID is missing.");

  const supabase = createServiceSupabaseClient();
  const { data: signedCv, error: signedCvError } = await supabase.storage
    .from(JOB_CV_BUCKET)
    .createSignedUrl(row.cv_storage_path, CV_SIGNED_URL_TTL_SECONDS);
  if (signedCvError || !signedCv?.signedUrl) {
    throw new Error("Unable to create a signed CV URL for Google Sheets.");
  }

  const accessToken = await getGoogleAccessToken(signal);
  const sheetName = configuredRange.includes("!") ? configuredRange.split("!")[0] : "Applications";
  const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const idLookupRange = encodeURIComponent(`${sheetName}!AC:AC`);
  const lookupResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${idLookupRange}`,
    { headers, signal },
  );
  const lookup = await lookupResponse.json();
  if (!lookupResponse.ok) throw new Error(`Google Sheet lookup failed (${lookupResponse.status}).`);

  const existingIndex = Array.isArray(lookup.values)
    ? lookup.values.findIndex((value: unknown[]) => value?.[0] === row.id)
    : -1;
  const values = sheetRow(row, signedCv.signedUrl);

  if (existingIndex >= 0) {
    const sheetRowNumber = existingIndex + 1;
    const updates = [
      { range: `${sheetName}!A${sheetRowNumber}:Q${sheetRowNumber}`, values: [values.slice(0, 17)] },
      { range: `${sheetName}!U${sheetRowNumber}:U${sheetRowNumber}`, values: [[values[20]]] },
      { range: `${sheetName}!W${sheetRowNumber}:AC${sheetRowNumber}`, values: [values.slice(22, 29)] },
    ];
    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: updates }),
        signal,
      },
    );
    if (!updateResponse.ok) throw new Error(`Google Sheet update failed (${updateResponse.status}).`);
    return;
  }

  const appendRange = encodeURIComponent(configuredRange);
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ values: [values] }),
      signal,
    },
  );
  if (!appendResponse.ok) throw new Error(`Google Sheet append failed (${appendResponse.status}).`);
}

async function markMetaResult(row: JobApplicationRow, claimId: string, error?: unknown) {
  const supabase = createServiceSupabaseClient();
  const update = error
    ? {
        meta_delivery_status: "FAILED",
        meta_delivery_error: safeError(error),
        meta_next_retry_at: retryAt(row.meta_delivery_attempts),
        meta_delivery_claim_id: null,
      }
    : {
        meta_delivery_status: "DELIVERED",
        meta_delivery_error: null,
        meta_next_retry_at: null,
        meta_delivery_claim_id: null,
        meta_event_sent_at: new Date().toISOString(),
      };
  await supabase.from("job_applications").update(update)
    .eq("id", row.id)
    .eq("meta_delivery_status", "PROCESSING")
    .eq("meta_delivery_claim_id", claimId);
}

async function markSheetResult(row: JobApplicationRow, claimId: string, error?: unknown) {
  const supabase = createServiceSupabaseClient();
  const update = error
    ? {
        sheet_sync_status: "FAILED",
        sheet_sync_error: safeError(error),
        sheet_next_retry_at: retryAt(row.sheet_sync_attempts),
        sheet_sync_claim_id: null,
      }
    : {
        sheet_sync_status: "DELIVERED",
        sheet_sync_error: null,
        sheet_next_retry_at: null,
        sheet_sync_claim_id: null,
        sheet_synced_at: new Date().toISOString(),
      };
  await supabase.from("job_applications").update(update)
    .eq("id", row.id)
    .eq("sheet_sync_status", "PROCESSING")
    .eq("sheet_sync_claim_id", claimId);
}

async function deliverClaimedMeta(row: JobApplicationRow, claimId: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await sendMetaApplication(row, controller.signal);
    await markMetaResult(row, claimId);
  } catch (error) {
    await markMetaResult(row, claimId, error);
  } finally {
    clearTimeout(timeout);
  }
}

async function deliverClaimedSheet(row: JobApplicationRow, claimId: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await writeGoogleSheet(row, controller.signal);
    await markSheetResult(row, claimId);
  } catch (error) {
    await markSheetResult(row, claimId, error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function processJobApplicationDeliveries({
  applicationId,
  limit = 10,
  timeoutMs = 8_000,
}: {
  applicationId?: string;
  limit?: number;
  timeoutMs?: number;
} = {}) {
  const supabase = createServiceSupabaseClient();
  const metaClaimId = crypto.randomUUID();
  const sheetClaimId = crypto.randomUUID();
  const { data: metaData, error: metaError } = await supabase.rpc("claim_job_application_meta_deliveries", {
    p_limit: limit,
    p_application_id: applicationId || null,
    p_claim_id: metaClaimId,
  });
  if (metaError) throw new Error(`Unable to claim Meta recruitment deliveries: ${metaError.message}`);

  const { data: sheetData, error: sheetError } = await supabase.rpc("claim_job_application_sheet_deliveries", {
    p_limit: limit,
    p_application_id: applicationId || null,
    p_claim_id: sheetClaimId,
  });
  if (sheetError) throw new Error(`Unable to claim Sheet recruitment deliveries: ${sheetError.message}`);

  const metaRows = (metaData || []) as JobApplicationRow[];
  const sheetRows = (sheetData || []) as JobApplicationRow[];
  await Promise.all([
    ...metaRows.map((row) => deliverClaimedMeta(row, metaClaimId, timeoutMs)),
    ...sheetRows.map((row) => deliverClaimedSheet(row, sheetClaimId, timeoutMs)),
  ]);
  return metaRows.length + sheetRows.length;
}
