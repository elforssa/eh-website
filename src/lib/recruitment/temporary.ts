import "server-only";
import { createSign } from "node:crypto";
import { deliverKeyedRecruitmentRow } from "./sheet-row";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type TemporaryHiringLead = { request_key: string; role: string; name: string; phone?: string; email?: string; answers: Record<string, string>; consent: true };
const clean = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function prepareTemporaryHiringLead(raw: unknown): TemporaryHiringLead | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  if (input.destination !== "recruitment" || input.workflow !== "temporary_hiring_lead" || input.consent !== true) return null;
  const request_key = clean(input.request_key, 36);
  const role = clean(input.role, 120);
  const name = clean(input.name, 120);
  const phone = clean(input.phone, 30);
  const email = clean(input.email, 254).toLowerCase();
  const digits = phone.replace(/\D/g, "").length;
  if (!uuid.test(request_key) || !role || !name || (phone && (digits < 9 || digits > 15)) || (email && !emailPattern.test(email)) || (!phone && !email)) return null;
  if (!input.answers || typeof input.answers !== "object" || Array.isArray(input.answers)) return null;
  const answers: Record<string, string> = {};
  const entries = Object.entries(input.answers);
  if (entries.length > 20) return null;
  for (const [key, value] of entries) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(key) || typeof value !== "string") return null;
    const text = clean(value, 1000);
    if (text) answers[key] = text;
  }
  return { request_key, role, name, ...(phone ? { phone } : {}), ...(email ? { email } : {}), answers, consent: true };
}

function base64url(value: string) { return Buffer.from(value).toString("base64url"); }
async function token(signal: AbortSignal) {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Google Sheets credentials are missing");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({ iss: clientEmail, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const assertion = `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), signal });
  if (!response.ok) throw new Error(`Google authentication failed (${response.status})`);
  const data = await response.json();
  if (typeof data.access_token !== "string") throw new Error("Google authentication returned no token");
  return data.access_token as string;
}

export async function deliverTemporaryHiringLead(lead: TemporaryHiringLead) {
  const spreadsheet = process.env.GOOGLE_SHEETS_TEMP_HIRING_SPREADSHEET_ID;
  const sheet = process.env.GOOGLE_SHEETS_TEMP_HIRING_SHEET;
  if (!spreadsheet || !sheet || !/^[\p{L}\p{N}_ -]{1,80}$/u.test(sheet)) throw new Error("Temporary hiring sheet is not configured");
  const signal = AbortSignal.timeout(7000);
  const authorization = `Bearer ${await token(signal)}`;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheet)}/values/`;
  await deliverKeyedRecruitmentRow(lead, async () => {
    const lookup = await fetch(base + encodeURIComponent(`${sheet}!A:A`), { headers: { Authorization: authorization }, signal });
    if (!lookup.ok) throw new Error(`Temporary hiring lookup failed (${lookup.status})`);
    const values = (await lookup.json()).values as unknown;
    return Array.isArray(values) ? values.filter(Array.isArray).map((row) => String(row[0] || "")) : [];
  }, async (row) => {
    const append = await fetch(`${base}${encodeURIComponent(`${sheet}!A:G`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }), signal,
    });
    if (!append.ok) throw new Error(`Temporary hiring append failed (${append.status})`);
  });
}
