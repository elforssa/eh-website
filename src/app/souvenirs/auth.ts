import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Server-only access control for the /souvenirs camp gallery.
 *
 * SECURITY MODEL
 * - The plaintext access code (CAMP_ACCESS_CODE) NEVER leaves the server. It is
 *   read from the environment here and in the server action only. It is never
 *   imported by a client component and never serialized into props, so it cannot
 *   appear in the client JS bundle.
 * - The browser only ever holds an httpOnly cookie containing an HMAC of the
 *   normalized code, keyed by CAMP_COOKIE_SECRET. Without the secret the cookie
 *   value cannot be forged, and being httpOnly it is unreadable from JS.
 */

export const CAMP_COOKIE_NAME = "camp_access";

/** Normalize a code the same way on the write and read paths: trim + lowercase. */
function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Deterministic HMAC-SHA256 (hex) of a normalized code. The same input always
 * yields the same token, so we can recompute the expected token on the read path
 * and compare it against the cookie.
 */
export function computeAccessToken(rawCode: string): string {
  const secret = process.env.CAMP_COOKIE_SECRET;
  if (!secret) {
    throw new Error("CAMP_COOKIE_SECRET is not configured.");
  }
  return createHmac("sha256", secret)
    .update(normalizeCode(rawCode))
    .digest("hex");
}

/** Constant-time string comparison that is safe when lengths differ. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Read the httpOnly cookie and check it matches the HMAC of the currently
 * configured access code. Returns false (never throws) so callers can safely
 * fall back to the access gate.
 */
export async function hasValidCampAccess(): Promise<boolean> {
  const configuredCode = process.env.CAMP_ACCESS_CODE;
  const secret = process.env.CAMP_COOKIE_SECRET;

  // Never open the gallery by default: without a configured code/secret there is
  // no valid state to grant access to.
  if (!configuredCode || !secret) {
    console.error(
      "[souvenirs] CAMP_ACCESS_CODE or CAMP_COOKIE_SECRET is not set; access is denied.",
    );
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(CAMP_COOKIE_NAME)?.value;
  if (!token) return false;

  const expected = computeAccessToken(configuredCode);
  return safeEqual(token, expected);
}
