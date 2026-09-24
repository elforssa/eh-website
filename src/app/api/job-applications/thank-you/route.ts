import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/job-applications/supabase";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const applicationId = typeof body.applicationId === "string" ? body.applicationId.trim() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!uuidPattern.test(applicationId) || !uuidPattern.test(token)) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase.rpc("consume_job_application_thank_you", {
      p_application_id: applicationId,
      p_token: token,
    });
    if (error || !data) return NextResponse.json({ valid: false }, { status: 404 });

    return NextResponse.json({ valid: true, eventId: data });
  } catch (error) {
    console.error("Recruitment thank-you verification error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
