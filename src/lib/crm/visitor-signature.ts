import "server-only";
import { createHmac } from "node:crypto";

// The CRM rate-limits inquiries per client IP, but its edge only sees this
// website's egress IP. This header carries the visitor's IP to the CRM,
// signed with CRM_WEBSITE_PROXY_SECRET and bound to the submission's
// request_key. Contract: docs/crm-inquiry-integration.md.
export const visitorTokenHeader = "x-eh-visitor-token";
const ipShape = /^[0-9A-Fa-f:.]{1,45}$/;

// Visitor IP as reported by Vercel's edge: the first x-forwarded-for entry,
// else x-real-ip. Vercel overwrites both on inbound requests to this website.
export function forwardedClientIp(req: Pick<Request, "headers">) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
}

export function visitorIpFrom(req: Pick<Request, "headers">) {
  const ip = forwardedClientIp(req);
  return ip && ipShape.test(ip) ? ip : undefined;
}

// `v1.<ts>.<ipb64>.<sig>`: ts in Unix seconds, ipb64 = base64url(ip),
// sig = base64url(HMAC-SHA256(secret, `v1.<ts>.<ipb64>.<request_key>`)).
export function signVisitor(ip: string, requestKey: string, secret: string, now = Date.now()) {
  const signed = `v1.${Math.floor(now / 1000)}.${Buffer.from(ip).toString("base64url")}`;
  return `${signed}.${createHmac("sha256", secret).update(`${signed}.${requestKey}`).digest("base64url")}`;
}

// Empty unless the secret has at least 32 characters and a valid IP was read,
// so an unconfigured website sends exactly the request it sent before.
export function visitorTokenHeaders(req: Pick<Request, "headers">, requestKey: string, secret: string | undefined): Record<string, string> {
  const ip = visitorIpFrom(req);
  if (!ip || !secret || secret.length < 32) return {};
  return { [visitorTokenHeader]: signVisitor(ip, requestKey, secret) };
}
