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
    .from('glossngrace_todos')
    .select('id, title, done, created_at')
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: 'Could not load to-dos.' }, { status: 500 })
  }
  return NextResponse.json({ todos: data ?? [] })
}

export async function POST(request: Request) {
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
  const title = String(data.title ?? '').trim()
  if (title.length < 1 || title.length > 200) {
    return NextResponse.json({ error: 'Please write a to-do (up to 200 characters).' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: row, error } = await supabase
    .from('glossngrace_todos')
    .insert({ title, done: false })
    .select('id')
    .single()

  if (error || !row) {
    return NextResponse.json({ error: 'To-do could not be saved.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
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
  const done = data.done
  if (!id || typeof done !== 'boolean') {
    return NextResponse.json({ error: 'Invalid to-do.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_todos')
    .update({ done })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not update to-do.' }, { status: 500 })
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
    return NextResponse.json({ error: 'Invalid to-do.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('glossngrace_todos')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not delete to-do.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
