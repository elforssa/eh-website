import assert from "node:assert/strict";
import { prepareSubmission } from "../src/lib/crm/prepared.ts";
import { readAttribution } from "../src/lib/crm/attribution.ts";
import { runBestEffort } from "../src/lib/crm/best-effort.ts";

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

const draft = { form_key: "contact", contact: { name: "Private Parent", email: "parent@example.test" }, answers: { message: "A question", program: "General" }, consent: true, website: "" };
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
assert.ok(!JSON.stringify([...memory]).includes("Private Parent"));
let reported = false;
await runBestEffort(async () => { throw new Error("mock compatibility failure"); }, () => { reported = true; });
assert.equal(reported, true);
console.log("CRM browser attribution and submission identity: passed");
