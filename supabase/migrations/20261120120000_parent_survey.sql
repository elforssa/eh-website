-- Temporary one-time parent satisfaction survey (/enquete, Nov 2026).
-- Not linked to any student data. Export to CSV from the dashboard, keep the
-- image-rights answers separately, then remove everything with:
--
--   drop function public.check_parent_survey_rate_limit(text, integer, integer);
--   drop table public.parent_survey_rate_limits;
--   drop table public.parent_survey_responses;

create extension if not exists pgcrypto;

create table public.parent_survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  parent_name text not null check (char_length(trim(parent_name)) between 2 and 120),
  children_names text not null check (char_length(trim(children_names)) between 2 and 300),
  groups text[] not null check (
    cardinality(groups) between 1 and 8
    and groups <@ array[
      'Child 1 Mardi', 'Child 1 Mercredi', 'Child 3 Mardi', 'Child 3 Vendredi',
      'Child 5 Mardi', 'Child 5 Vendredi', 'Junior 7 Mercredi', 'Junior 9 Mercredi'
    ]::text[]
  ),
  phone text not null check (char_length(phone) between 9 and 20),
  image_rights boolean not null,

  q1_accueil smallint not null check (q1_accueil between 1 and 5),
  q2_pedagogie smallint not null check (q2_pedagogie between 1 and 5),
  q3_locaux smallint not null check (q3_locaux between 1 and 5),
  q4_programme smallint not null check (q4_programme between 1 and 5),
  q5_enfant smallint not null check (q5_enfant between 1 and 5),
  q6_progres smallint not null check (q6_progres between 1 and 5),

  liked text check (char_length(liked) <= 2000),
  improve text check (char_length(improve) <= 2000),

  wants_session boolean,
  testimonial boolean,
  constraint testimonial_requires_session check (testimonial is null or wants_session is true)
);

alter table public.parent_survey_responses enable row level security;
revoke all on public.parent_survey_responses from public, anon, authenticated;
grant select, insert on public.parent_survey_responses to service_role;

comment on table public.parent_survey_responses is
  'Temporary: one-time parent survey (Nov 2026). Export to CSV, then drop. Keep the image-rights answers separately before dropping.';

create table public.parent_survey_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index parent_survey_rate_limits_lookup_idx
  on public.parent_survey_rate_limits (ip_hash, created_at desc);

alter table public.parent_survey_rate_limits enable row level security;
revoke all on public.parent_survey_rate_limits from public, anon, authenticated;
grant select, insert, delete on public.parent_survey_rate_limits to service_role;

comment on table public.parent_survey_rate_limits is
  'Temporary: rate limiting for the one-time parent survey (Nov 2026). Drop together with parent_survey_responses.';

create function public.check_parent_survey_rate_limit(
  p_ip_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if p_ip_hash is null or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('parent_survey:' || p_ip_hash, 0));

  delete from public.parent_survey_rate_limits
  where created_at < pg_catalog.now() - interval '1 day';

  select count(*) into recent_count
  from public.parent_survey_rate_limits
  where ip_hash = p_ip_hash
    and created_at >= pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.parent_survey_rate_limits (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

revoke execute on function public.check_parent_survey_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_parent_survey_rate_limit(text, integer, integer)
  to service_role;

comment on function public.check_parent_survey_rate_limit(text, integer, integer) is
  'Temporary: parent survey rate limit (Nov 2026). Drop with the parent_survey tables.';
