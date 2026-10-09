// Browser-only helpers: ad attribution (persisted from the first ad click) and Meta cookies.
const attributionKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_campaign_name", "utm_adset",
  "utm_adset_name", "utm_content", "utm_ad_name", "utm_term", "placement", "fbclid",
] as const;
const storageKey = "english_hills_teacher_attribution";

function readCookie(name: string) {
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}

export function readAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fresh: Record<string, string> = {};
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) fresh[key] = value.slice(0, 500);
  }

  let saved: Record<string, string> = {};
  try { saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}"); } catch { saved = {}; }
  const hasFresh = Object.keys(fresh).length > 0;
  const attribution: Record<string, string> = {
    ...saved,
    ...fresh,
    landing_page: hasFresh ? window.location.href : saved.landing_page || window.location.href,
    form_page: window.location.href,
    referrer: saved.referrer || document.referrer || "",
  };
  if (hasFresh) {
    try { window.localStorage.setItem(storageKey, JSON.stringify(attribution)); } catch { /* Optional persistence. */ }
  }
  return attribution;
}

export function readMetaTracking(attribution: Record<string, string>) {
  const fbp = readCookie("_fbp");
  const fbcCookie = readCookie("_fbc");
  const fbclid = attribution.fbclid;
  return { fbp, fbc: fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined) };
}
