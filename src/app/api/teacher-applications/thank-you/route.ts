import { NextRequest, NextResponse } from "next/server";
import { TEACHER_RECEIPT_COOKIE, verifyReceipt } from "@/lib/teacher-applications/receipt";

export const dynamic = "force-dynamic";

// Returns the Meta event id once per successful submission, then clears the receipt.
export async function POST(req: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const secret = process.env.JOB_APPLICATION_FORM_SECRET || "";
    const eventId = verifyReceipt(req.cookies.get(TEACHER_RECEIPT_COOKIE)?.value, secret);
    if (!eventId) return NextResponse.json({ valid: false }, { status: 404, headers });

    const response = NextResponse.json({ valid: true, eventId }, { headers });
    response.cookies.set(TEACHER_RECEIPT_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Teacher thank-you verification error:", error);
    return NextResponse.json({ valid: false }, { status: 500, headers });
  }
}
