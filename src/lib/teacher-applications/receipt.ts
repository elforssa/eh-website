// One-time thank-you receipt for teacher applications. The submit route sets a
// signed, short-lived httpOnly cookie; the thank-you page only fires the Meta
// browser event when that cookie is valid, so direct visits never count.
// Pure module: the signing secret is passed in by the caller.
import { createHmac, timingSafeEqual } from "node:crypto";

export const TEACHER_RECEIPT_COOKIE = "eh_teacher_receipt";
export const TEACHER_RECEIPT_TTL_SECONDS = 10 * 60;

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertSecret(secret: string) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("Teacher receipt secret is missing or too short.");
  }
}

export function makeReceipt(applicationId: string, secret: string, now = Date.now()) {
  assertSecret(secret);
  const body = `${applicationId}.${Math.floor(now / 1000)}`;
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyReceipt(receipt: string | undefined, secret: string, now = Date.now()): string | null {
  if (!receipt) return null;
  assertSecret(secret);
  const parts = receipt.split(".");
  if (parts.length !== 3 || !uuid.test(parts[0])) return null;
  const issued = Number(parts[1]);
  const nowSeconds = now / 1000;
  if (!Number.isInteger(issued) || issued > nowSeconds + 5 || nowSeconds - issued > TEACHER_RECEIPT_TTL_SECONDS) return null;
  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  const supplied = Buffer.from(parts[2], "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return parts[0];
}
