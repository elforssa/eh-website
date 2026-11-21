import { NextResponse } from "next/server";
import { issueSurveyToken } from "@/lib/parent-survey/security";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return NextResponse.json({ token: issueSurveyToken() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Adult survey session error:", error);
    return NextResponse.json({ error: "Le formulaire est temporairement indisponible." }, { status: 500 });
  }
}
