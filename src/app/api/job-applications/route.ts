import { NextRequest, NextResponse } from "next/server";
import { processJobApplicationDeliveries } from "@/lib/job-applications/delivery";
import { scoreJobApplication } from "@/lib/job-applications/scoring";
import { consumeRateLimit, getClientIpForMeta, verifyFormToken } from "@/lib/job-applications/security";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "@/lib/job-applications/supabase";
import { normalizeEmail, normalizePhone, validateJobApplication } from "@/lib/job-applications/validation";

type RpcResult = {
  application_id: string;
  returned_thank_you_token: string | null;
  returned_meta_event_id: string;
  returned_cv_storage_path: string;
  is_duplicate: boolean;
  is_new: boolean;
};

async function removePendingUpload(path: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("claim_unreferenced_job_application_upload", {
    p_storage_path: path,
  });
  if (!error && data === path) await supabase.storage.from(JOB_CV_BUCKET).remove([path]);
}

async function verifyPdf(path: string, expectedSize: number) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.storage.from(JOB_CV_BUCKET).download(path);
  if (error || !data) return false;
  if (data.size !== expectedSize || data.size > 5 * 1024 * 1024) return false;
  const signature = Buffer.from(await data.slice(0, 5).arrayBuffer()).toString("ascii");
  return signature === "%PDF-";
}

export async function POST(req: NextRequest) {

  try {
    const raw = await req.json();
    const validation = validateJobApplication(raw);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    const application = validation.value;
    if (!verifyFormToken(application.formToken)) {
      return NextResponse.json({ error: "Votre session a expiré. Rechargez la page." }, { status: 400 });
    }
    if (!await consumeRateLimit(req, "SUBMIT")) {
      return NextResponse.json({ error: "Trop de tentatives. Veuillez réessayer plus tard." }, { status: 429 });
    }
    if (!await verifyPdf(application.cvStoragePath, application.cvSizeBytes)) {
      await removePendingUpload(application.cvStoragePath);
      return NextResponse.json({ error: "Le fichier sélectionné n’est pas un PDF valide." }, { status: 400 });
    }

    const score = scoreJobApplication(application);
    const attribution = validation.attribution;
    const metaTracking = validation.metaTracking;
    const payload = {
      full_name: application.fullName,
      phone: application.phone,
      email: normalizeEmail(application.email),
      area: application.area,
      normalized_phone: normalizePhone(application.phone),
      normalized_email: normalizeEmail(application.email),
      submission_key: application.submissionKey,
      preferred_shift: application.preferredShift,
      start_availability: application.startAvailability,
      can_commute_almaz: application.canCommuteAlmaz,
      accepts_compensation: application.acceptsCompensation,
      experience_categories: application.experienceCategories,
      experience_other: application.experienceOther,
      sales_experience_duration: application.salesExperienceDuration,
      previous_prospecting: application.previousProspecting,
      comfortable_prospecting: application.comfortableProspecting,
      comfortable_targets: application.comfortableTargets,
      french_level: application.frenchLevel,
      darija_level: application.darijaLevel,
      english_level: application.englishLevel,
      crm_tools_experience: application.crmToolsExperience,
      sales_scenario_response: application.salesScenarioResponse,
      cv_storage_path: application.cvStoragePath,
      cv_original_name: application.cvOriginalName,
      cv_size_bytes: application.cvSizeBytes,
      automatic_score: score.automaticScore,
      knockout_reasons: score.knockoutReasons,
      application_status: score.applicationStatus,
      utm_source: attribution.utm_source || "",
      utm_medium: attribution.utm_medium || "",
      utm_campaign: attribution.utm_campaign || "",
      utm_content: attribution.utm_content || "",
      utm_term: attribution.utm_term || "",
      fbclid: attribution.fbclid || "",
      fbp: metaTracking.fbp || "",
      fbc: metaTracking.fbc || "",
      client_ip_address: getClientIpForMeta(req) || "",
      client_user_agent: req.headers.get("user-agent") || "",
      meta_campaign_id: attribution.utm_campaign || "",
      meta_campaign_name: attribution.utm_campaign_name || "",
      meta_adset_id: attribution.utm_adset || "",
      meta_adset_name: attribution.utm_adset_name || "",
      meta_ad_id: attribution.utm_content || "",
      meta_ad_name: attribution.utm_ad_name || "",
      placement: attribution.placement || "",
      landing_page: attribution.landing_page || attribution.form_page || "",
      referrer: attribution.referrer || "",
      attribution,
    };

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase.rpc("create_job_application", { p_payload: payload });
    if (error || !Array.isArray(data) || !data[0]) {
      console.error("Recruitment application insert error:", error);
      await removePendingUpload(application.cvStoragePath);
      return NextResponse.json({ error: "Impossible d’enregistrer votre candidature. Veuillez réessayer." }, { status: 500 });
    }

    const result = data[0] as RpcResult;
    if (result.is_duplicate) {
      await removePendingUpload(application.cvStoragePath);
      return NextResponse.json({ success: true, duplicate: true });
    }

    if (!result.is_new && result.returned_cv_storage_path !== application.cvStoragePath) {
      await removePendingUpload(application.cvStoragePath);
    }

    // Bounded and optional: durable PENDING/FAILED state remains the source of truth.
    try {
      await processJobApplicationDeliveries({ applicationId: result.application_id, limit: 1, timeoutMs: 3_500 });
    } catch (deliveryError) {
      console.error("Immediate recruitment delivery attempt failed:", deliveryError);
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      applicationId: result.application_id,
      thankYouToken: result.returned_thank_you_token,
    });
  } catch (error) {
    console.error("Recruitment application error:", error);
    return NextResponse.json({ error: "Une erreur est survenue. Veuillez réessayer." }, { status: 500 });
  }
}
