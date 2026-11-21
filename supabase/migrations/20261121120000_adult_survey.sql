-- Temporary one-time adult learner satisfaction survey (/enquete-adultes, Nov 2026).
-- Not linked to any student data. Reuses the parent survey's rate-limit table and
-- function (public.parent_survey_rate_limits, public.check_parent_survey_rate_limit),
-- so the 30/hour per-IP limit is shared across both surveys.
--
-- Removal, once BOTH surveys are exported to CSV (keep the image-rights answers
-- separately first):
--
--   drop table public.adult_survey_responses;
--   drop table public.parent_survey_responses;
--   -- shared by both surveys: drop only after both tables above are gone
--   drop function public.check_parent_survey_rate_limit(text, integer, integer);
--   drop table public.parent_survey_rate_limits;
--
-- Does not touch public.parent_survey_responses (it holds live answers).

create table public.adult_survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  learner_name text not null check (char_length(trim(learner_name)) between 2 and 120),
  level_slot text not null check (char_length(trim(level_slot)) between 2 and 200),
  phone text not null check (char_length(phone) between 9 and 20),
  image_rights boolean not null,

  q1_accueil smallint not null check (q1_accueil between 1 and 5),
  q2_formateur smallint not null check (q2_formateur between 1 and 5),
  q3_locaux smallint not null check (q3_locaux between 1 and 5),
  q4_programme smallint not null check (q4_programme between 1 and 5),
  q5_ambiance smallint not null check (q5_ambiance between 1 and 5),
  q6_progres smallint not null check (q6_progres between 1 and 5),

  liked text check (char_length(liked) <= 2000),
  improve text check (char_length(improve) <= 2000),

  next_group text not null check (next_group in ('debutant', 'intermediaire')),
  reenroll boolean not null,
  testimonial boolean
);

alter table public.adult_survey_responses enable row level security;
revoke all on public.adult_survey_responses from public, anon, authenticated;
grant select, insert on public.adult_survey_responses to service_role;

comment on table public.adult_survey_responses is
  'Temporary: one-time adult survey (Nov 2026). Export to CSV, then drop. Keep the image-rights answers separately before dropping.';

-- The rate-limit table and function are now shared by both surveys.
comment on table public.parent_survey_rate_limits is
  'Temporary: rate limiting shared by the parent and adult surveys (Nov 2026). Drop only after both parent_survey_responses and adult_survey_responses are dropped.';

comment on function public.check_parent_survey_rate_limit(text, integer, integer) is
  'Temporary: rate limit shared by the parent and adult surveys (Nov 2026). Drop only after both survey tables are dropped.';
