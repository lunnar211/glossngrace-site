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
    .select('id, name, phone, service, booking_date, booking_time, notes, status, created_at')
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
  const status = String(data.status ?? '').trim()
  if (!id || !(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid booking or status.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_bookings')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
