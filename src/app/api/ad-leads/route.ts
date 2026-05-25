import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
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
