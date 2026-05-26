import { createHash, createSign } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
  Required Supabase table — run this SQL in the Supabase SQL editor:

  create table ad_leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text not null,
    learner_type text not null,
    program_interest text not null,
    location_confirmed boolean not null default false,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_campaign_name text,
    utm_adset text,
    utm_adset_name text,
    utm_content text,
    utm_ad_name text,
    utm_term text,
    placement text,
    fbclid text,
    landing_page text,
    form_page text,
    referrer text,
    attribution jsonb,
    thank_you_token uuid not null,
    thank_you_viewed_at timestamptz,
    created_at timestamptz default now()
  );

  alter table ad_leads enable row level security;

  If you already created the earlier draft table with preferred_time/message:

  alter table ad_leads alter column preferred_time drop not null;
  alter table ad_leads drop column if exists preferred_time;
  alter table ad_leads drop column if exists message;

  If you already created the first ad_leads table, add the new conversion columns:

  alter table ad_leads
    add column if not exists utm_campaign_name text,
    add column if not exists utm_adset text,
    add column if not exists utm_adset_name text,
    add column if not exists utm_ad_name text,
    add column if not exists placement text,
    add column if not exists location_confirmed boolean not null default false,
    add column if not exists thank_you_token uuid default gen_random_uuid(),
    add column if not exists thank_you_viewed_at timestamptz;

  alter table ad_leads alter column thank_you_token set not null;

  The route uses SUPABASE_SERVICE_ROLE_KEY server-side, so public insert policies
  are not needed.
*/

type Attribution = Partial<Record<
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_campaign_name"
  | "utm_adset"
  | "utm_adset_name"
  | "utm_content"
  | "utm_ad_name"
  | "utm_term"
  | "placement"
  | "fbclid"
  | "landing_page"
  | "form_page"
  | "referrer",
  string
>>;

type MetaTracking = {
  fbp?: string;
  fbc?: string;
};

const maxTextLength = 500;

function cleanText(value: unknown, maxLength = maxTextLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanOptionalText(value: unknown, maxLength = maxTextLength) {
  const text = cleanText(value, maxLength);
  return text || null;
}

function cleanAttribution(value: unknown): Attribution {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;

  return {
    utm_source: cleanOptionalText(raw.utm_source) || undefined,
    utm_medium: cleanOptionalText(raw.utm_medium) || undefined,
    utm_campaign: cleanOptionalText(raw.utm_campaign) || undefined,
    utm_campaign_name: cleanOptionalText(raw.utm_campaign_name) || undefined,
    utm_adset: cleanOptionalText(raw.utm_adset) || undefined,
    utm_adset_name: cleanOptionalText(raw.utm_adset_name) || undefined,
    utm_content: cleanOptionalText(raw.utm_content) || undefined,
    utm_ad_name: cleanOptionalText(raw.utm_ad_name) || undefined,
    utm_term: cleanOptionalText(raw.utm_term) || undefined,
    placement: cleanOptionalText(raw.placement) || undefined,
    fbclid: cleanOptionalText(raw.fbclid, 1000) || undefined,
    landing_page: cleanOptionalText(raw.landing_page, 1000) || undefined,
    form_page: cleanOptionalText(raw.form_page, 1000) || undefined,
    referrer: cleanOptionalText(raw.referrer, 1000) || undefined,
  };
}

function cleanMetaTracking(value: unknown): MetaTracking {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;

  return {
    fbp: cleanOptionalText(raw.fbp, 1000) || undefined,
    fbc: cleanOptionalText(raw.fbc, 1000) || undefined,
  };
}

function hashMetaValue(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();

  return req.headers.get("x-real-ip") || undefined;
}

function buildFbc(fbclid?: string) {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getGooglePrivateKey() {
  return process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = getGooglePrivateKey();

  if (!clientEmail || !privateKey) return null;

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

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedJwt}.${signature}`,
    }),
  });
  const result = await res.json();

  if (!res.ok) {
    console.error("Google Sheets token error:", result);
    return null;
  }

  return typeof result.access_token === "string" ? result.access_token : null;
}

async function appendLeadToGoogleSheet({
  leadId,
  name,
  phone,
  email,
  learnerType,
  programInterest,
  locationConfirmed,
  attribution,
}: {
  leadId: string;
  name: string;
  phone: string;
  email: string;
  learnerType: string;
  programInterest: string;
  locationConfirmed: boolean;
  attribution: Attribution;
}) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetRange = process.env.GOOGLE_SHEETS_RANGE || "Leads!A:V";

  if (!spreadsheetId) return;

  try {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) return;

    const row = [
      new Date().toISOString(),
      leadId,
      name,
      phone,
      email,
      learnerType,
      programInterest,
      locationConfirmed ? "Oui" : "Non",
      attribution.utm_source || "",
      attribution.utm_medium || "",
      attribution.utm_campaign || "",
      attribution.utm_campaign_name || "",
      attribution.utm_adset || "",
      attribution.utm_adset_name || "",
      attribution.utm_content || "",
      attribution.utm_ad_name || "",
      attribution.utm_term || "",
      attribution.placement || "",
      attribution.fbclid || "",
      attribution.landing_page || "",
      attribution.form_page || "",
      attribution.referrer || "",
    ];
    const encodedRange = encodeURIComponent(sheetRange);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      },
    );
    const result = await res.json();

    if (!res.ok) {
      console.error("Google Sheets append error:", result);
      return;
    }

    console.info("Google Sheets lead appended:", result.updates?.updatedRange);
  } catch (error) {
    console.error("Google Sheets append failed:", error);
  }
}

async function sendMetaLeadEvent({
  req,
  leadId,
  name,
  phone,
  email,
  learnerType,
  programInterest,
  attribution,
  metaTracking,
}: {
  req: NextRequest;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  learnerType: string;
  programInterest: string;
  attribution: Attribution;
  metaTracking: MetaTracking;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return;

  const firstName = name.split(/\s+/)[0] || "";
  const lastName = name.split(/\s+/).slice(1).join(" ");
  const userAgent = req.headers.get("user-agent") || undefined;
  const eventSourceUrl = attribution.form_page || attribution.landing_page || req.nextUrl.origin;
  const fbp = metaTracking.fbp || req.cookies.get("_fbp")?.value;
  const fbc = metaTracking.fbc || req.cookies.get("_fbc")?.value || buildFbc(attribution.fbclid);
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: leadId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          em: [hashMetaValue(email)],
          ph: phone ? [hashMetaValue(normalizePhone(phone))] : undefined,
          fn: firstName ? [hashMetaValue(firstName)] : undefined,
          ln: lastName ? [hashMetaValue(lastName)] : undefined,
          client_ip_address: getClientIp(req),
          client_user_agent: userAgent,
          fbp,
          fbc,
        },
        custom_data: {
          content_name: programInterest,
          content_category: learnerType,
          lead_source: attribution.utm_source || "website",
          campaign_id: attribution.utm_campaign,
          campaign_name: attribution.utm_campaign_name,
          adset_id: attribution.utm_adset,
          adset_name: attribution.utm_adset_name,
          ad_id: attribution.utm_content,
          ad_name: attribution.utm_ad_name,
          placement: attribution.placement,
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        access_token: accessToken,
      }),
    });
    const result = await res.json();

    if (!res.ok) {
      console.error("Meta CAPI Lead error:", result);
      return;
    }

    console.info("Meta CAPI Lead sent:", result);
  } catch (error) {
    console.error("Meta CAPI Lead request failed:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const body = await req.json();
    const name = cleanText(body.name);
    const phone = cleanText(body.phone);
    const email = cleanText(body.email).toLowerCase();
    const learnerType = cleanText(body.learnerType);
    const programInterest = cleanText(body.programInterest);
    const locationConfirmed = body.locationConfirmed === true;
    const website = cleanText(body.website);
    const attribution = cleanAttribution(body.attribution);
    const metaTracking = cleanMetaTracking(body.metaTracking);

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!name || !phone || !email || !learnerType || !programInterest || !locationConfirmed) {
      return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const thankYouToken = crypto.randomUUID();
    const { data, error } = await supabase.from("ad_leads").insert([{
      name,
      phone,
      email,
      learner_type: learnerType,
      program_interest: programInterest,
      location_confirmed: locationConfirmed,
      utm_source: attribution.utm_source || null,
      utm_medium: attribution.utm_medium || null,
      utm_campaign: attribution.utm_campaign || null,
      utm_campaign_name: attribution.utm_campaign_name || null,
      utm_adset: attribution.utm_adset || null,
      utm_adset_name: attribution.utm_adset_name || null,
      utm_content: attribution.utm_content || null,
      utm_ad_name: attribution.utm_ad_name || null,
      utm_term: attribution.utm_term || null,
      placement: attribution.placement || null,
      fbclid: attribution.fbclid || null,
      landing_page: attribution.landing_page || null,
      form_page: attribution.form_page || null,
      referrer: attribution.referrer || null,
      attribution,
      thank_you_token: thankYouToken,
    }]).select("id, thank_you_token").single();

    if (error) {
      console.error("Ad lead insert error:", error);
      return NextResponse.json({ error: "Failed to send request. Please try again." }, { status: 500 });
    }

    await sendMetaLeadEvent({
      req,
      leadId: data.id,
      name,
      phone,
      email,
      learnerType,
      programInterest,
      attribution,
      metaTracking,
    });

    await appendLeadToGoogleSheet({
      leadId: data.id,
      name,
      phone,
      email,
      learnerType,
      programInterest,
      locationConfirmed,
      attribution,
    });

    return NextResponse.json({
      success: true,
      leadId: data.id,
      thankYouToken: data.thank_you_token,
    });
  } catch (err) {
    console.error("API Error /ad-leads:", err);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
