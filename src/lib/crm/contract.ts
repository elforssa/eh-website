import { safePageUrl, type Attribution } from "./attribution";
import type { FormKey } from "./client";
import { sanitizeAnswers, type AnswerValue } from "./answer-sanitizer";

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
  if (typeof value !== "string" && typeof value !== "number") return null;
  const result = Number(value);
  return Number.isInteger(result) && result >= 1 && result <= 10 ? result : null;
}

export type InquiryPayload = {
  site_key: string;
  form_key: FormKey;
  request_key: string;
  contact: { name?: string; phone?: string; email?: string };
  answers: Record<string, AnswerValue>;
  attribution?: Attribution;
  consent: true;
  turnstileToken?: string;
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
  const answers = sanitizeAnswers(body.answers);
  if (!answers) return { ok: false, status: 400 };
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken || body.turnstileToken.length > 2048) return { ok: false, status: 400 };
  for (const key of ["learner_name", "objective", "current_level", "availability", "learner_type"] as const) {
    const value = answers[key];
    if (value !== undefined && (typeof value !== "string" || value.length > 200)) return { ok: false, status: 400 };
  }
  if (answers.learner_ages !== undefined && !(typeof answers.learner_ages === "string" && answers.learner_ages.length <= 200) && !Array.isArray(answers.learner_ages)) return { ok: false, status: 400 };
  if (answers.message !== undefined && typeof answers.message !== "string") return { ok: false, status: 400 };
  if (answers.learner_age !== undefined) {
    if (typeof answers.learner_age !== "string" && typeof answers.learner_age !== "number") return { ok: false, status: 400 };
    const age = Number(answers.learner_age);
    if (!Number.isInteger(age) || age < 1 || age > 120) return { ok: false, status: 400 };
    answers.learner_age = age;
  }
  if (answers.children_count !== undefined) {
    const children = count(answers.children_count);
    if (!children) return { ok: false, status: 400 };
    answers.children_count = children;
  }
  if (answers.location_confirmed !== undefined && typeof answers.location_confirmed !== "boolean") return { ok: false, status: 400 };
  if (formKey === "general_contact_v1") {
    if (typeof answers.message !== "string" || !answers.message) return { ok: false, status: 400 };
    if (answers.program_interest !== undefined && (typeof answers.program_interest !== "string" || answers.program_interest.length > 120)) return { ok: false, status: 400 };
  } else {
    if (typeof answers.program_interest !== "string" || !answers.program_interest || answers.program_interest.length > 120
      || (formKey === "campaign_parent_lead_v1" && !phoneValid)) return { ok: false, status: 400 };
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
    turnstileToken: body.turnstileToken,
    ...(Object.keys(attribution).length ? { attribution } : {}), consent: true,
  } };
}
