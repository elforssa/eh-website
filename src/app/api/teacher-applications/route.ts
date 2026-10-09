import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIpForMeta, verifyFormToken } from "@/lib/job-applications/security";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "@/lib/job-applications/supabase";
import { appendTeacherApplication, sendTeacherMetaEvent } from "@/lib/teacher-applications/delivery";
import {
  AGE_GROUPS, COMMUNICATIVE_EXPERIENCE, ENGLISH_LEVELS, labelFor, labelsFor,
  START_AVAILABILITY, TEACHING_SETTINGS, WEEKLY_HOURS, YEARS_TEACHING,
} from "@/lib/teacher-applications/options";
import { makeReceipt, TEACHER_RECEIPT_COOKIE, TEACHER_RECEIPT_TTL_SECONDS } from "@/lib/teacher-applications/receipt";
import { MAX_CV_BYTES, scoreTeacherApplication, validateTeacherApplication } from "@/lib/teacher-applications/rules";
import { buildTeacherSheetRow } from "@/lib/teacher-applications/sheet-row";
import { checkVideoAccessible, parseVideoLink } from "@/lib/teacher-applications/video";

const CV_SIGNED_URL_TTL_SECONDS = 90 * 24 * 60 * 60;
const allowedHosts = new Set(["english-hills.com", "www.english-hills.com"]);

function originAllowed(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return url.origin === req.nextUrl.origin || allowedHosts.has(url.hostname);
  } catch {
    return false;
  }
}

async function removeUpload(path: string) {
  try {
    await createServiceSupabaseClient().storage.from(JOB_CV_BUCKET).remove([path]);
  } catch (error) {
    console.error("Teacher CV cleanup error:", error);
  }
}

async function verifyPdf(path: string, expectedSize: number) {
  const { data, error } = await createServiceSupabaseClient().storage.from(JOB_CV_BUCKET).download(path);
  if (error || !data) return false;
  if (data.size !== expectedSize || data.size > MAX_CV_BYTES) return false;
  return Buffer.from(await data.slice(0, 5).arrayBuffer()).toString("ascii") === "%PDF-";
}

export async function POST(req: NextRequest) {
  try {
    if (!originAllowed(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });

    const validation = validateTeacherApplication(await req.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const application = validation.value;
    const attribution = validation.attribution;

    if (!verifyFormToken(application.formToken)) {
      return NextResponse.json({ error: "Your session has expired. Please reload the page." }, { status: 400 });
    }
    if (!await consumeRateLimit(req, "SUBMIT")) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const video = parseVideoLink(application.videoUrl);
    if (!video) {
      return NextResponse.json({
        error: "Please paste a valid link to your video (Google Drive, YouTube, Loom, Vimeo or Dropbox).",
      }, { status: 400 });
    }
    const access = await checkVideoAccessible(video, fetch);
    if (access === "PRIVATE") {
      return NextResponse.json({
        error: "We cannot open your video. Please set its sharing to \"Anyone with the link\" and try again.",
      }, { status: 400 });
    }

    if (!await verifyPdf(application.cvStoragePath, application.cvSizeBytes)) {
      await removeUpload(application.cvStoragePath);
      return NextResponse.json({ error: "The selected file is not a valid PDF." }, { status: 400 });
    }

    const screening = scoreTeacherApplication(application);
    const { data: signedCv, error: signedCvError } = await createServiceSupabaseClient().storage
      .from(JOB_CV_BUCKET)
      .createSignedUrl(application.cvStoragePath, CV_SIGNED_URL_TTL_SECONDS);
    if (signedCvError || !signedCv?.signedUrl) {
      console.error("Teacher CV signed URL error:", signedCvError);
      return NextResponse.json({ error: "Unable to save your application. Please try again." }, { status: 500 });
    }

    const row = buildTeacherSheetRow({
      application,
      labels: {
        weeklyHours: labelFor(WEEKLY_HOURS, application.weeklyHours),
        startAvailability: labelFor(START_AVAILABILITY, application.startAvailability),
        yearsTeaching: labelFor(YEARS_TEACHING, application.yearsTeaching),
        englishLevel: labelFor(ENGLISH_LEVELS, application.englishLevel),
        ageGroups: labelsFor(AGE_GROUPS, application.ageGroups),
        teachingSettings: labelsFor(TEACHING_SETTINGS, application.teachingSettings),
        communicativeExperience: labelFor(COMMUNICATIVE_EXPERIENCE, application.communicativeExperience),
      },
      videoUrl: video.url,
      cvSignedUrl: signedCv.signedUrl,
      createdAt: new Date().toISOString(),
      automaticScore: screening.automaticScore,
      status: screening.applicationStatus,
      knockoutReasons: screening.knockoutReasons,
      attribution,
    });

    let result: "APPENDED" | "DUPLICATE";
    try {
      result = await appendTeacherApplication(application.submissionKey, row);
    } catch (error) {
      console.error("Teacher application sheet error:", error instanceof Error ? error.message : error);
      return NextResponse.json({ error: "We could not save your application. Please try again in a moment." }, { status: 503 });
    }

    if (result === "DUPLICATE") {
      return NextResponse.json({ success: true, duplicate: true });
    }

    await sendTeacherMetaEvent({
      application,
      attribution,
      clientIp: getClientIpForMeta(req),
      userAgent: req.headers.get("user-agent") || undefined,
      eventSourceUrl: attribution.landing_page || attribution.form_page,
    });

    const response = NextResponse.json({ success: true, duplicate: false });
    response.cookies.set(TEACHER_RECEIPT_COOKIE, makeReceipt(application.submissionKey, process.env.JOB_APPLICATION_FORM_SECRET || ""), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TEACHER_RECEIPT_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Teacher application error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
