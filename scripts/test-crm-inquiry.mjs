import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { isIPv4 } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
// Needs --conditions=react-server (see the npm script) so `server-only` loads.
import { forwardedClientIp, signVisitor, visitorIpFrom, visitorTokenHeaders } from "../src/lib/crm/visitor-signature.ts";

const proxySecret = "a-local-proxy-test-secret-with-more-than-32-characters";
const requestKey = "11111111-1111-4111-8111-111111111111";
const withHeaders = (headers) => ({ headers: new Headers(headers) });
// Independent verifier for the CRM side of the contract.
function verifyVisitorToken(token, key, secret = proxySecret) {
  const parts = token.split(".");
  assert.equal(parts.length, 4);
  const [version, ts, ipb64, sig] = parts;
  assert.equal(version, "v1");
  assert.match(ts, /^\d+$/);
  assert.equal(sig, createHmac("sha256", secret).update(`${version}.${ts}.${ipb64}.${key}`).digest("base64url"));
  return { ts: Number(ts), ip: Buffer.from(ipb64, "base64url").toString() };
}

// Known-answer vectors, computed independently with Python hmac and openssl.
assert.equal(signVisitor("203.0.113.9", requestKey, "known-answer-proxy-secret-0123456789", 1760000000123),
  "v1.1760000000.MjAzLjAuMTEzLjk.qvRckfTISqD3KQGQLbv7DLeV9RMy8VLTluutQAssQ9k");
assert.equal(signVisitor("2001:db8::1", requestKey, "known-answer-proxy-secret-0123456789", 1760000000999),
  "v1.1760000000.MjAwMTpkYjg6OjE.mRAP1V3_iF3ShD_yo8KStlBK9ES0g_nwEiaz4Ih4FgY");
for (const [headers, ip] of [
  [{ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }, "203.0.113.9"],
  [{ "x-forwarded-for": "2001:db8::1" }, "2001:db8::1"],
  [{ "x-forwarded-for": "::ffff:203.0.113.9" }, "::ffff:203.0.113.9"],
  [{ "x-real-ip": "198.51.100.7" }, "198.51.100.7"],
  [{ "x-forwarded-for": " , 203.0.113.9", "x-real-ip": "198.51.100.7" }, "198.51.100.7"],
]) {
  assert.equal(visitorIpFrom(withHeaders(headers)), ip);
  const now = Date.now();
  const decoded = verifyVisitorToken(signVisitor(ip, requestKey, proxySecret, now), requestKey);
  assert.deepEqual(decoded, { ts: Math.floor(now / 1000), ip });
  assert.throws(() => verifyVisitorToken(signVisitor(ip, requestKey, proxySecret, now), randomUUID()));
  assert.throws(() => verifyVisitorToken(signVisitor(ip, requestKey, proxySecret, now), requestKey, proxySecret + "x"));
}
assert.equal(visitorIpFrom(withHeaders({})), undefined);
for (const ip of ["unknown", "fe80::1%en0", "[::1]", "1".repeat(46), "203.0.113.9/24", "203.0.113.9<x>"]) {
  assert.equal(visitorIpFrom(withHeaders({ "x-real-ip": ip })), undefined, ip);
}
// The shared reader keeps the Meta CAPI expression unchanged, without the shape check.
assert.equal(forwardedClientIp(withHeaders({ "x-forwarded-for": "unknown, 10.0.0.1" })), "unknown");
assert.equal(forwardedClientIp(withHeaders({ "x-real-ip": "unknown" })), "unknown");
assert.equal(forwardedClientIp(withHeaders({})), undefined);
const ipv4 = withHeaders({ "x-forwarded-for": "203.0.113.9" });
assert.deepEqual(Object.keys(visitorTokenHeaders(ipv4, requestKey, "x".repeat(32))), ["x-eh-visitor-token"]);
assert.equal(verifyVisitorToken(visitorTokenHeaders(ipv4, requestKey, proxySecret)["x-eh-visitor-token"], requestKey).ip, "203.0.113.9");
for (const secret of [undefined, "", "x".repeat(31)]) assert.deepEqual(visitorTokenHeaders(ipv4, requestKey, secret), {});
assert.deepEqual(visitorTokenHeaders(withHeaders({}), requestKey, proxySecret), {});
assert.deepEqual(visitorTokenHeaders(withHeaders({ "x-real-ip": "unknown" }), requestKey, proxySecret), {});

const mockPort = 31387;
const sitePort = 31388;
const unsignedSitePorts = [31389, 31390];
const received = [];
let mode = "ok";
let failedOnce = false;
const mock = createServer(async (req, res) => {
  let body = "";
  for await (const part of req) body += part;
  received.push({
    body: JSON.parse(body), origin: req.headers.origin, headers: req.headers, at: Date.now(),
    token: req.headers["x-eh-visitor-token"], peer: req.socket.remoteAddress, family: req.socket.remoteFamily,
  });
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

function startSite(port, secret) {
  const env = {
    ...process.env,
    CRM_INQUIRY_ENDPOINT: `http://127.0.0.1:${mockPort}/inquiry`,
    CRM_WEBSITE_SITE_KEY: "english-hills-website",
    CRM_WEBSITE_RECEIPT_SECRET: "a-local-test-secret-with-more-than-32-characters",
    CRM_LEGACY_META_CAPI_ENABLED: "false",
    META_CAPI_ACCESS_TOKEN: "",
    NEXT_PUBLIC_META_PIXEL_ID: "",
    CRM_WEBSITE_PROXY_SECRET: secret,
  };
  if (secret === undefined) delete env.CRM_WEBSITE_PROXY_SECRET;
  const child = spawn("./node_modules/.bin/next", ["start", "-p", String(port)], { env, stdio: ["ignore", "pipe", "pipe"] });
  const started = { child, output: "" };
  child.stdout.on("data", (data) => { started.output += data; });
  child.stderr.on("data", (data) => { started.output += data; });
  return started;
}
async function waitForSite(started, siteBase) {
  for (let n = 0; n < 80; n++) {
    if (started.child.exitCode !== null) throw Error(started.output);
    try { const response = await fetch(siteBase + "/contact"); if (response.ok) return; } catch { /* Starting. */ }
    await delay(250);
  }
  assert.fail(`Next server did not start: ${started.output}`);
}
const signedSite = startSite(sitePort, proxySecret);
const unsignedSites = [];

const base = `http://127.0.0.1:${sitePort}`;
// The client reaches Next over IPv4 loopback and Next synthesises
// x-forwarded-for from that socket (possibly IPv4-mapped on a dual-stack
// listener). The mock sees Next's own IPv4 loopback socket.
const plainIp = (ip) => ip.replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, "");
function assertSignedVisitor(sent) {
  assert.ok(sent.token, "x-eh-visitor-token missing");
  const { ts, ip } = verifyVisitorToken(sent.token, sent.body.request_key);
  assert.ok(Math.abs(sent.at / 1000 - ts) <= 5, "visitor token timestamp outside 5 s");
  assert.equal(sent.family, "IPv4");
  assert.ok(isIPv4(plainIp(ip)), ip);
  assert.equal(plainIp(ip), plainIp(sent.peer));
}
const withoutToken = (headers) => Object.fromEntries(Object.entries(headers).filter(([name]) => name !== "x-eh-visitor-token"));
async function post(body, path = "/api/crm-inquiry", siteBase = base) {
  return fetch(siteBase + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
function draft(form_key, contact, answers) {
  return { request_key: randomUUID(), form_key, contact, answers, consent: true, website: "", turnstileToken: "local-mock-token", attribution: {
    utm_source: "test", landing_page: "https://www.english-hills.com/contact?email=private@example.com",
    referrer: "https://example.org/path?phone=1234567890",
  } };
}

try {
  await waitForSite(signedSite, base);

  for (const path of ["/contact", "/anglais-casablanca", "/anglais-en-ligne", "/mise-a-niveau"]) {
    const page = await fetch(base + path);
    const csp = page.headers.get("content-security-policy") || "";
    for (const directive of ["script-src", "connect-src", "frame-src"]) {
      assert.match(csp, new RegExp(`${directive}[^;]*https://challenges\\.cloudflare\\.com`));
    }
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
    assert.equal(sent.body.turnstileToken, input.turnstileToken);
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
    { ...cases[0], request_key: randomUUID(), turnstileToken: undefined },
    { ...cases[0], request_key: randomUUID(), turnstileToken: "x".repeat(2049) },
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
  let rateLog;
  for (let n = 0; n < 20 && !rateLog; n++) {
    rateLog = signedSite.output.split("\n").find((line) => line.includes("[crm-inquiry] upstream 429"));
    if (!rateLog) await delay(100);
  }
  // Only the form key is logged: no contact data, IP or visitor token.
  assert.equal(rateLog, "[crm-inquiry] upstream 429 { form_key: 'general_contact_v1' }");
  mode = "fail-once";
  failedOnce = false;
  const retryInput = { ...cases[0], request_key: randomUUID() };
  assert.equal((await post(retryInput)).status, 503);
  const retry = { ...retryInput, turnstileToken: "fresh-local-mock-token" };
  assert.equal((await post(retry)).status, 200);
  assert.equal(received.at(-1).body.request_key, received.at(-2).body.request_key);
  assert.notEqual(received.at(-1).body.turnstileToken, received.at(-2).body.turnstileToken);
  assert.deepEqual(received.at(-1).body.answers, received.at(-2).body.answers);
  mode = "fail";
  assert.equal((await post({ ...cases[0], request_key: randomUUID() })).status, 503);
  mode = "timeout";
  const timeoutInput = { ...cases[0], request_key: randomUUID() };
  assert.equal((await post(timeoutInput)).status, 503);
  assert.equal(received.at(-1).body.request_key, timeoutInput.request_key);
  assert.equal(received.at(-2).body.request_key === timeoutInput.request_key, false);
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
  for (const sent of received) assertSignedVisitor(sent);

  // Without a usable proxy secret the header is omitted and nothing else changes.
  const reference = { ...cases[1], request_key: randomUUID() };
  const signedResponse = await post(reference);
  assert.equal(signedResponse.status, 200);
  const signedRequest = received.at(-1);
  assertSignedVisitor(signedRequest);
  for (const [index, secret] of [undefined, "x".repeat(31)].entries()) {
    const unsignedBase = `http://127.0.0.1:${unsignedSitePorts[index]}`;
    const unsignedSite = startSite(unsignedSitePorts[index], secret);
    unsignedSites.push(unsignedSite);
    await waitForSite(unsignedSite, unsignedBase);
    const response = await post(reference, "/api/crm-inquiry", unsignedBase);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.ok(response.headers.get("set-cookie")?.includes("eh_inquiry_receipt="));
    const sent = received.at(-1);
    assert.equal(sent.token, undefined);
    assert.equal("x-eh-visitor-token" in sent.headers, false);
    assert.deepEqual(sent.body, signedRequest.body);
    assert.deepEqual(sent.headers, withoutToken(signedRequest.headers));
    const beforeUnsignedTrap = received.length;
    assert.equal((await post({ ...cases[0], request_key: randomUUID(), website: "filled-by-bot" }, "/api/crm-inquiry", unsignedBase)).status, 200);
    assert.equal(received.length, beforeUnsignedTrap);
  }
  console.log("CRM inquiry mock integration: passed");
} finally {
  signedSite.child.kill("SIGTERM");
  for (const unsignedSite of unsignedSites) unsignedSite.child.kill("SIGTERM");
  mock.close();
}
