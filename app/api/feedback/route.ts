import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { SERVICES } from '@/lib/services'

const SERVICE_NAMES = SERVICES.map((s) => s.name)

/**
 * POST /api/feedback — public form. New feedback is hidden (visible=false)
 * until the salon approves it in /admin. There is no public GET route.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const name = String(data.name ?? '').trim()
  const message = String(data.message ?? '').trim()
  const service = String(data.service ?? '').trim()
  const ratingRaw = data.rating
  const rating =
    typeof ratingRaw === 'number'
      ? ratingRaw
      : Number.parseInt(String(ratingRaw ?? ''), 10)

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please pick a star rating (1–5).' }, { status: 400 })
  }
  if (message.length < 2 || message.length > 500) {
    return NextResponse.json(
      { error: 'Please write a short message (up to 500 characters).' },
      { status: 400 }
    )
  }
  if (service && !SERVICE_NAMES.includes(service)) {
    return NextResponse.json({ error: 'Please choose a real service.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: row, error } = await supabase
    .from('glossngrace_feedback')
    .insert({
      name,
      rating,
      message,
      service: service || null,
      visible: false,
    })
    .select('id')
    .single()

  if (error || !row) {
    return NextResponse.json(
      { error: 'Feedback could not be saved. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
}
