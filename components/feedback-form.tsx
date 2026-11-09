'use client'

import { useState } from 'react'
import { SERVICES } from '@/lib/services'

/**
 * Public "Leave feedback" form. New feedback is hidden until the salon
 * approves it in the admin panel — nothing shows on the site by itself.
 */
export default function FeedbackForm() {
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter your name.')
      return
    }
    if (rating < 1 || rating > 5) {
      setError('Please pick a star rating.')
      return
    }
    if (message.trim().length < 2) {
      setError('Please write a short message.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          service: service || undefined,
          rating,
          message: message.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Feedback could not be saved. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Feedback could not be saved. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-blush bg-white p-5 text-[15px] leading-relaxed shadow-sm">
        <p className="font-display text-xl font-semibold">Thank you! 💅</p>
        <p className="mt-2 text-plum-soft">
          Your feedback is in. The salon will read it, and it will show on
          this page once it is approved.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-blush bg-white p-5 shadow-sm"
    >
      <h3 className="font-display text-xl font-semibold">Leave feedback</h3>
      <p className="mt-1 text-sm text-plum-soft">
        Had your nails done with us? Tell us how it went.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="feedback-name" className="block text-sm font-medium">
            Your name
          </label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-blush bg-ivory px-3 text-base"
          />
        </div>

        <div>
          <label htmlFor="feedback-service" className="block text-sm font-medium">
            Service <span className="font-normal text-plum-soft">(optional)</span>
          </label>
          <select
            id="feedback-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-blush bg-ivory px-3 text-base"
          >
            <option value="">— No specific service —</option>
            {SERVICES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium">Your rating</legend>
          <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => setRating(n)}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
                  rating >= n ? 'text-gold' : 'text-stone-300 hover:text-gold/60'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="feedback-message" className="block text-sm font-medium">
            Your message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How was your appointment?"
            rows={3}
            maxLength={500}
            className="mt-1 w-full rounded-xl border border-blush bg-ivory px-3 py-2 text-base"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-7 font-semibold text-white transition hover:bg-plum disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </form>
  )
}
