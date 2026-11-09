'use client'

import { useCallback, useEffect, useState } from 'react'

type FeedbackItem = {
  id: string
  name: string
  rating: number
  message: string
  service: string | null
  visible: boolean
  created_at: string
}

/**
 * Admin feedback list — newest first. "Show on website" makes the
 * feedback appear on the home page; Delete removes it for good.
 * New feedback arrives hidden (visible=false) by default.
 */
export default function AdminFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/feedback')
    if (!res.ok) {
      setError('Could not load feedback.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.feedback ?? [])
    setLoading(false)
  }, [])

  // Initial load: fetch inside the effect so no setState runs
  // synchronously in the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/admin/feedback')
      if (cancelled) return
      if (!res.ok) {
        setError('Could not load feedback.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (cancelled) return
      setItems(data.feedback ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function setVisible(id: string, visible: boolean) {
    const res = await fetch('/api/admin/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, visible }),
    })
    if (res.ok) load()
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete this feedback from ${name}? This cannot be undone.`)) return
    const res = await fetch('/api/admin/feedback', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) load()
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl">
      <h2 className="text-2xl font-semibold text-[#3d2b2b]">Feedback</h2>
      <p className="mt-1 text-sm text-stone-500">
        New feedback is hidden until you show it. Only shown feedback appears
        on the home page.
      </p>

      {loading && <p className="mt-4 text-sm text-stone-500">Loading feedback…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-stone-500 shadow-sm">
          No feedback yet.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {items.map((f) => (
          <article key={f.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#3d2b2b]">
                  {f.name}
                  {f.service && (
                    <span className="font-normal text-stone-500"> · {f.service}</span>
                  )}
                </p>
                <p className="mt-1 text-gold" aria-label={`${f.rating} out of 5 stars`}>
                  {'★'.repeat(f.rating)}
                  {'☆'.repeat(5 - f.rating)}
                </p>
                <p className="mt-1 text-sm text-stone-600">“{f.message}”</p>
                <p className="mt-1 text-xs text-stone-400">
                  {new Date(f.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  f.visible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {f.visible ? 'Shown on website' : 'Hidden'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setVisible(f.id, !f.visible)}
                className="rounded-full bg-[#c98a7d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#b97768]"
              >
                {f.visible ? 'Hide from website' : 'Show on website'}
              </button>
              <button
                onClick={() => remove(f.id, f.name)}
                className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
