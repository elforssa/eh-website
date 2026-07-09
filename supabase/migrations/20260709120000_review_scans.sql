-- Tracks scans/clicks that land on the /avis redirect to the Google review page.
-- Written only by the API route using the Supabase service role key.

create table if not exists public.review_scans (
  id         uuid        primary key default gen_random_uuid(),
  source     text,
  user_agent text,
  referer    text,
  created_at timestamptz not null default now()
);

-- Index for time-range queries / ordering scans by recency.
create index if not exists review_scans_created_at_idx
  on public.review_scans (created_at);

-- Enable RLS with NO policies. Anon and authenticated roles are fully denied;
-- the service role bypasses RLS, so only the server route can read/write.
alter table public.review_scans enable row level security;
