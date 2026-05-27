import { createSign } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type LeadRow = {
  name: string | null;
  phone: string | null;
  email: string | null;
  learner_type: string | null;
  program_interest: string | null;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getGooglePrivateKey() {
  return process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = getGooglePrivateKey();

  if (!clientEmail || !privateKey) throw new Error("Missing Google Sheets credentials.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const unsignedJwt = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedJwt}.${signature}`,
    }),
  });
  const result = await res.json();

  if (!res.ok) throw new Error(`Google token error: ${JSON.stringify(result)}`);

  return result.access_token as string;
}

function toSheetRow(lead: LeadRow) {
  return [
    lead.name || "",
    lead.phone || "",
    lead.email || "",
    lead.learner_type || "",
    lead.program_interest || "",
  ];
}

function rowKey(row: string[]) {
  return row.map((value) => String(value || "").trim().toLowerCase()).join("\u241f");
}

async function getSheetRows(accessToken: string) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetRange = process.env.GOOGLE_SHEETS_RANGE || "Leads!A:E";

  if (!spreadsheetId) throw new Error("Missing Google Sheet ID.");

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const result = await res.json();

  if (!res.ok) throw new Error(`Google Sheets read error: ${JSON.stringify(result)}`);

  return (result.values || []) as string[][];
}

async function appendRows(accessToken: string, rows: string[][]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetRange = process.env.GOOGLE_SHEETS_RANGE || "Leads!A:E";

  if (!spreadsheetId) throw new Error("Missing Google Sheet ID.");
  if (rows.length === 0) return null;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    },
  );
  const result = await res.json();

  if (!res.ok) throw new Error(`Google Sheets append error: ${JSON.stringify(result)}`);

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const expectedToken = process.env.LEAD_BACKFILL_TOKEN;
    const token = req.headers.get("x-backfill-token");

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase configuration." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from("ad_leads")
      .select("name, phone, email, learner_type, program_interest")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const accessToken = await getGoogleAccessToken();
    const existingRows = await getSheetRows(accessToken);
    const existing = new Set(existingRows.slice(1).map((row) => rowKey(row.slice(0, 5))));
    const leadRows = ((data || []) as LeadRow[]).map(toSheetRow);
    const rowsToAppend = leadRows.filter((row) => !existing.has(rowKey(row)));
    const shouldWrite = req.nextUrl.searchParams.get("write") === "1";
    const appendResult = shouldWrite ? await appendRows(accessToken, rowsToAppend) : null;

    return NextResponse.json({
      supabaseLeads: data?.length || 0,
      sheetRowsIncludingHeader: existingRows.length,
      rowsToAppend: rowsToAppend.length,
      appended: shouldWrite ? rowsToAppend.length : 0,
      updatedRange: appendResult?.updates?.updatedRange || null,
    });
  } catch (error) {
    console.error("Lead backfill failed:", error);
    return NextResponse.json({ error: "Backfill failed." }, { status: 500 });
  }
}
