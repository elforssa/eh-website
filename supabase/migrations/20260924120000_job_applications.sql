create extension if not exists pgcrypto;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  phone text not null check (char_length(trim(phone)) between 8 and 30),
  email text not null check (char_length(trim(email)) between 3 and 254),
  area text not null check (char_length(trim(area)) between 2 and 100),
  normalized_phone text not null,
  normalized_email text not null,
  submission_key uuid not null unique,

  preferred_shift text not null check (preferred_shift in ('MORNING', 'AFTERNOON', 'EITHER')),
  start_availability text not null check (
    start_availability in ('IMMEDIATELY', 'UNDER_ONE_WEEK', 'ONE_TO_TWO_WEEKS', 'OVER_TWO_WEEKS')
  ),
  can_commute_almaz boolean not null,
  accepts_compensation boolean not null,

  experience_categories text[] not null check (cardinality(experience_categories) between 1 and 7),
  experience_other text,
  sales_experience_duration text not null check (
    sales_experience_duration in ('NONE', 'UNDER_SIX_MONTHS', 'SIX_TO_TWELVE_MONTHS', 'ONE_TO_TWO_YEARS', 'OVER_TWO_YEARS')
  ),
  previous_prospecting text not null check (previous_prospecting in ('REGULARLY', 'SOMETIMES', 'NEVER')),
  comfortable_prospecting text not null check (comfortable_prospecting in ('YES', 'WITH_TRAINING', 'NO')),
  comfortable_targets boolean not null,

  french_level text not null check (french_level in ('BASIC', 'AVERAGE', 'GOOD', 'VERY_GOOD')),
  darija_level text not null check (darija_level in ('AVERAGE', 'GOOD', 'VERY_GOOD')),
  english_level text not null check (english_level in ('BASIC', 'AVERAGE', 'GOOD', 'VERY_GOOD')),
  crm_tools_experience text not null check (crm_tools_experience in ('YES', 'SOMEWHAT', 'NO')),

  sales_scenario_response text not null check (char_length(trim(sales_scenario_response)) between 50 and 700),

  cv_storage_path text not null unique,
  cv_original_name text not null,
  cv_size_bytes integer not null check (cv_size_bytes between 1 and 5242880),

  automatic_score smallint not null check (automatic_score between 0 and 80),
  sales_scenario_score smallint check (sales_scenario_score between 0 and 20),
  qualification_score smallint check (qualification_score between 0 and 100),
  knockout_reasons text[] not null default '{}',

  application_status text not null default 'NEW' check (
    application_status in (
      'NEW', 'AUTO_REJECTED', 'TO_REVIEW', 'SHORTLISTED', 'PHONE_INTERVIEW',
      'INTERVIEW', 'TRIAL', 'HIRED', 'REJECTED', 'WITHDRAWN'
    )
  ),
  review_notes text,
  lead_source text not null default 'receptionist_hiring' check (lead_source = 'receptionist_hiring'),

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  fbp text,
  fbc text,
  client_ip_address inet,
  client_user_agent text,
  meta_campaign_id text,
  meta_campaign_name text,
  meta_adset_id text,
  meta_adset_name text,
  meta_ad_id text,
  meta_ad_name text,
  placement text,
  landing_page text,
  referrer text,
  attribution jsonb not null default '{}',

  meta_event_id uuid not null default gen_random_uuid() unique,
  meta_delivery_status text not null default 'PENDING' check (meta_delivery_status in ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
  meta_delivery_attempts integer not null default 0,
  meta_delivery_claim_id uuid,
  meta_last_attempt_at timestamptz,
  meta_next_retry_at timestamptz,
  meta_delivery_error text,
  meta_event_sent_at timestamptz,

  sheet_sync_status text not null default 'PENDING' check (sheet_sync_status in ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
  sheet_sync_attempts integer not null default 0,
  sheet_sync_claim_id uuid,
  sheet_last_attempt_at timestamptz,
  sheet_next_retry_at timestamptz,
  sheet_sync_error text,
  sheet_synced_at timestamptz,

  thank_you_token uuid not null default gen_random_uuid() unique,
  thank_you_viewed_at timestamptz,
  privacy_consent_at timestamptz not null default now(),

  constraint experience_none_is_exclusive check (
    not ('NONE' = any(experience_categories) and cardinality(experience_categories) > 1)
  ),
  constraint experience_other_is_described check (
    not ('OTHER' = any(experience_categories)) or nullif(trim(experience_other), '') is not null
  )
);

create index if not exists job_applications_created_at_idx on public.job_applications (created_at desc);
create index if not exists job_applications_status_idx on public.job_applications (application_status);
create index if not exists job_applications_normalized_phone_idx on public.job_applications (normalized_phone, created_at desc);
create index if not exists job_applications_normalized_email_idx on public.job_applications (normalized_email, created_at desc);
create index if not exists job_applications_delivery_idx on public.job_applications (meta_delivery_status, sheet_sync_status, created_at);

alter table public.job_applications enable row level security;
revoke all on public.job_applications from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('job-application-cvs', 'job-application-cvs', false, 5242880, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.job_application_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  action text not null check (action in ('UPLOAD', 'SUBMIT')),
  created_at timestamptz not null default now()
);

create index if not exists job_application_rate_limits_lookup_idx
  on public.job_application_rate_limits (ip_hash, action, created_at desc);

alter table public.job_application_rate_limits enable row level security;
revoke all on public.job_application_rate_limits from anon, authenticated;

create table if not exists public.job_application_uploads (
  storage_path text primary key,
  submission_key uuid not null,
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

create index if not exists job_application_uploads_cleanup_idx
  on public.job_application_uploads (created_at)
  where finalized_at is null;

alter table public.job_application_uploads enable row level security;
revoke all on public.job_application_uploads from anon, authenticated;

create or replace function public.check_job_application_rate_limit(
  p_ip_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  if p_action not in ('UPLOAD', 'SUBMIT') or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash || ':' || p_action, 0));

  select count(*) into recent_count
  from public.job_application_rate_limits
  where ip_hash = p_ip_hash
    and action = p_action
    and created_at >= now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.job_application_rate_limits (ip_hash, action)
  values (p_ip_hash, p_action);

  return true;
end;
$$;

revoke execute on function public.check_job_application_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_job_application_rate_limit(text, text, integer, integer) to service_role;

create or replace function public.create_job_application(p_payload jsonb)
returns table (
  application_id uuid,
  returned_thank_you_token uuid,
  returned_meta_event_id uuid,
  returned_cv_storage_path text,
  is_duplicate boolean,
  is_new boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_application public.job_applications%rowtype;
  inserted_application public.job_applications%rowtype;
  locked_upload public.job_application_uploads%rowtype;
  phone_key text := p_payload->>'normalized_phone';
  email_key text := p_payload->>'normalized_email';
  submission_uuid uuid := (p_payload->>'submission_key')::uuid;
begin
  select * into existing_application
  from public.job_applications
  where submission_key = submission_uuid;

  if found then
    return query select existing_application.id, existing_application.thank_you_token,
      existing_application.meta_event_id, existing_application.cv_storage_path, false, false;
    return;
  end if;

  select * into locked_upload
  from public.job_application_uploads
  where storage_path = p_payload->>'cv_storage_path'
    and submission_key = submission_uuid
  for update;

  if not found then
    raise exception 'CV upload is missing or does not belong to this submission';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(least(phone_key, email_key), 0));
  perform pg_advisory_xact_lock(hashtextextended(greatest(phone_key, email_key), 0));

  select * into existing_application
  from public.job_applications
  where created_at >= now() - interval '7 days'
    and (normalized_phone = phone_key or normalized_email = email_key)
  order by created_at desc
  limit 1;

  if found then
    return query select existing_application.id, null::uuid, existing_application.meta_event_id,
      existing_application.cv_storage_path, true, false;
    return;
  end if;

  insert into public.job_applications (
    full_name, phone, email, area, normalized_phone, normalized_email, submission_key,
    preferred_shift, start_availability, can_commute_almaz, accepts_compensation,
    experience_categories, experience_other, sales_experience_duration,
    previous_prospecting, comfortable_prospecting, comfortable_targets,
    french_level, darija_level, english_level, crm_tools_experience,
    sales_scenario_response, cv_storage_path, cv_original_name, cv_size_bytes,
    automatic_score, knockout_reasons, application_status, lead_source,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid, fbp, fbc, client_ip_address, client_user_agent,
    meta_campaign_id, meta_campaign_name, meta_adset_id,
    meta_adset_name, meta_ad_id, meta_ad_name, placement, landing_page, referrer,
    attribution, privacy_consent_at
  ) values (
    p_payload->>'full_name', p_payload->>'phone', p_payload->>'email', p_payload->>'area',
    phone_key, email_key, submission_uuid,
    p_payload->>'preferred_shift', p_payload->>'start_availability',
    (p_payload->>'can_commute_almaz')::boolean, (p_payload->>'accepts_compensation')::boolean,
    array(select jsonb_array_elements_text(p_payload->'experience_categories')),
    nullif(p_payload->>'experience_other', ''), p_payload->>'sales_experience_duration',
    p_payload->>'previous_prospecting', p_payload->>'comfortable_prospecting',
    (p_payload->>'comfortable_targets')::boolean,
    p_payload->>'french_level', p_payload->>'darija_level', p_payload->>'english_level',
    p_payload->>'crm_tools_experience', p_payload->>'sales_scenario_response',
    p_payload->>'cv_storage_path', p_payload->>'cv_original_name', (p_payload->>'cv_size_bytes')::integer,
    (p_payload->>'automatic_score')::smallint,
    array(select jsonb_array_elements_text(p_payload->'knockout_reasons')),
    p_payload->>'application_status', 'receptionist_hiring',
    nullif(p_payload->>'utm_source', ''), nullif(p_payload->>'utm_medium', ''),
    nullif(p_payload->>'utm_campaign', ''), nullif(p_payload->>'utm_content', ''),
    nullif(p_payload->>'utm_term', ''), nullif(p_payload->>'fbclid', ''),
    nullif(p_payload->>'fbp', ''), nullif(p_payload->>'fbc', ''),
    nullif(p_payload->>'client_ip_address', '')::inet, nullif(p_payload->>'client_user_agent', ''),
    nullif(p_payload->>'meta_campaign_id', ''), nullif(p_payload->>'meta_campaign_name', ''),
    nullif(p_payload->>'meta_adset_id', ''), nullif(p_payload->>'meta_adset_name', ''),
    nullif(p_payload->>'meta_ad_id', ''), nullif(p_payload->>'meta_ad_name', ''),
    nullif(p_payload->>'placement', ''), nullif(p_payload->>'landing_page', ''),
    nullif(p_payload->>'referrer', ''), coalesce(p_payload->'attribution', '{}'::jsonb), now()
  )
  returning * into inserted_application;

  update public.job_application_uploads
  set finalized_at = now()
  where storage_path = inserted_application.cv_storage_path;

  return query select inserted_application.id, inserted_application.thank_you_token,
    inserted_application.meta_event_id, inserted_application.cv_storage_path, false, true;
end;
$$;

revoke execute on function public.create_job_application(jsonb) from public, anon, authenticated;
grant execute on function public.create_job_application(jsonb) to service_role;

create or replace function public.consume_job_application_thank_you(
  p_application_id uuid,
  p_token uuid
)
returns uuid
language sql
security definer
set search_path = public
as $$
  update public.job_applications
  set thank_you_viewed_at = now()
  where id = p_application_id
    and thank_you_token = p_token
    and thank_you_viewed_at is null
  returning meta_event_id;
$$;

revoke execute on function public.consume_job_application_thank_you(uuid, uuid) from public, anon, authenticated;
grant execute on function public.consume_job_application_thank_you(uuid, uuid) to service_role;

create or replace function public.claim_unreferenced_job_application_upload(
  p_storage_path text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_upload public.job_application_uploads%rowtype;
begin
  select * into locked_upload
  from public.job_application_uploads
  where storage_path = p_storage_path
  for update;

  if not found or exists (
    select 1 from public.job_applications a
    where a.cv_storage_path = p_storage_path
  ) then
    return null;
  end if;

  delete from public.job_application_uploads
  where storage_path = p_storage_path;
  return p_storage_path;
end;
$$;

revoke execute on function public.claim_unreferenced_job_application_upload(text) from public, anon, authenticated;
grant execute on function public.claim_unreferenced_job_application_upload(text) to service_role;

create or replace function public.claim_abandoned_job_application_uploads(
  p_limit integer default 50
)
returns table (storage_path text)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_application_uploads u
  set finalized_at = now()
  where u.finalized_at is null
    and exists (
      select 1 from public.job_applications a
      where a.cv_storage_path = u.storage_path
    );

  return query
  with abandoned as (
    select u.storage_path
    from public.job_application_uploads u
    where u.finalized_at is null
      and u.created_at < now() - interval '24 hours'
      and not exists (
        select 1 from public.job_applications a
        where a.cv_storage_path = u.storage_path
      )
    order by u.created_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  ), removed as (
    delete from public.job_application_uploads u
    using abandoned a
    where u.storage_path = a.storage_path
    returning u.storage_path
  )
  select r.storage_path from removed r;
end;
$$;

revoke execute on function public.claim_abandoned_job_application_uploads(integer) from public, anon, authenticated;
grant execute on function public.claim_abandoned_job_application_uploads(integer) to service_role;

create or replace function public.claim_job_application_meta_deliveries(
  p_limit integer default 10,
  p_application_id uuid default null,
  p_claim_id uuid default gen_random_uuid()
)
returns setof public.job_applications
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with claimable as (
    select id
    from public.job_applications
    where (p_application_id is null or id = p_application_id)
      and meta_delivery_attempts < 8
      and (
        meta_delivery_status = 'PENDING'
        or (meta_delivery_status = 'FAILED' and coalesce(meta_next_retry_at, now()) <= now())
        or (meta_delivery_status = 'PROCESSING' and meta_last_attempt_at < now() - interval '10 minutes')
      )
    order by created_at
    for update skip locked
    limit greatest(1, least(p_limit, 25))
  ), updated as (
    update public.job_applications j
    set
      meta_delivery_status = 'PROCESSING',
      meta_delivery_claim_id = p_claim_id,
      meta_delivery_attempts = j.meta_delivery_attempts + 1,
      meta_last_attempt_at = now(),
      updated_at = now()
    from claimable c
    where j.id = c.id
    returning j.*
  )
  select * from updated;
end;
$$;

revoke execute on function public.claim_job_application_meta_deliveries(integer, uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_job_application_meta_deliveries(integer, uuid, uuid) to service_role;

create or replace function public.claim_job_application_sheet_deliveries(
  p_limit integer default 10,
  p_application_id uuid default null,
  p_claim_id uuid default gen_random_uuid()
)
returns setof public.job_applications
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with claimable as (
    select id
    from public.job_applications
    where (p_application_id is null or id = p_application_id)
      and sheet_sync_attempts < 8
      and (
        sheet_sync_status = 'PENDING'
        or (sheet_sync_status = 'FAILED' and coalesce(sheet_next_retry_at, now()) <= now())
        or (sheet_sync_status = 'PROCESSING' and sheet_last_attempt_at < now() - interval '10 minutes')
      )
    order by created_at
    for update skip locked
    limit greatest(1, least(p_limit, 25))
  ), updated as (
    update public.job_applications j
    set
      sheet_sync_status = 'PROCESSING',
      sheet_sync_claim_id = p_claim_id,
      sheet_sync_attempts = j.sheet_sync_attempts + 1,
      sheet_last_attempt_at = now(),
      updated_at = now()
    from claimable c
    where j.id = c.id
    returning j.*
  )
  select * from updated;
end;
$$;

revoke execute on function public.claim_job_application_sheet_deliveries(integer, uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_job_application_sheet_deliveries(integer, uuid, uuid) to service_role;

comment on table public.job_applications is
  'Production retention TODO: use six months as the provisional retention target for unsuccessful applications and their CVs. Do not automatically delete HIRED records; finalize the hired-candidate retention policy before enabling automated deletion.';

create or replace function public.set_job_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_job_applications_updated_at on public.job_applications;
create trigger set_job_applications_updated_at
before update on public.job_applications
for each row execute function public.set_job_applications_updated_at();
