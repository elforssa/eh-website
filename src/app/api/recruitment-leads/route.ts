import { NextRequest, NextResponse } from "next/server";
import { deliverTemporaryHiringLead, prepareTemporaryHiringLead } from "@/lib/recruitment/temporary";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && ![req.nextUrl.origin, "https://www.english-hills.com", "https://english-hills.com"].includes(origin)) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ success: false }, { status: 400 }); }
  const lead = prepareTemporaryHiringLead(raw);
  if (!lead) return NextResponse.json({ success: false }, { status: 400 });
  try {
    await deliverTemporaryHiringLead(lead);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
