-- Tracks clicks on enrollment CTAs (the /souvenirs gallery banner + CTA) that
-- land on the /contact-camp redirect. Written only by the API route using the
-- Supabase service role key.

create table if not exists public.cta_clicks (
  id         uuid        primary key default gen_random_uuid(),
  source     text,
  user_agent text,
  referer    text,
  created_at timestamptz not null default now()
);

-- Index for time-range queries / ordering clicks by recency.
create index if not exists cta_clicks_created_at_idx
  on public.cta_clicks (created_at);

-- Enable RLS with NO policies. Anon and authenticated roles are fully denied;
-- the service role bypasses RLS, so only the server route can read/write.
alter table public.cta_clicks enable row level security;
