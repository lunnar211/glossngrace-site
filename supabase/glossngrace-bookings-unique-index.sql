-- GlossnGrace bookings: unique index on (booking_date, booking_time)
-- so two bookings can never share the same slot, even if two requests
-- arrive at the same moment. The POST handler in
-- app/api/bookings/route.ts already re-checks availability in code;
-- this index is the final database-level guard.
--
-- HOW TO APPLY: run this file in the Supabase SQL editor (LeadForge
-- project, omnqidmauvloedscncir). It is NOT applied by a deploy.
--
-- SAFETY — READ FIRST:
-- 1. Check for existing clashes BEFORE applying. If this returns any
--    rows, resolve those duplicate bookings by hand (confirm one,
--    cancel the other) and only then apply the index:
--
--    select booking_date, booking_time, count(*)
--      from public.glossngrace_bookings
--     where status <> 'cancelled'
--     group by booking_date, booking_time
--    having count(*) > 1;
--
--    (The agent could not run this check: no Supabase credentials are
--    available in the repo, so the index is shipped unapplied.)
-- 2. The index is PARTIAL (status <> 'cancelled') so a slot frees up
--    again when a booking is cancelled.
-- 3. Idempotent: safe to run twice.

create unique index if not exists glossngrace_bookings_slot_unique
  on public.glossngrace_bookings (booking_date, booking_time)
  where status <> 'cancelled';
