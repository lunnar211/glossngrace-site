-- Glossngrace bookings table (LeadForge Supabase project, omnqidmauvloedscncir)
-- Run ONCE in the Supabase SQL editor. Public may INSERT (booking form);
-- reads go through the site's server API routes with the service-role key only.

create table if not exists public.glossngrace_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service text not null,
  booking_date date not null,
  booking_time text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.glossngrace_bookings enable row level security;

drop policy if exists "public insert bookings" on public.glossngrace_bookings;
create policy "public insert bookings"
  on public.glossngrace_bookings
  for insert to anon
  with check (true);
