"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CAMP_COOKIE_NAME, computeAccessToken } from "./auth";

export type VerifyCodeState = { error: string | null };

// ---------------------------------------------------------------------------
// Rate limiting: max 8 attempts per IP per 10 minutes.
// In-memory sliding window. Fine for a single-instance deployment; resets on
// redeploy. Not shared across serverless instances, but adequate for a low-
// traffic family gallery.
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);

  // Opportunistic cleanup so the Map does not grow unbounded.
  if (attempts.size > 5000) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }

  return recent.length <= MAX_ATTEMPTS;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Validate the submitted access code SERVER-SIDE. On success, set the httpOnly
 * HMAC cookie and redirect back to /souvenirs (the page then re-renders with the
 * gallery). On failure, return an error message for the client form.
 *
 * Shaped for React 19 `useActionState`: (prevState, formData) => newState.
 */
export async function verifyCode(
  _prevState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const configuredCode = process.env.CAMP_ACCESS_CODE;
  if (!configuredCode) {
    // Never open the gallery by default when misconfigured.
    console.error("[souvenirs] CAMP_ACCESS_CODE is not set; rejecting all attempts.");
    return { error: "La galerie n'est pas encore disponible. Veuillez réessayer plus tard." };
  }

  const ip = await clientIp();
  if (!rateLimit(ip)) {
    return { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." };
  }

  const submitted = String(formData.get("code") ?? "");
  const matches =
    submitted.trim().toLowerCase() === configuredCode.trim().toLowerCase();

  if (!matches) {
    return { error: "Code d'accès incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CAMP_COOKIE_NAME, computeAccessToken(configuredCode), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/souvenirs",
  });

  // Re-render the server page, which now sees a valid cookie and shows the gallery.
  redirect("/souvenirs");
}
