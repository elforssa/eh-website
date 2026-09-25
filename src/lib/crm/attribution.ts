export const attributionKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "fbc", "fbp", "landing_page", "referrer",
] as const;

export type Attribution = Partial<Record<(typeof attributionKeys)[number], string>>;

const storageKey = "english_hills_crm_attribution_v1";
const legacyStorageKey = "english_hills_ad_attribution";
const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
const campaignKeys = attributionKeys.slice(0, 6);
const knownPages = new Set(["/", "/contact", "/anglais-casablanca", "/anglais-en-ligne", "/mise-a-niveau"]);

export function safePageUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    // Query strings and arbitrary path segments can contain personal data.
    const path = ["english-hills.com", "www.english-hills.com"].includes(url.hostname) && knownPages.has(url.pathname)
      ? url.pathname : "/";
    return `${url.origin}${path}`.slice(0, 1000);
  } catch {
    return undefined;
  }
}

function readCookie(name: string): string | undefined {
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.slice(name.length + 1) || undefined;
}

export function readAttribution(now = Date.now()): Attribution {
  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = {};
  for (const key of campaignKeys) {
    const value = params.get(key);
    if (value && !/[^\s@]+@[^\s@]+|(?:\+?\d[\s().-]*){9,}/.test(value)) fresh[key] = value.slice(0, 500);
  }

  let stored: { at: number; values: Attribution } | undefined;
  try {
    stored = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    window.localStorage.removeItem(legacyStorageKey);
  } catch { /* Storage is optional. */ }
  const current = stored && Number.isFinite(stored.at) && now - stored.at < maxAgeMs && now >= stored.at
    ? stored.values : {};
  const freshCampaign = Object.keys(fresh).length > 0;
  const values: Attribution = freshCampaign ? fresh : { ...current };
  values.landing_page = freshCampaign
    ? safePageUrl(window.location.href)
    : safePageUrl(values.landing_page) || safePageUrl(window.location.href);
  values.referrer = freshCampaign
    ? safePageUrl(document.referrer)
    : safePageUrl(values.referrer) || safePageUrl(document.referrer);
  const fbc = readCookie("_fbc");
  const fbp = readCookie("_fbp");
  if (fbc) values.fbc = fbc.slice(0, 1000); else delete values.fbc;
  if (fbp) values.fbp = fbp.slice(0, 1000); else delete values.fbp;

  // Store campaign identifiers only. No full URLs, referrers, cookies, or form PII.
  if (freshCampaign) {
    try { window.localStorage.setItem(storageKey, JSON.stringify({ at: now, values: {
      ...fresh, landing_page: values.landing_page, referrer: values.referrer,
    } })); } catch { /* Optional. */ }
  } else if (stored && !Object.keys(current).length) {
    try { window.localStorage.removeItem(storageKey); } catch { /* Optional. */ }
  }
  return Object.fromEntries(Object.entries(values).filter(([, value]) => Boolean(value))) as Attribution;
}
