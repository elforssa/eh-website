export type AnswerValue = string | number | boolean | string[];
export type SanitizedAnswers = Record<string, AnswerValue>;

export const answerLimits = {
  count: 30,
  keyLength: 64,
  stringLength: 1000,
  arrayLength: 10,
  arrayItemLength: 200,
} as const;

const keyPattern = /^[a-z][a-z0-9_]{0,63}$/;
const reservedKeys = new Set([
  "id", "site_key", "form_key", "request_key", "consent", "website", "honeypot",
  "fbclid", "fbc", "fbp", "gclid", "landing_page", "referrer",
  "campaign_id", "ad_id", "adset_id", "meta_lead_id", "lead_id",
  "turnstile_token", "turnstiletoken", "cf_turnstile_response",
  "payload", "raw_payload", "headers", "cookies", "user_agent", "ip_address",
  "client_ip", "client_user_agent", "source", "lead_source", "traffic_source",
  "page_url", "form_url", "event_id", "external_id", "submitted_at",
  "constructor", "prototype",
]);
const reservedPrefixes = ["utm_", "meta_", "crm_", "internal_", "raw_", "browser_", "tracking_", "campaign_", "ad_", "adset_", "turnstile", "honeypot"];

export function isSafeAnswerKey(key: string) {
  return key.length <= answerLimits.keyLength && keyPattern.test(key)
    && !reservedKeys.has(key) && !reservedPrefixes.some((prefix) => key.startsWith(prefix))
    && !key.endsWith("_id") && !key.endsWith("_token");
}

// Reject the submission when a key/value is unsafe. Silently dropping a question
// would make an accepted inquiry appear complete while losing the visitor's answer.
export function sanitizeAnswers(raw: unknown): SanitizedAnswers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const entries = Object.entries(raw);
  if (entries.length > answerLimits.count) return null;
  const answers: SanitizedAnswers = {};
  for (const [key, value] of entries) {
    if (!isSafeAnswerKey(key)) return null;
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (cleaned.length > (key === "message" ? 4000 : answerLimits.stringLength)) return null;
      answers[key] = cleaned;
    } else if (typeof value === "number") {
      if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000) return null;
      answers[key] = value;
    } else if (typeof value === "boolean") {
      answers[key] = value;
    } else if (Array.isArray(value)) {
      if (value.length > answerLimits.arrayLength || value.some((item) => typeof item !== "string" || item.trim().length > answerLimits.arrayItemLength)) return null;
      answers[key] = value.map((item: string) => item.trim());
    } else {
      return null;
    }
  }
  return answers;
}
