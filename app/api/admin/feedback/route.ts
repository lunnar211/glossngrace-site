import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('glossngrace_feedback')
    .select('id, name, rating, message, service, visible, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: 'Could not load feedback.' }, { status: 500 })
  }
  return NextResponse.json({ feedback: data ?? [] })
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
  const visible = data.visible
  if (!id || typeof visible !== 'boolean') {
    return NextResponse.json({ error: 'Invalid feedback or visibility.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_feedback')
    .update({ visible })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not update feedback.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
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
    return NextResponse.json({ error: 'Invalid feedback.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_feedback')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not delete feedback.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
