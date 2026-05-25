import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanUuid(value: unknown) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return uuidPattern.test(text) ? text : "";
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const body = await req.json();
    const leadId = cleanUuid(body.leadId);
    const token = cleanUuid(body.token);

    if (!leadId || !token) {
      return NextResponse.json({ error: "Invalid conversion marker." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from("ad_leads")
      .update({ thank_you_viewed_at: new Date().toISOString() })
      .eq("id", leadId)
      .eq("thank_you_token", token);

    if (error) {
      console.error("Thank-you marker update error:", error);
      return NextResponse.json({ error: "Failed to mark conversion." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Error /ad-leads/thank-you:", err);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
