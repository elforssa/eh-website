import { NextRequest, NextResponse } from "next/server";
import { processJobApplicationDeliveries } from "@/lib/job-applications/delivery";
import { createServiceSupabaseClient, JOB_CV_BUCKET } from "@/lib/job-applications/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

async function cleanupAbandonedUploads() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("claim_abandoned_job_application_uploads", {
    p_limit: 50,
  });
  if (error || !data?.length) return 0;

  const paths = data.map((item: { storage_path: string }) => item.storage_path);
  await supabase.storage.from(JOB_CV_BUCKET).remove(paths);
  return paths.length;
}

async function cleanupDeliverySupportRows() {
  const supabase = createServiceSupabaseClient();
  const rateLimitCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const finalizedCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await Promise.all([
    supabase.from("job_application_rate_limits").delete().lt("created_at", rateLimitCutoff),
    supabase.from("job_application_uploads").delete().not("finalized_at", "is", null).lt("finalized_at", finalizedCutoff),
  ]);
}

async function run(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [processed, cleaned] = await Promise.all([
      processJobApplicationDeliveries({ limit: 10, timeoutMs: 8_000 }),
      cleanupAbandonedUploads(),
      cleanupDeliverySupportRows(),
    ]);
    return NextResponse.json({ success: true, processed, cleaned });
  } catch (error) {
    console.error("Recruitment delivery worker error:", error);
    return NextResponse.json({ error: "Delivery processing failed." }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
