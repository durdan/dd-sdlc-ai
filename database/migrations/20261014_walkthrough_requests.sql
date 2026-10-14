-- Walkthrough requests: a signed-in user describes a system, approves a
-- generated script and system diagram, and we produce the narrated
-- walkthrough by hand. Files live in the private "walkthroughs" bucket under
-- <request id>/ and are served through signed URLs only.

create table if not exists public.walkthrough_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  topic text not null,
  audience text,
  context text,
  script text,
  diagram jsonb,
  revisions int not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'queued', 'in_production', 'ready', 'cancelled')),
  allow_feature boolean not null default false,
  result_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  ready_at timestamptz
);

create index if not exists walkthrough_requests_user_idx on public.walkthrough_requests (user_id, created_at desc);
create index if not exists walkthrough_requests_status_idx on public.walkthrough_requests (status, approved_at);

alter table public.walkthrough_requests enable row level security;

-- Users read their own requests. All writes go through the server (service role).
drop policy if exists "own walkthrough requests" on public.walkthrough_requests;
create policy "own walkthrough requests" on public.walkthrough_requests
  for select using (auth.uid() = user_id);

create or replace function public.touch_walkthrough_request() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists walkthrough_requests_touch on public.walkthrough_requests;
create trigger walkthrough_requests_touch before update on public.walkthrough_requests
  for each row execute function public.touch_walkthrough_request();

-- Private bucket with no storage policies: only the service role reads or writes.
insert into storage.buckets (id, name, public)
values ('walkthroughs', 'walkthroughs', false)
on conflict (id) do nothing;
