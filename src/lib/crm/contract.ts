import { safePageUrl, type Attribution } from "./attribution";
import type { FormKey } from "./client";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const keys = new Set<FormKey>(["contact", "summer_camp", "online_english", "mise_a_niveau"]);
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
  if (!keys.has(formKey) || !uuid.test(field(body.request_key)) || body.consent !== true) return { ok: false, status: 400 };
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
  if (formKey === "contact") {
    if (!emailValid || !field(rawAnswers.program, 120) || !field(rawAnswers.message, 4000)) return { ok: false, status: 400 };
    answers = { program: field(rawAnswers.program, 120), message: field(rawAnswers.message, 4000) };
  } else if (formKey === "summer_camp") {
    const children = count(rawAnswers.children_count);
    if (!phoneValid || !emailValid || !children || rawAnswers.location_confirmed !== true) return { ok: false, status: 400 };
    answers = { children_count: children, location_confirmed: true, program_interest: "Camp d'été" };
  } else if (formKey === "online_english") {
    if (!phoneValid || !emailValid) return { ok: false, status: 400 };
    const fields = ["learner_type", "program_interest", "objective", "current_level", "availability"] as const;
    if (fields.some((key) => !field(rawAnswers[key], 200))) return { ok: false, status: 400 };
    answers = Object.fromEntries(fields.map((key) => [key, field(rawAnswers[key], 200)]));
  } else {
    const children = count(rawAnswers.children_count);
    if (!phoneValid || !children || !field(rawAnswers.child_ages, 200) || rawAnswers.location_confirmed !== true) return { ok: false, status: 400 };
    answers = { children_count: children, child_ages: field(rawAnswers.child_ages, 200), location_confirmed: true, program_interest: "Cours de mise à niveau" };
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
