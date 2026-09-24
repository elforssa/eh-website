import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { createServiceSupabaseClient } from "./supabase";

const sessionLifetimeSeconds = 2 * 60 * 60;
const minimumCompletionSeconds = 4;

function secret() {
  const value = process.env.JOB_APPLICATION_FORM_SECRET;
  if (!value || value.length < 32) throw new Error("JOB_APPLICATION_FORM_SECRET must contain at least 32 characters.");
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function issueFormToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID();
  const body = `${issuedAt}.${nonce}`;
  return `${body}.${sign(body)}`;
}

export function verifyFormToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAtText, nonce, receivedSignature] = parts;
  const body = `${issuedAtText}.${nonce}`;
  const expectedSignature = sign(body);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;

  const issuedAt = Number(issuedAtText);
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  return Number.isFinite(issuedAt) && age >= minimumCompletionSeconds && age <= sessionLifetimeSeconds;
}

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export function hashClientIp(req: NextRequest) {
  return createHmac("sha256", secret()).update(clientIp(req)).digest("hex");
}

export async function consumeRateLimit(req: NextRequest, action: "UPLOAD" | "SUBMIT") {
  const supabase = createServiceSupabaseClient();
  const limit = action === "UPLOAD" ? 10 : 5;
  const { data, error } = await supabase.rpc("check_job_application_rate_limit", {
    p_ip_hash: hashClientIp(req),
    p_action: action,
    p_limit: limit,
    p_window_seconds: 3600,
  });

  if (error) throw new Error(`Rate-limit check failed: ${error.message}`);
  return data === true;
}

export function getClientIpForMeta(req: NextRequest) {
  const ip = clientIp(req);
  return ip === "unknown" ? undefined : ip;
}

