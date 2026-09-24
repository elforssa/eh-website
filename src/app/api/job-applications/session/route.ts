import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/job-applications/security";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return NextResponse.json({ token: issueFormToken() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Recruitment form session error:", error);
    return NextResponse.json({ error: "Le formulaire est temporairement indisponible." }, { status: 500 });
  }
}

