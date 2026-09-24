import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, verifyFormToken } from "@/lib/job-applications/security";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "@/lib/job-applications/supabase";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxCvBytes = 5 * 1024 * 1024;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formToken = cleanText(body.formToken, 300);
    const submissionKey = cleanText(body.submissionKey, 40);
    const fileName = cleanText(body.fileName, 200);
    const fileType = cleanText(body.fileType, 100).toLowerCase();
    const fileSize = Number(body.fileSize);
    const website = cleanText(body.website, 200);

    if (website || !verifyFormToken(formToken)) {
      return NextResponse.json({ error: "Votre session a expiré. Rechargez la page." }, { status: 400 });
    }
    if (!uuidPattern.test(submissionKey)) {
      return NextResponse.json({ error: "Session de candidature invalide." }, { status: 400 });
    }
    if (!fileName.toLowerCase().endsWith(".pdf") || fileType !== "application/pdf") {
      return NextResponse.json({ error: "Veuillez sélectionner un CV au format PDF." }, { status: 400 });
    }
    if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > maxCvBytes) {
      return NextResponse.json({ error: "Le CV doit faire moins de 5 Mo." }, { status: 400 });
    }
    if (!await consumeRateLimit(req, "UPLOAD")) {
      return NextResponse.json({ error: "Trop de tentatives. Veuillez réessayer plus tard." }, { status: 429 });
    }

    const supabase = createServiceSupabaseClient();
    const storagePath = `${submissionKey}/${crypto.randomUUID()}.pdf`;
    const { data, error } = await supabase.storage.from(JOB_CV_BUCKET).createSignedUploadUrl(storagePath);
    if (error || !data?.token) {
      console.error("Recruitment CV signed upload error:", error);
      return NextResponse.json({ error: "Impossible de préparer l’envoi du CV." }, { status: 500 });
    }

    const { error: uploadRecordError } = await supabase.from("job_application_uploads").insert({
      storage_path: storagePath,
      submission_key: submissionKey,
    });
    if (uploadRecordError) {
      console.error("Recruitment upload record error:", uploadRecordError);
      return NextResponse.json({ error: "Impossible de préparer l’envoi du CV." }, { status: 500 });
    }

    return NextResponse.json({ path: storagePath, token: data.token });
  } catch (error) {
    console.error("Recruitment upload URL error:", error);
    return NextResponse.json({ error: "Impossible de préparer l’envoi du CV." }, { status: 500 });
  }
}

