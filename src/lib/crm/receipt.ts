import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const receiptCookie = "eh_inquiry_receipt";
const ttlSeconds = 10 * 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function secret() {
  const value = process.env.CRM_WEBSITE_RECEIPT_SECRET || "";
  if (value.length < 32) throw new Error("CRM_WEBSITE_RECEIPT_SECRET is missing or too short");
  return value;
}

export function makeReceipt(requestKey: string, now = Date.now()) {
  const body = `${requestKey}.${Math.floor(now / 1000)}`;
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyReceipt(receipt: string | undefined, now = Date.now()): string | null {
  if (!receipt) return null;
  const parts = receipt.split(".");
  if (parts.length !== 3 || !uuid.test(parts[0])) return null;
  const issued = Number(parts[1]);
  if (!Number.isInteger(issued) || issued > now / 1000 || now / 1000 - issued > ttlSeconds) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const supplied = Buffer.from(parts[2], "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return parts[0];
}
