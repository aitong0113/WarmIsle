create extension if not exists pgcrypto;

create table if not exists public.hako_guidance_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  source text not null default 'guide',
  page_path text not null default '',
  action_id text not null,
  action_to text not null default '',
  guide_state text,
  risk_level text,
  context_target text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists hako_guidance_events_user_id_idx
  on public.hako_guidance_events (user_id, created_at desc);

create index if not exists hako_guidance_events_action_id_idx
  on public.hako_guidance_events (action_id, created_at desc);

alter table public.hako_guidance_events enable row level security;

drop policy if exists "Allow insert guidance events" on public.hako_guidance_events;
create policy "Allow insert guidance events"
on public.hako_guidance_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow own guidance events read" on public.hako_guidance_events;
create policy "Allow own guidance events read"
on public.hako_guidance_events
for select
to authenticated
using (user_id = auth.uid()::text);