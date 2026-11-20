import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { hashClientIp } from "@/lib/job-applications/security";
import { createServiceSupabaseClient } from "@/lib/job-applications/supabase";

// Parents open the WhatsApp link and may come back hours later; the client
// fetches a fresh token and retries once when this one has expired.
const tokenLifetimeSeconds = 12 * 60 * 60;
export const minimumCompletionSeconds = 4;
const rateLimitPerHour = 30;

function secret() {
  const value = process.env.JOB_APPLICATION_FORM_SECRET;
  if (!value || value.length < 32) throw new Error("JOB_APPLICATION_FORM_SECRET must contain at least 32 characters.");
  return value;
}

// Domain-separated from the recruitment form tokens, so one can't be used for the other.
function sign(value: string) {
  return createHmac("sha256", secret()).update(`parent-survey:${value}`).digest("base64url");
}

export function issueSurveyToken() {
  const body = `${Math.floor(Date.now() / 1000)}.${crypto.randomUUID()}`;
  return `${body}.${sign(body)}`;
}

export function verifySurveyToken(token: string): "ok" | "too_fast" | "expired" | "invalid" {
  const parts = token.split(".");
  if (parts.length !== 3) return "invalid";
  const [issuedAtText, nonce, receivedSignature] = parts;
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(sign(`${issuedAtText}.${nonce}`));
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return "invalid";

  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt)) return "invalid";
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < minimumCompletionSeconds) return "too_fast";
  if (age > tokenLifetimeSeconds) return "expired";
  return "ok";
}

export async function consumeSurveyRateLimit(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("check_parent_survey_rate_limit", {
    p_ip_hash: hashClientIp(req),
    p_limit: rateLimitPerHour,
    p_window_seconds: 3600,
  });
  if (error) throw new Error(`Parent survey rate-limit check failed: ${error.message}`);
  return data === true;
}
