import type { PreparedInquiry } from "./prepared";

export const CRM_TURNSTILE_ERROR = "Veuillez effectuer la vérification anti-robot et réessayer.";

export class TurnstileError extends Error {
  constructor() { super(CRM_TURNSTILE_ERROR); }
}

// The challenge is transport-only: it must not enter the prepared business
// payload or its fingerprint, so a retry keeps the same request UUID.
export async function sendPreparedInquiry(
  prepared: PreparedInquiry,
  requestToken: () => Promise<string>,
  post: typeof fetch = fetch,
): Promise<Response> {
  const turnstileToken = await requestToken();
  if (!turnstileToken || turnstileToken.length > 2048) throw new TurnstileError();
  return post("/api/crm-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...prepared.payload, turnstileToken }),
  });
}
