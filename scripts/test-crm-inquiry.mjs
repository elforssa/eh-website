import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

const mockPort = 31387;
const sitePort = 31388;
const received = [];
let mode = "ok";
let failedOnce = false;
const mock = createServer(async (req, res) => {
  let body = "";
  for await (const part of req) body += part;
  received.push({ body: JSON.parse(body), origin: req.headers.origin });
  if (mode === "fail-once" && !failedOnce) {
    failedOnce = true;
    res.writeHead(503).end();
  } else if (mode === "invalid") res.writeHead(422).end();
  else if (mode === "rate") res.writeHead(429).end();
  else if (mode === "fail") res.writeHead(503).end();
  else if (mode === "timeout") await delay(8000).then(() => res.end()).catch(() => {});
  else res.writeHead(202, { "Content-Type": "application/json" }).end(JSON.stringify({ submission_id: "MUST_NOT_EXPOSE" }));
});
await new Promise((resolve) => mock.listen(mockPort, "127.0.0.1", resolve));

const site = spawn("./node_modules/.bin/next", ["start", "-p", String(sitePort)], {
  env: {
    ...process.env,
    CRM_INQUIRY_ENDPOINT: `http://127.0.0.1:${mockPort}/inquiry`,
    CRM_WEBSITE_SITE_KEY: "english-hills-website",
    CRM_WEBSITE_RECEIPT_SECRET: "a-local-test-secret-with-more-than-32-characters",
    CRM_LEGACY_META_CAPI_ENABLED: "false",
    META_CAPI_ACCESS_TOKEN: "",
    NEXT_PUBLIC_META_PIXEL_ID: "",
  }, stdio: ["ignore", "pipe", "pipe"],
});
let siteOutput = "";
site.stdout.on("data", (data) => { siteOutput += data; });
site.stderr.on("data", (data) => { siteOutput += data; });

const base = `http://127.0.0.1:${sitePort}`;
async function post(body, path = "/api/crm-inquiry") {
  return fetch(base + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
function draft(form_key, contact, answers) {
  return { request_key: randomUUID(), form_key, contact, answers, consent: true, website: "", attribution: {
    utm_source: "test", landing_page: "https://www.english-hills.com/contact?email=private@example.com",
    referrer: "https://example.org/path?phone=1234567890",
  } };
}

try {
  let ready = false;
  for (let n = 0; n < 80; n++) {
    if (site.exitCode !== null) throw Error(siteOutput);
    try { const response = await fetch(base + "/contact"); if (response.ok) { ready = true; break; } } catch { /* Starting. */ }
    await delay(250);
  }
  assert.ok(ready, `Next server did not start: ${siteOutput}`);

  for (const path of ["/contact", "/anglais-casablanca", "/anglais-en-ligne", "/mise-a-niveau"]) {
    const page = await fetch(base + path);
    const html = await page.text();
    assert.match(html, /J’accepte que English Hills utilise mes coordonnées/);
    assert.match(html, /Politique de confidentialité/);
    assert.ok(!html.includes('type="checkbox" checked=""'));
  }
  const apex = await new Promise((resolve, reject) => {
    const request = httpRequest({ hostname: "127.0.0.1", port: sitePort, path: "/contact?utm_source=test", headers: { Host: "english-hills.com" } }, (response) => {
      response.resume();
      resolve(response);
    });
    request.on("error", reject).end();
  });
  assert.equal(apex.statusCode, 308);
  assert.equal(apex.headers.location, "https://www.english-hills.com/contact?utm_source=test");
  const www = await new Promise((resolve, reject) => {
    const request = httpRequest({ hostname: "127.0.0.1", port: sitePort, path: "/contact", headers: { Host: "www.english-hills.com" } }, (response) => {
      response.resume();
      resolve(response);
    });
    request.on("error", reject).end();
  });
  assert.equal(www.statusCode, 200);

  const cases = [
    draft("general_contact_v1", { name: "Test Parent", email: "parent@example.test" }, { program_interest: "Formation entreprise", message: "A test question" }),
    draft("campaign_parent_lead_v1", { name: "Test Parent", phone: "+212600000000", email: "parent@example.test" }, { children_count: 2, location_confirmed: true, program_interest: "Camp d'été" }),
    draft("campaign_adult_lead_v1", { name: "Test Learner", phone: "+212600000000", email: "learner@example.test" }, { learner_type: "Pour moi", program_interest: "Cours particulier 1:1", objective: "IELTS", current_level: "Débutant", availability: "Week-end" }),
    draft("campaign_parent_lead_v1", { name: "Test Parent", phone: "+212600000000" }, { children_count: 2, learner_ages: "8 ans, 10 ans", location_confirmed: true, program_interest: "Cours de mise à niveau" }),
  ];
  cases.push(draft("campaign_parent_lead_v1", { name: "Test Parent", phone: "+212600000000" }, { program_interest: "Anglais annuel", learner_age: 9 }));
  cases[4].attribution.utm_campaign = "annual_english_september";
  cases[4].attribution.landing_page = "https://www.english-hills.com/anglais-enfants";
  cases.push(draft("campaign_parent_lead_v1", { name: "Test Parent", phone: "+212600000000" }, {
    program_interest: "Anglais annuel", learner_age: 9, school_type: "Public",
    biggest_difficulty: "Speaking", preferred_test_day: "Saturday",
  }));
  cases[5].attribution.utm_campaign = "parent_campaign_a";
  cases.push(draft("campaign_parent_lead_v1", { name: "Test Parent", phone: "+212600000000" }, {
    program_interest: "Test de niveau", learner_age: 9, previous_english_classes: "Yes",
    parent_goal: "Confidence", learning_goals: ["Speaking", "Reading"],
  }));
  cases[6].attribution.utm_campaign = "parent_campaign_b";
  cases[6].attribution.landing_page = "https://www.english-hills.com/test-anglais-gratuit";
  cases.push(draft("campaign_adult_lead_v1", { name: "Test Adult", email: "adult@example.test" }, {
    program_interest: "Online English", job_role: "Engineer", english_at_work: true,
  }));
  for (const input of cases) {
    const response = await post(input);
    assert.equal(response.status, 200, input.form_key);
    const result = await response.json();
    assert.deepEqual(result, { success: true });
    const sent = received.at(-1);
    assert.equal(sent.origin, "https://www.english-hills.com");
    assert.equal(sent.body.site_key, "english-hills-website");
    assert.equal(sent.body.form_key, input.form_key);
    assert.equal(sent.body.request_key, input.request_key);
    assert.deepEqual(sent.body.contact, input.contact);
    assert.deepEqual(sent.body.answers, input.answers);
    assert.equal(sent.body.consent, true);
    assert.equal(sent.body.attribution.landing_page, input === cases[4] ? "https://www.english-hills.com/anglais-enfants"
      : input === cases[6] ? "https://www.english-hills.com/test-anglais-gratuit" : "https://www.english-hills.com/contact");
    assert.equal(sent.body.attribution.referrer, "https://example.org/");
    if (input === cases[4]) assert.equal(sent.body.attribution.utm_campaign, "annual_english_september");
    if (input === cases[6]) {
      assert.equal(sent.body.attribution.utm_campaign, "parent_campaign_b");
      assert.equal(sent.body.form_key, cases[5].form_key);
      assert.ok(!("utm_campaign" in sent.body.answers));
    }
    assert.ok(!JSON.stringify(result).includes("MUST_NOT_EXPOSE"));
    if (input.form_key === "general_contact_v1") assert.equal(response.headers.get("set-cookie"), null);
    else assert.ok(response.headers.get("set-cookie")?.includes("eh_inquiry_receipt="));
  }

  const invalids = [
    { ...cases[0], request_key: randomUUID(), consent: false },
    { ...cases[0], request_key: randomUUID(), contact: { name: "Only a name" } },
    { ...cases[3], request_key: randomUUID(), answers: { ...cases[3].answers, children_count: 0 } },
    { ...cases[0], request_key: randomUUID(), form_key: "contact" },
    { ...cases[1], request_key: randomUUID(), form_key: "summer_camp" },
    { ...cases[2], request_key: randomUUID(), form_key: "online_english" },
    { ...cases[3], request_key: randomUUID(), form_key: "mise_a_niveau" },
    { ...cases[1], request_key: randomUUID(), destination: "recruitment" },
    { ...cases[0], request_key: randomUUID(), form_key: "recruitment" },
  ];
  for (const input of invalids) assert.equal((await post(input)).status, 400);
  const unsafeAnswers = [
    { utm_campaign: "misplaced" }, { fbclid: "misplaced" }, { crm_contact_id: "internal" },
    { campaign_id: "technical" }, { turnstileToken: "technical" }, { request_key: "technical" },
    { raw_payload: "technical" }, { ["x".repeat(65)]: "long key" },
    { school_type: "x".repeat(2001) }, { learning_goals: Array(11).fill("goal") },
    { nested: { a: 1 } },
    Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`question_${index}`, "value"])),
  ];
  for (const extra of unsafeAnswers) {
    const before = received.length;
    assert.equal((await post({ ...cases[5], request_key: randomUUID(), answers: { ...cases[5].answers, ...extra } })).status, 400);
    assert.equal(received.length, before);
  }
  for (const [source, key] of [[cases[0], "message"], [cases[5], "biggest_difficulty"]]) {
    const acceptedInput = { ...source, request_key: randomUUID(), answers: { ...source.answers, [key]: "x".repeat(2000) } };
    assert.equal((await post(acceptedInput)).status, 200);
    assert.equal(received.at(-1).body.answers[key], "x".repeat(2000));
    const before = received.length;
    const rejectedInput = { ...source, request_key: randomUUID(), answers: { ...source.answers, [key]: "x".repeat(2001) } };
    const rejected = await post(rejectedInput);
    assert.equal(rejected.status, 400);
    assert.deepEqual(await rejected.json(), { error: "Vérifiez vos informations." });
    assert.equal(received.length, before);
  }
  const beforeRecruitment = received.length;
  const teacherFixture = {
    destination: "recruitment", workflow: "temporary_hiring_lead", role: "Professeur d'anglais",
    request_key: randomUUID(), name: "Test Applicant", phone: "+212600000000",
    answers: { subject: "English" }, consent: true,
  };
  // The dedicated hiring route is deliberately unconfigured in this mock run.
  assert.equal((await post(teacherFixture, "/api/recruitment-leads")).status, 503);
  assert.equal(received.length, beforeRecruitment);
  assert.equal((await post(teacherFixture)).status, 400);
  assert.equal(received.length, beforeRecruitment);
  const beforeTrap = received.length;
  assert.equal((await post({ ...cases[0], request_key: randomUUID(), website: "filled-by-bot" })).status, 200);
  assert.equal(received.length, beforeTrap);

  mode = "invalid";
  assert.equal((await post({ ...cases[0], request_key: randomUUID() })).status, 422);
  mode = "rate";
  assert.equal((await post({ ...cases[0], request_key: randomUUID() })).status, 429);
  mode = "fail-once";
  failedOnce = false;
  const retryInput = { ...cases[0], request_key: randomUUID() };
  assert.equal((await post(retryInput)).status, 200);
  assert.deepEqual(received.at(-1).body, received.at(-2).body);
  mode = "fail";
  assert.equal((await post({ ...cases[0], request_key: randomUUID() })).status, 503);
  mode = "timeout";
  const timeoutInput = { ...cases[0], request_key: randomUUID() };
  assert.equal((await post(timeoutInput)).status, 503);
  assert.deepEqual(received.at(-1).body, received.at(-2).body);
  mode = "ok";

  const direct = await fetch(base + "/api/crm-inquiry/thank-you", { method: "POST" });
  assert.deepEqual(await direct.json(), { valid: false });
  const directPage = await fetch(base + "/merci");
  assert.match(await directPage.text(), /Aucune demande récente à confirmer/);
  const accepted = await post({ ...cases[1], request_key: randomUUID() });
  const receipt = accepted.headers.get("set-cookie")?.split(";")[0];
  assert.ok(receipt);
  const tracked = await fetch(base + "/api/crm-inquiry/thank-you", { method: "POST", headers: { Cookie: receipt } });
  const proof = await tracked.json();
  assert.equal(proof.valid, true);
  assert.match(proof.eventId, /^[0-9a-f-]{36}$/);
  assert.ok(tracked.headers.get("set-cookie")?.includes("eh_inquiry_receipt=;"));
  console.log("CRM inquiry mock integration: passed");
} finally {
  site.kill("SIGTERM");
  mock.close();
}
