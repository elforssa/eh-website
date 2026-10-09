import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, verifyFormToken } from "@/lib/job-applications/security";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "@/lib/job-applications/supabase";
import { MAX_CV_BYTES, TEACHER_CV_PREFIX } from "@/lib/teacher-applications/rules";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    if (website || !formToken || !verifyFormToken(formToken)) {
      return NextResponse.json({ error: "Your session has expired. Please reload the page." }, { status: 400 });
    }
    if (!uuidPattern.test(submissionKey)) {
      return NextResponse.json({ error: "Invalid application session." }, { status: 400 });
    }
    if (!fileName.toLowerCase().endsWith(".pdf") || fileType !== "application/pdf") {
      return NextResponse.json({ error: "Please select your CV as a PDF file." }, { status: 400 });
    }
    if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > MAX_CV_BYTES) {
      return NextResponse.json({ error: "Your CV must be smaller than 5 MB." }, { status: 400 });
    }
    if (!await consumeRateLimit(req, "UPLOAD")) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const supabase = createServiceSupabaseClient();
    const storagePath = `${TEACHER_CV_PREFIX}/${submissionKey}/${crypto.randomUUID()}.pdf`;
    const { data, error } = await supabase.storage.from(JOB_CV_BUCKET).createSignedUploadUrl(storagePath);
    if (error || !data?.token) {
      console.error("Teacher CV signed upload error:", error);
      return NextResponse.json({ error: "Unable to prepare the CV upload." }, { status: 500 });
    }

    return NextResponse.json({ path: storagePath, token: data.token });
  } catch (error) {
    console.error("Teacher upload URL error:", error);
    return NextResponse.json({ error: "Unable to prepare the CV upload." }, { status: 500 });
  }
}
