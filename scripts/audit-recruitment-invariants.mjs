import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20260924120000_job_applications.sql", import.meta.url), "utf8");
const delivery = await readFile(new URL("../src/lib/job-applications/delivery.ts", import.meta.url), "utf8");
const tracker = await readFile(new URL("../src/components/analytics/RecruitmentThankYouTracker.tsx", import.meta.url), "utf8");
const applicationRoute = await readFile(new URL("../src/app/api/job-applications/route.ts", import.meta.url), "utf8");

function cleanupCandidates(uploads, referencedPaths) {
  return uploads.filter((upload) => !upload.finalized && !referencedPaths.has(upload.path));
}

function consumeThankYou(application) {
  if (application.viewedAt) return null;
  application.viewedAt = new Date().toISOString();
  return application.eventId;
}

function claimChannel(channel, now, claimId) {
  const stale = channel.status === "PROCESSING" && now - channel.lastAttempt >= 10 * 60_000;
  const eligible = channel.attempts < 8 && (channel.status === "PENDING" || channel.status === "FAILED" || stale);
  if (!eligible) return false;
  channel.status = "PROCESSING";
  channel.claimId = claimId;
  channel.lastAttempt = now;
  channel.attempts += 1;
  return true;
}

function writeSheet(sheet, row) {
  const existing = sheet.find((item) => item.applicationId === row.applicationId);
  if (existing) {
    const manual = { scenario: existing.scenario, final: existing.final, status: existing.status, notes: existing.notes };
    Object.assign(existing, row, manual);
    return "updated";
  }
  sheet.push(row);
  return "appended";
}

// Accepted CV survives even when its upload record was intentionally left pending.
const cvPath = "submission/application.pdf";
assert.deepEqual(cleanupCandidates([{ path: cvPath, finalized: false }], new Set([cvPath])), []);
assert.match(migration, /for update;[\s\S]*update public\.job_application_uploads[\s\S]*set finalized_at = now\(\)/);
assert.match(migration, /not exists \([\s\S]*a\.cv_storage_path = u\.storage_path/);
assert.match(migration, /claim_unreferenced_job_application_upload[\s\S]*a\.cv_storage_path = p_storage_path/);
assert.match(applicationRoute, /claim_unreferenced_job_application_upload/);

// Thank-you authorization is atomically consumable once and the browser removes the token URL.
const application = { eventId: "stable-event-id", viewedAt: null };
assert.equal(consumeThankYou(application), "stable-event-id");
assert.equal(consumeThankYou(application), null);
assert.match(migration, /thank_you_viewed_at is null[\s\S]*returning meta_event_id/);
assert.match(tracker, /history\.replaceState\(null, "", "\/merci-candidature"\)/);

// Meta and Sheet leases are independent; a non-stale channel cannot be claimed twice.
const now = Date.now();
const meta = { status: "PROCESSING", attempts: 1, lastAttempt: now, claimId: "meta-owner" };
const sheet = { status: "PENDING", attempts: 0, lastAttempt: 0, claimId: null };
assert.equal(claimChannel(meta, now, "second-meta-owner"), false);
assert.equal(claimChannel(sheet, now, "sheet-owner"), true);
assert.equal(meta.claimId, "meta-owner");
assert.equal(sheet.claimId, "sheet-owner");
assert.equal(claimChannel(meta, now + 10 * 60_000, "reclaimed-meta-owner"), true);
assert.match(delivery, /claim_job_application_meta_deliveries/);
assert.match(delivery, /claim_job_application_sheet_deliveries/);
assert.match(delivery, /eq\("meta_delivery_claim_id", claimId\)/);
assert.match(delivery, /eq\("sheet_sync_claim_id", claimId\)/);

// An uncertain first Sheet append is found by UUID on retry and manual columns survive the update.
const rows = [];
const original = { applicationId: "application-uuid", candidate: "Candidate", scenario: 12, final: 72, status: "SHORTLISTED", notes: "Call Friday" };
assert.equal(writeSheet(rows, original), "appended");
assert.equal(writeSheet(rows, { applicationId: "application-uuid", candidate: "Candidate Updated", scenario: "", final: "", status: "TO_REVIEW", notes: "" }), "updated");
assert.equal(rows.length, 1);
assert.deepEqual(
  { scenario: rows[0].scenario, final: rows[0].final, status: rows[0].status, notes: rows[0].notes },
  { scenario: 12, final: 72, status: "SHORTLISTED", notes: "Call Friday" },
);
assert.match(delivery, /AC:AC/);
assert.match(delivery, /A\$\{sheetRowNumber\}:Q/);
assert.match(delivery, /U\$\{sheetRowNumber\}:U/);
assert.match(delivery, /W\$\{sheetRowNumber\}:AC/);

console.log("Recruitment invariant simulations passed.");
