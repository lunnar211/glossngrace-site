# GlossnGrace Nails

A small nails studio website — services and starting prices, online
booking, a gallery of looks, and an owner-only admin panel. Built with
Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS v4, with
Supabase for bookings, feedback and admin data.

Live site: https://glossngrace-site.vercel.app

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The public site works without keys; booking
and feedback submissions need the Supabase environment variables (see
below) or they fail gracefully.

## Environment variables

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (admin sign-in) |
| `SUPABASE_URL` | Server-side Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service-role key (bookings, feedback, admin reads) |
| `GLOSS_ADMIN_EMAIL` | The single email allowed into `/admin` |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run start` — serve the production build

## Deploy

Push to `master` on GitHub (`lunnar211/glossngrace-site`) — Vercel
auto-deploys. Do not deploy via the Vercel MCP/API path.

## Notes for the owner

- Prices in `lib/services.ts` are "from" starting prices in USD, from
  research — correct them when real prices are confirmed.
- Location, hours, phone and email are not on the site yet; the site
  says so honestly ("coming soon") instead of inventing them.
- The unique booking-slot index in
  `supabase/glossngrace-bookings-unique-index.sql` must be applied by
  hand in the Supabase SQL editor (after checking for duplicate
  bookings); the booking API already re-checks availability in code.
- Online payment stays "coming soon" — it is shown as disabled and
  rejected server-side.
