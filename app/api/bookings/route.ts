import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const VALID_SERVICES = [
  'Classic Manicure',
  'Gel Manicure',
  'Acrylic Nails',
  'Nail Art Design',
  'French Manicure',
  'Pedicure',
  'Nail Extensions',
  'Bridal Nails',
] as const

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

/**
 * GET /api/bookings?date=YYYY-MM-DD
 * Availability only: returns the booked time strings for that date.
 * No personal data is ever returned here.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? ''

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('glossngrace_bookings')
    .select('booking_time')
    .eq('booking_date', date)
    .neq('status', 'cancelled')

  if (error) {
    return NextResponse.json(
      { error: 'Could not check availability.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    date,
    booked: (data ?? []).map((row) => row.booking_time as string),
  })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const name = String(data.name ?? '').trim()
  const phone = String(data.phone ?? '').trim()
  const service = String(data.service ?? '').trim()
  const booking_date = String(data.booking_date ?? '').trim()
  const booking_time = String(data.booking_time ?? '').trim()
  const notes = String(data.notes ?? '').trim()
  const urgent = data.urgent === true
  const payment_method = String(data.payment_method ?? 'cod').trim()
  const area = String(data.area ?? '').trim()

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!/^[+0-9][0-9 ()-]{6,17}$/.test(phone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
  }
  if (!(VALID_SERVICES as readonly string[]).includes(service)) {
    return NextResponse.json({ error: 'Please choose a service.' }, { status: 400 })
  }
  if (!isValidDate(booking_date)) {
    return NextResponse.json({ error: 'Please pick a date from today onwards.' }, { status: 400 })
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(booking_time)) {
    return NextResponse.json({ error: 'Please pick a time.' }, { status: 400 })
  }
  if (notes.length > 500) {
    return NextResponse.json({ error: 'Notes are too long.' }, { status: 400 })
  }
  if (payment_method === 'online') {
    return NextResponse.json(
      { error: 'Online payment is not available yet — please choose cash at salon.' },
      { status: 400 }
    )
  }
  if (payment_method !== 'cod') {
    return NextResponse.json({ error: 'Please choose a payment method.' }, { status: 400 })
  }
  if (area.length > 80) {
    return NextResponse.json({ error: 'Area is too long.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: row, error } = await supabase
    .from('glossngrace_bookings')
    .insert({
      name,
      phone,
      service,
      booking_date,
      booking_time,
      notes: notes || null,
      status: 'pending',
      urgent,
      payment_method,
      area: area || null,
    })
    .select('id')
    .single()

  if (error || !row) {
    return NextResponse.json(
      { error: 'Booking could not be saved. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
}
