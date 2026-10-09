import assert from "node:assert/strict";
import * as options from "../src/lib/teacher-applications/options.ts";
import { ALLOWED_VALUES, scoreTeacherApplication, validateTeacherApplication } from "../src/lib/teacher-applications/rules.ts";
import { checkVideoAccessible, parseVideoLink } from "../src/lib/teacher-applications/video.ts";
import { makeReceipt, verifyReceipt } from "../src/lib/teacher-applications/receipt.ts";
import { buildTeacherSheetRow, sheetText, TEACHER_SHEET_COLUMN_COUNT } from "../src/lib/teacher-applications/sheet-row.ts";

const key = "11111111-1111-4111-8111-111111111111";
const base = {
  submissionKey: key, formToken: "token", website: "",
  fullName: "Test Teacher", phone: "0612345678", email: "Teacher@Example.com", area: "Oulfa",
  canCommuteAlmaz: true, acceptsRate: true,
  weeklyHours: "SIX_TO_TWELVE", startAvailability: "IMMEDIATELY", yearsTeaching: "THREE_TO_FIVE",
  hasCelta: true, otherQualifications: "", englishLevel: "C1", ageGroups: ["KIDS", "TEENS"],
  teachingSettings: ["LANGUAGE_CENTER"], communicativeExperience: "YES_REGULARLY",
  lastTeachingJob: "ABC Language School, 4 years", teachingScenario: "x".repeat(60),
  videoUrl: "https://drive.google.com/file/d/abcdefghij12345/view?usp=sharing", privacyConsent: true,
  attribution: { utm_campaign_name: "{{campaign.name}}", utm_campaign: "123", utm_ad_name: "Ad 1" },
  metaTracking: { fbp: "fb.1.2.3" },
  cvStoragePath: `teachers/${key}/22222222-2222-4222-8222-222222222222.pdf`, cvOriginalName: "cv.pdf", cvSizeBytes: 1000,
};

// Validation
let result = validateTeacherApplication(base);
assert.ok(result.ok);
assert.equal(result.value.email, "teacher@example.com");
assert.equal(validateTeacherApplication({ ...base, website: "bot" }).ok, false);
assert.equal(validateTeacherApplication({ ...base, hasCelta: null }).ok, false);
assert.equal(validateTeacherApplication({ ...base, teachingScenario: "short" }).ok, false);
assert.equal(validateTeacherApplication({ ...base, videoUrl: "" }).ok, false);
assert.equal(validateTeacherApplication({ ...base, privacyConsent: false }).ok, false);
assert.equal(validateTeacherApplication({ ...base, cvStoragePath: "teachers/other/x.pdf" }).ok, false);
assert.equal(validateTeacherApplication({ ...base, cvSizeBytes: 6 * 1024 * 1024 }).ok, false);

// Scoring and knockouts
const app = result.value;
const good = scoreTeacherApplication(app);
assert.equal(good.applicationStatus, "TO_REVIEW");
assert.deepEqual(good.knockoutReasons, []);
assert.ok(good.automaticScore > 0 && good.automaticScore <= 80);
const rejected = scoreTeacherApplication({ ...app, canCommuteAlmaz: false, acceptsRate: false, yearsTeaching: "ONE_TO_THREE", hasCelta: false, englishLevel: "B2_OR_BELOW" });
assert.equal(rejected.applicationStatus, "AUTO_REJECTED");
assert.deepEqual(rejected.knockoutReasons, ["CANNOT_COMMUTE", "RATE_DECLINED", "UNDER_THREE_YEARS", "NO_CELTA", "ENGLISH_BELOW_C1"]);
const maxed = scoreTeacherApplication({ ...app, yearsTeaching: "OVER_FIVE", englishLevel: "C2", communicativeExperience: "YES_REGULARLY", ageGroups: ["KIDS", "TEENS", "ADULTS"], teachingSettings: ["LANGUAGE_CENTER", "SCHOOL"], weeklyHours: "OVER_TWENTY" });
assert.equal(maxed.automaticScore, 80);

// Options and rules agree
for (const [list, allowed] of [
  [options.WEEKLY_HOURS, ALLOWED_VALUES.weeklyHours],
  [options.START_AVAILABILITY, ALLOWED_VALUES.startAvailability], [options.YEARS_TEACHING, ALLOWED_VALUES.yearsTeaching],
  [options.ENGLISH_LEVELS, ALLOWED_VALUES.englishLevel], [options.AGE_GROUPS, ALLOWED_VALUES.ageGroups],
  [options.TEACHING_SETTINGS, ALLOWED_VALUES.teachingSettings], [options.COMMUNICATIVE_EXPERIENCE, ALLOWED_VALUES.communicativeExperience],
]) assert.deepEqual(list.map((o) => o.value), [...allowed]);

// Video links
assert.equal(parseVideoLink("https://drive.google.com/file/d/abcdefghij12345/view?usp=sharing").url, "https://drive.google.com/file/d/abcdefghij12345/view");
assert.equal(parseVideoLink("https://drive.google.com/open?id=abcdefghij12345").provider, "GOOGLE_DRIVE");
assert.equal(parseVideoLink("https://drive.google.com/drive/folders/abcdefghij12345"), null);
assert.equal(parseVideoLink("http://drive.google.com/file/d/abcdefghij12345/view"), null);
assert.equal(parseVideoLink("https://evil.com/file/d/abcdefghij12345/view"), null);
assert.equal(parseVideoLink("https://user:pw@drive.google.com/file/d/abcdefghij12345/view"), null);
assert.equal(parseVideoLink("https://youtu.be/dQw4w9WgXcQ").url, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
assert.equal(parseVideoLink("https://www.youtube.com/shorts/dQw4w9WgXcQ").provider, "YOUTUBE");
assert.equal(parseVideoLink("https://www.loom.com/share/0123456789abcdef0123456789abcdef").provider, "LOOM");
assert.equal(parseVideoLink("https://vimeo.com/123456789").url, "https://vimeo.com/123456789");
assert.equal(parseVideoLink("https://www.dropbox.com/scl/fi/abc/video.mp4?rlkey=x").provider, "DROPBOX");
assert.equal(parseVideoLink("javascript:alert(1)"), null);
assert.equal(parseVideoLink("not a url"), null);

const reply = (status, headers = {}) => async () => ({ status, headers: { get: (n) => headers[n.toLowerCase()] ?? null } });
const yt = parseVideoLink("https://youtu.be/dQw4w9WgXcQ");
const drive = parseVideoLink("https://drive.google.com/file/d/abcdefghij12345/view");
assert.equal(await checkVideoAccessible(yt, reply(200)), "PUBLIC");
assert.equal(await checkVideoAccessible(yt, reply(401)), "PRIVATE");
assert.equal(await checkVideoAccessible(yt, reply(500)), "UNKNOWN");
assert.equal(await checkVideoAccessible(drive, reply(200)), "PUBLIC");
assert.equal(await checkVideoAccessible(drive, reply(404)), "PRIVATE");
assert.equal(await checkVideoAccessible(drive, reply(302, { location: "https://accounts.google.com/ServiceLogin" })), "PRIVATE");
assert.equal(await checkVideoAccessible(drive, async () => { throw new Error("network"); }), "UNKNOWN");
assert.equal(await checkVideoAccessible(parseVideoLink("https://www.loom.com/share/0123456789abcdef0123456789abcdef"), reply(500)), "UNKNOWN");
const fetched = [];
await checkVideoAccessible(drive, async (url) => { fetched.push(url); return { status: 200, headers: { get: () => null } }; });
assert.deepEqual(fetched, ["https://drive.google.com/file/d/abcdefghij12345/view"]);

// Receipt
const secret = "s".repeat(40);
const now = 1_800_000_000_000;
const receipt = makeReceipt(key, secret, now);
assert.equal(verifyReceipt(receipt, secret, now + 5_000), key);
assert.equal(verifyReceipt(receipt, secret, now + 11 * 60_000), null);
assert.equal(verifyReceipt(receipt, "t".repeat(40), now), null);
assert.equal(verifyReceipt(receipt.slice(0, -2) + "xx", secret, now), null);
assert.equal(verifyReceipt(undefined, secret, now), null);
assert.throws(() => makeReceipt(key, "short", now));

// Sheet row
const row = buildTeacherSheetRow({
  application: { ...app, fullName: "=HYPERLINK(\"evil\")" },
  labels: { availability: "A", weeklyHours: "B", startAvailability: "C", yearsTeaching: "D", englishLevel: "E", ageGroups: "F", teachingSettings: "G", communicativeExperience: "H" },
  videoUrl: "https://drive.google.com/file/d/abcdefghij12345/view", cvSignedUrl: "https://x.test/cv?token=a\"b",
  createdAt: "2026-01-01T00:00:00.000Z", automaticScore: 50, status: "TO_REVIEW", knockoutReasons: [], attribution: app.attribution,
});
assert.equal(row.length, TEACHER_SHEET_COLUMN_COUNT);
assert.equal(row.length, 32);
assert.equal(row[0], key);
assert.equal(row[2], "'=HYPERLINK(\"evil\")");
assert.equal(row[20], '=HYPERLINK("https://x.test/cv?token=a""b","View CV")');
assert.deepEqual(row.slice(24, 28), ["", "", "", ""]);
assert.equal(row[28], "123"); // macro campaign name falls back to utm_campaign
assert.equal(row[30], "Ad 1");
assert.equal(row[31], "teacher_hiring");
assert.equal(sheetText("normal"), "normal");
assert.equal(sheetText("+212"), "'+212");

console.log("teacher application tests passed");
