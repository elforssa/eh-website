begin;

revoke execute on function public.check_job_application_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_job_application_rate_limit(text, text, integer, integer)
  to service_role;

revoke execute on function public.create_job_application(jsonb)
  from public, anon, authenticated;
grant execute on function public.create_job_application(jsonb)
  to service_role;

revoke execute on function public.consume_job_application_thank_you(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.consume_job_application_thank_you(uuid, uuid)
  to service_role;

revoke execute on function public.claim_unreferenced_job_application_upload(text)
  from public, anon, authenticated;
grant execute on function public.claim_unreferenced_job_application_upload(text)
  to service_role;

revoke execute on function public.claim_abandoned_job_application_uploads(integer)
  from public, anon, authenticated;
grant execute on function public.claim_abandoned_job_application_uploads(integer)
  to service_role;

revoke execute on function public.claim_job_application_meta_deliveries(integer, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_job_application_meta_deliveries(integer, uuid, uuid)
  to service_role;

revoke execute on function public.claim_job_application_sheet_deliveries(integer, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_job_application_sheet_deliveries(integer, uuid, uuid)
  to service_role;

commit;
