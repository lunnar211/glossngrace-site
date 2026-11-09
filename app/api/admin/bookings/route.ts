import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('glossngrace_bookings')
    .select('id, name, phone, service, booking_date, booking_time, notes, status, created_at, urgent, payment_method, area, verified, location_verified')
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 500 })
  }
  return NextResponse.json({ bookings: data ?? [] })
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const id = String(data.id ?? '').trim()
  if (!id) {
    return NextResponse.json({ error: 'Invalid booking.' }, { status: 400 })
  }

  // Status is optional when only toggling verification flags.
  const updates: Record<string, unknown> = {}
  if (data.status !== undefined) {
    const status = String(data.status).trim()
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Invalid booking or status.' }, { status: 400 })
    }
    updates.status = status
  }
  if (typeof data.verified === 'boolean') updates.verified = data.verified
  if (typeof data.location_verified === 'boolean')
    updates.location_verified = data.location_verified
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_bookings')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
