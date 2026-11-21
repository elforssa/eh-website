import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/job-applications/supabase";
import { validateAdultSurvey } from "@/lib/adult-survey/validation";
import { RATE_LIMIT_MESSAGE } from "@/lib/parent-survey/constants";
import { consumeSurveyRateLimit, verifySurveyToken } from "@/lib/parent-survey/security";

// Temporary one-time adult learner survey (Nov 2026). Deliberately no Meta Lead / CAPI event.
// Token signing and the 30/hour per-IP rate limit are shared with the parent survey.

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    const body = raw as Record<string, unknown>;

    // Honeypot: bots get a success response and nothing is stored.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ success: true });
    }

    const token = typeof body.formToken === "string" ? body.formToken.slice(0, 300) : "";
    if (verifySurveyToken(token) !== "ok") {
      // The client fetches a fresh token and resubmits once on this code.
      return NextResponse.json({ error: "Votre session a expiré. Merci de réessayer.", code: "TOKEN" }, { status: 400 });
    }

    if (!await consumeSurveyRateLimit(req)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE, code: "RATE_LIMIT" }, { status: 429 });
    }

    const validation = validateAdultSurvey(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error, field: validation.field }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("adult_survey_responses").insert(validation.row);
    if (error) {
      console.error("Adult survey insert error:", error);
      return NextResponse.json({ error: "Impossible d’enregistrer votre avis. Veuillez réessayer." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adult survey error:", error);
    return NextResponse.json({ error: "Une erreur est survenue. Veuillez réessayer." }, { status: 500 });
  }
}
