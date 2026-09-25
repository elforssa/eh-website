import { safePageUrl, type Attribution } from "./attribution";
import type { FormKey } from "./client";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const keys = new Set<FormKey>(["general_contact_v1", "campaign_parent_lead_v1", "campaign_adult_lead_v1"]);
const attrKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "fbc", "fbp"] as const;

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function field(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function count(value: unknown): number | null {
  const result = Number(value);
  return Number.isInteger(result) && result >= 1 && result <= 10 ? result : null;
}

export type InquiryPayload = {
  site_key: string;
  form_key: FormKey;
  request_key: string;
  contact: { name?: string; phone?: string; email?: string };
  answers: Record<string, string | number | boolean>;
  attribution?: Attribution;
  consent: true;
};

export function prepareInquiry(raw: unknown, siteKey: string):
  | { ok: true; value: InquiryPayload; honeypot: boolean }
  | { ok: false; status: number } {
  const body = object(raw);
  const formKey = field(body.form_key) as FormKey;
  if (!keys.has(formKey) || (body.destination !== undefined && body.destination !== "crm") || !uuid.test(field(body.request_key)) || body.consent !== true) return { ok: false, status: 400 };
  if (field(body.website, 200)) return { ok: true, honeypot: true, value: {
    site_key: siteKey, form_key: formKey, request_key: field(body.request_key), contact: {}, answers: {}, consent: true,
  } };

  const inputContact = object(body.contact);
  const name = field(inputContact.name, 120);
  const phone = field(inputContact.phone, 30);
  const address = field(inputContact.email, 254).toLowerCase();
  const phoneValid = phone.replace(/\D/g, "").length >= 9 && phone.replace(/\D/g, "").length <= 15;
  const emailValid = email.test(address);
  if (!name || (phone && !phoneValid) || (address && !emailValid) || (!phoneValid && !emailValid)) return { ok: false, status: 400 };
  const contact = { name, ...(phone ? { phone } : {}), ...(address ? { email: address } : {}) };
  const rawAnswers = object(body.answers);
  let answers: InquiryPayload["answers"];
  if (formKey === "general_contact_v1") {
    const message = field(rawAnswers.message, 4000);
    if (!message) return { ok: false, status: 400 };
    answers = { ...(field(rawAnswers.program_interest, 120) ? { program_interest: field(rawAnswers.program_interest, 120) } : {}), message };
  } else {
    const programInterest = field(rawAnswers.program_interest, 120);
    if (!programInterest || (formKey === "campaign_parent_lead_v1" && !phoneValid)) return { ok: false, status: 400 };
    answers = { program_interest: programInterest };
    const allowed = formKey === "campaign_parent_lead_v1"
      ? ["learner_name", "learner_ages", "objective", "current_level", "availability"]
      : ["learner_type", "objective", "current_level", "availability"];
    for (const key of allowed) {
      const value = field(rawAnswers[key], 200);
      if (value) answers[key] = value;
    }
    if (formKey === "campaign_parent_lead_v1") {
      if (rawAnswers.learner_age !== undefined) {
        const age = Number(rawAnswers.learner_age);
        if (!Number.isInteger(age) || age < 1 || age > 120) return { ok: false, status: 400 };
        answers.learner_age = age;
      }
      if (rawAnswers.children_count !== undefined) {
        const children = count(rawAnswers.children_count);
        if (!children) return { ok: false, status: 400 };
        answers.children_count = children;
      }
      if (rawAnswers.location_confirmed !== undefined) {
        if (typeof rawAnswers.location_confirmed !== "boolean") return { ok: false, status: 400 };
        answers.location_confirmed = rawAnswers.location_confirmed;
      }
    }
  }

  const rawAttr = object(body.attribution);
  const attribution: Attribution = {};
  for (const key of attrKeys) {
    const value = field(rawAttr[key], key === "fbclid" || key === "fbc" || key === "fbp" ? 1000 : 500);
    if (value) attribution[key] = value;
  }
  const landing = safePageUrl(field(rawAttr.landing_page, 1500));
  const referrer = safePageUrl(field(rawAttr.referrer, 1500));
  if (landing && ["english-hills.com", "www.english-hills.com"].includes(new URL(landing).hostname)) attribution.landing_page = landing;
  if (referrer) attribution.referrer = referrer;

  return { ok: true, honeypot: false, value: {
    site_key: siteKey, form_key: formKey, request_key: field(body.request_key), contact, answers,
    ...(Object.keys(attribution).length ? { attribution } : {}), consent: true,
  } };
}
