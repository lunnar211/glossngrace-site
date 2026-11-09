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
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-sky-100 text-sky-800',
  cancelled: 'bg-stone-200 text-stone-600',
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

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(id: string, status: string) {
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) load()
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  const visible = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

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

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
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
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {b.service} · {b.booking_date} at {b.booking_time}
                </p>
                {b.notes && <p className="mt-1 text-sm text-stone-500">“{b.notes}”</p>}
                <p className="mt-1 text-xs text-stone-400">
                  Booked {new Date(b.created_at).toLocaleString()}
                </p>
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
                  onClick={() => setStatus(b.id, 'confirmed')}
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Confirm
                </button>
              )}
              {b.status !== 'completed' && (
                <button
                  onClick={() => setStatus(b.id, 'completed')}
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  Mark done
                </button>
              )}
              {b.status !== 'cancelled' && (
                <button
                  onClick={() => setStatus(b.id, 'cancelled')}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
