import assert from "node:assert/strict";
import { sanitizeAnswers, isSafeAnswerKey } from "../src/lib/crm/answer-sanitizer.ts";
import { legacyMetaCapiEnabled, runLegacyMetaCompatibility } from "../src/lib/crm/meta-switch.ts";

assert.deepEqual(sanitizeAnswers({ school_type: " Public ", biggest_difficulty: "Speaking", previous_english_classes: true, learning_goals: [" Reading ", "Speaking"] }), {
  school_type: "Public", biggest_difficulty: "Speaking", previous_english_classes: true, learning_goals: ["Reading", "Speaking"],
});
for (const key of ["utm_source", "fbclid", "fbc", "fbp", "landing_page", "referrer", "campaign_id", "ad_id", "adset_id", "meta_lead_id", "site_key", "form_key", "request_key", "consent", "honeypot", "turnstileToken", "crm_contact_id", "raw_payload", "browser_metadata", "customer_id"]) {
  assert.equal(isSafeAnswerKey(key), false, key);
  assert.equal(sanitizeAnswers({ program_interest: "English", [key]: "unsafe" }), null, key);
}
assert.equal(sanitizeAnswers({ ["x".repeat(65)]: "value" }), null);
for (const key of ["message", "biggest_difficulty"]) {
  assert.equal(sanitizeAnswers({ [key]: "x".repeat(2000) })?.[key], "x".repeat(2000), key);
  assert.equal(sanitizeAnswers({ [key]: "x".repeat(2001) }), null, key);
}
assert.equal(sanitizeAnswers({ learning_goals: Array(11).fill("goal") }), null);
assert.equal(sanitizeAnswers(Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`question_${i}`, "value"]))), null);
assert.equal(sanitizeAnswers({ nested: { unsafe: true } }), null);

let deliveries = 0;
let reported = 0;
const delivery = async () => { deliveries++; };
const report = () => { reported++; };
assert.equal(legacyMetaCapiEnabled(undefined), false);
assert.equal(legacyMetaCapiEnabled("false"), false);
assert.equal(legacyMetaCapiEnabled("true"), true);
assert.equal(legacyMetaCapiEnabled("true", "preview"), false);
await runLegacyMetaCompatibility(undefined, delivery, report);
await runLegacyMetaCompatibility("false", delivery, report);
await runLegacyMetaCompatibility("true", delivery, report, "preview");
assert.equal(deliveries, 0);
await runLegacyMetaCompatibility("true", delivery, report);
assert.equal(deliveries, 1);
await runLegacyMetaCompatibility("true", async () => { deliveries++; throw Error("mock Meta failure"); }, report);
assert.equal(deliveries, 2);
assert.equal(reported, 1);
await runLegacyMetaCompatibility("true", async () => { throw Error("mock Meta failure"); }, () => { throw Error("mock logger failure"); });
console.log("CRM flexible answers and Meta switch: passed");
