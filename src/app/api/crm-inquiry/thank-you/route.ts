import { NextRequest, NextResponse } from "next/server";
import { receiptCookie, verifyReceipt } from "@/lib/crm/receipt";

export async function POST(req: NextRequest) {
  const requestKey = verifyReceipt(req.cookies.get(receiptCookie)?.value);
  const response = NextResponse.json(requestKey ? { valid: true, eventId: requestKey } : { valid: false });
  response.cookies.delete(receiptCookie);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
