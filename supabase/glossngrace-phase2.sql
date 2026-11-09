-- GlossnGrace Phase 2 — run ONCE in the LeadForge Supabase project
-- (SQL editor). Adds booking fields + feedback + todos tables.
-- Tables are read through the site's service-role API routes only;
-- feedback allows public (anon) INSERT from the website form.

-- 1. New columns on the bookings table
alter table public.glossngrace_bookings
  add column if not exists urgent boolean not null default false,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists area text,
  add column if not exists verified boolean not null default false,
  add column if not exists location_verified boolean not null default false;

-- 2. Customer feedback (public form -> admin reads)
create table if not exists public.glossngrace_feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  message text not null,
  service text,
  visible boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.glossngrace_feedback enable row level security;
drop policy if exists "public insert feedback" on public.glossngrace_feedback;
create policy "public insert feedback" on public.glossngrace_feedback
  for insert to anon with check (true);

-- 3. Admin to-do list (admin only, via service-role API routes)
create table if not exists public.glossngrace_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.glossngrace_todos enable row level security;
-- no anon policy: only the service-role API routes touch this table.
