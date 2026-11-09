'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Booking = {
  id: string
  name: string
  phone: string
  service: string
  booking_date: string
  booking_time: string
  notes: string | null
  status: string
  created_at: string
  urgent: boolean
  payment_method: string
  area: string | null
  verified: boolean
  location_verified: boolean
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-sky-100 text-sky-800',
  cancelled: 'bg-stone-200 text-stone-600',
}

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Fake-vs-genuine hint — no OTP/SMS exists. Flag a booking for a manual
 * check when the phone looks suspicious: all zeros, one repeated digit,
 * the 9800000000 test pattern, or the same phone booked 3+ times.
 * The salon confirms by calling the customer, then taps "Mark verified".
 */
function isSuspiciousPhone(phone: string, phoneCounts: Record<string, number>): boolean {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return false
  if (/^0+$/.test(digits)) return true
  if (new Set(digits).size === 1) return true
  if (digits === '9800000000' || digits === '9779800000000') return true
  if ((phoneCounts[phone] ?? 0) >= 3) return true
  return false
}

export default function AdminBookings({ email }: { email: string }) {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/bookings')
    if (!res.ok) {
      setError('Could not load bookings.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setLoading(false)
  }, [])

  // Initial load: fetch inside the effect so no setState runs
  // synchronously in the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/admin/bookings')
      if (cancelled) return
      if (!res.ok) {
        setError('Could not load bookings.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (cancelled) return
      setBookings(data.bookings ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function patchBooking(id: string, patch: Record<string, unknown>) {
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    if (res.ok) load()
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  const today = todayStr()
  const phoneCounts: Record<string, number> = {}
  for (const b of bookings) phoneCounts[b.phone] = (phoneCounts[b.phone] ?? 0) + 1

  const visible =
    filter === 'all'
      ? bookings
      : filter === 'urgent'
        ? bookings.filter((b) => b.urgent)
        : filter === 'unverified'
          ? bookings.filter((b) => !b.verified)
          : bookings.filter((b) => b.status === filter)

  const stats = {
    total: bookings.length,
    today: bookings.filter((b) => b.booking_date === today).length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    verified: bookings.filter((b) => b.verified).length,
    urgent: bookings.filter((b) => b.urgent).length,
  }
  const counts = {
    all: bookings.length,
    pending: stats.pending,
    confirmed: stats.confirmed,
    urgent: stats.urgent,
    unverified: bookings.filter((b) => !b.verified).length,
  }
  const perService: Record<string, number> = {}
  for (const b of bookings) perService[b.service] = (perService[b.service] ?? 0) + 1

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#3d2b2b]">Bookings</h1>
          <p className="text-sm text-stone-500">Signed in as {email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Refresh
          </button>
          <button
            onClick={signOut}
            className="rounded-full bg-[#3d2b2b] px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {(
          [
            ['Total bookings', stats.total],
            ['Bookings today', stats.today],
            ['Pending', stats.pending],
            ['Confirmed', stats.confirmed],
            ['Verified', stats.verified],
            ['Urgent (fast)', stats.urgent],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-display text-2xl font-semibold text-[#3d2b2b]">{value}</p>
            <p className="mt-1 text-xs text-stone-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-service breakdown */}
      {Object.keys(perService).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(perService)
            .sort((a, b) => b[1] - a[1])
            .map(([service, count]) => (
              <span
                key={service}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 shadow-sm"
              >
                {service}: {count}
              </span>
            ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'urgent', 'unverified'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              filter === s
                ? 'bg-[#c98a7d] text-white'
                : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-sm text-stone-500">Loading bookings…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-8 rounded-2xl bg-white p-6 text-sm text-stone-500 shadow-sm">
          No bookings yet. New bookings from the website will show up here.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {visible.map((b) => (
          <article key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#3d2b2b]">
                  {b.name} <span className="font-normal text-stone-500">· {b.phone}</span>
                  {isSuspiciousPhone(b.phone, phoneCounts) && (
                    <span
                      className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                      title="Phone looks suspicious — please call to confirm before trusting this booking."
                    >
                      ⚠ check this
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {b.service} · {b.booking_date} at {b.booking_time}
                </p>
                {b.notes && <p className="mt-1 text-sm text-stone-500">“{b.notes}”</p>}
                <p className="mt-1 text-xs text-stone-400">
                  Booked {new Date(b.created_at).toLocaleString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {b.urgent && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      ⚡ Fast
                    </span>
                  )}
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                    {b.payment_method === 'cod' ? 'Cash at salon (COD)' : b.payment_method}
                  </span>
                  {b.area && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                      📍 {b.area}
                    </span>
                  )}
                  {b.verified ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500">
                      Unverified
                    </span>
                  )}
                  {b.location_verified && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                      ✓ Location verified
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? 'bg-stone-200 text-stone-600'}`}
              >
                {b.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {b.status !== 'confirmed' && (
                <button
                  onClick={() => patchBooking(b.id, { status: 'confirmed' })}
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Confirm
                </button>
              )}
              {b.status !== 'completed' && (
                <button
                  onClick={() => patchBooking(b.id, { status: 'completed' })}
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  Mark done
                </button>
              )}
              {b.status !== 'cancelled' && (
                <button
                  onClick={() => patchBooking(b.id, { status: 'cancelled' })}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => patchBooking(b.id, { verified: !b.verified })}
                className="rounded-full border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                title="Tap after confirming the booking by phone with the customer."
              >
                {b.verified ? 'Unmark verified' : 'Mark verified'}
              </button>
              <button
                onClick={() =>
                  patchBooking(b.id, { location_verified: !b.location_verified })
                }
                className="rounded-full border border-sky-600 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                title="Tap after confirming the customer's area on the call."
              >
                {b.location_verified ? 'Unmark location' : 'Mark location verified'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
