import assert from "node:assert/strict";
import { prepareSubmission } from "../src/lib/crm/prepared.ts";
import { readAttribution, safePageUrl } from "../src/lib/crm/attribution.ts";
import { runBestEffort } from "../src/lib/crm/best-effort.ts";
import { sendPreparedInquiry, TurnstileError } from "../src/lib/crm/transport.ts";
import { CRM_TURNSTILE_ACTION } from "../src/lib/crm/turnstile-config.ts";

const memory = new Map();
memory.set("english_hills_ad_attribution", JSON.stringify({ landing_page: "https://www.english-hills.com/contact?email=private@example.com" }));
globalThis.window = {
  location: { search: "?utm_source=first&utm_campaign=campaign-a&email=private%40example.com", href: "https://www.english-hills.com/anglais-casablanca?email=private%40example.com" },
  localStorage: {
    getItem: (key) => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  },
};
globalThis.document = { cookie: "_fbp=fb.1.123", referrer: "https://example.org/path?phone=1234567890" };
const day = 24 * 60 * 60 * 1000;
const first = readAttribution(40 * day);
assert.equal(first.utm_source, "first");
assert.equal(first.landing_page, "https://www.english-hills.com/anglais-casablanca");
assert.equal(first.referrer, "https://example.org/");
assert.equal(first.fbp, "fb.1.123");
assert.equal(first.fbc, undefined);
assert.ok(!JSON.stringify([...memory]).includes("private@example.com"));
assert.ok(!JSON.stringify([...memory]).includes("phone="));
assert.equal(memory.has("english_hills_ad_attribution"), false);

window.location = { search: "", href: "https://www.english-hills.com/contact" };
const carried = readAttribution(41 * day);
assert.equal(carried.utm_campaign, "campaign-a");
assert.equal(carried.landing_page, first.landing_page);
assert.equal(readAttribution(71 * day).utm_campaign, undefined);

window.location = { search: "?utm_source=second", href: "https://www.english-hills.com/contact?utm_source=second" };
const second = readAttribution(72 * day);
assert.equal(second.utm_source, "second");
assert.equal(second.utm_campaign, undefined);
assert.equal(second.landing_page, "https://www.english-hills.com/contact");
// Real Meta ad links: {{campaign.id}}, {{adset.id}}, {{ad.id}} are 18-digit IDs and must survive.
window.location = {
  search: "?utm_source=facebook&utm_medium=paid&utm_campaign=120252300675060313&utm_term=120252300676090313&utm_content=120252310156940313&fbclid=IwZXh0bgNhZW0BMABhZGlk",
  href: "https://www.english-hills.com/cours-anglais-adultes?utm_campaign=120252300675060313",
};
const meta = readAttribution(80 * day);
assert.equal(meta.utm_campaign, "120252300675060313");
assert.equal(meta.utm_term, "120252300676090313");
assert.equal(meta.utm_content, "120252310156940313");
assert.equal(meta.fbclid, "IwZXh0bgNhZW0BMABhZGlk");
assert.equal(meta.landing_page, "https://www.english-hills.com/cours-anglais-adultes");
// Phone numbers and e-mails are still dropped, including in the ID fields and in utm_source.
memory.clear(); // no stored campaign to carry over
window.location = {
  search: "?utm_source=212612345678&utm_campaign=%2B212%20612%20345%20678&utm_term=0612345678&utm_content=someone%40example.com",
  href: "https://www.english-hills.com/cours-anglais-adultes",
};
const personal = readAttribution(81 * day);
assert.equal(personal.utm_source, undefined);
assert.equal(personal.utm_campaign, undefined);
assert.equal(personal.utm_term, undefined);
assert.equal(personal.utm_content, undefined);
// A 15-digit value (longest possible phone number) is not treated as a Meta ID.
memory.clear();
window.location = { search: "?utm_campaign=212612345678901", href: "https://www.english-hills.com/cours-anglais-adultes" };
assert.equal(readAttribution(82 * day).utm_campaign, undefined);
assert.equal(safePageUrl("https://www.english-hills.com/anglais-enfants?email=private@example.com"), "https://www.english-hills.com/anglais-enfants");
assert.equal(safePageUrl("https://www.english-hills.com/212600000000?x=1"), "https://www.english-hills.com/");

const draft = { form_key: "general_contact_v1", contact: { name: "Private Parent", email: "parent@example.test" }, answers: { message: "A question", program_interest: "General" }, consent: true, website: "" };
let sequence = 0;
const uuid = () => `request-${++sequence}`;
const prepared = prepareSubmission(null, draft, second, uuid);
const retry = prepareSubmission(prepared, draft, { utm_source: "changed-during-retry" }, uuid);
assert.equal(retry, prepared);
assert.equal(retry.payload.request_key, "request-1");
assert.equal(retry.payload.attribution.utm_source, "second");
const changed = prepareSubmission(prepared, { ...draft, answers: { ...draft.answers, message: "Changed" } }, second, uuid);
assert.equal(changed.payload.request_key, "request-2");
assert.equal(sequence, 2);
assert.equal(CRM_TURNSTILE_ACTION, "crm_inquiry");
const sent = [];
let tokenCount = 0;
const challenge = async () => `fresh-token-${++tokenCount}`;
const post = async (_url, options) => {
  sent.push(JSON.parse(options.body));
  return { ok: sent.length > 1, status: sent.length > 1 ? 200 : 503 };
};
await assert.rejects(() => sendPreparedInquiry(prepared, async () => "", post), TurnstileError);
assert.equal(sent.length, 0);
await sendPreparedInquiry(prepared, challenge, post);
assert.equal(sent.length, 1); // A failed request does not automatically replay a consumed token.
await sendPreparedInquiry(retry, challenge, post);
assert.equal(sent.length, 2);
assert.equal(sent[0].request_key, sent[1].request_key);
assert.deepEqual(sent[0].answers, sent[1].answers);
assert.notEqual(sent[0].turnstileToken, sent[1].turnstileToken);
assert.equal(prepared.payload.turnstileToken, undefined);
assert.ok(!JSON.stringify([...memory]).includes("Private Parent"));
let reported = false;
await runBestEffort(async () => { throw new Error("mock compatibility failure"); }, () => { reported = true; });
assert.equal(reported, true);
console.log("CRM browser attribution and submission identity: passed");
