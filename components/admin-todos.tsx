'use client'

import { useCallback, useEffect, useState } from 'react'

type Todo = {
  id: string
  title: string
  done: boolean
  created_at: string
}

/** Admin to-do list — salon tasks, checked off as they are done. */
export default function AdminTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/todos')
    if (!res.ok) {
      setError('Could not load to-dos.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setTodos(data.todos ?? [])
    setLoading(false)
  }, [])

  // Initial load: fetch inside the effect so no setState runs
  // synchronously in the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/admin/todos')
      if (cancelled) return
      if (!res.ok) {
        setError('Could not load to-dos.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (cancelled) return
      setTodos(data.todos ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const value = title.trim()
    if (!value) return
    setAdding(true)
    const res = await fetch('/api/admin/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    })
    setAdding(false)
    if (res.ok) {
      setTitle('')
      load()
    }
  }

  async function toggle(id: string, done: boolean) {
    const res = await fetch('/api/admin/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, done }),
    })
    if (res.ok) load()
  }

  async function remove(id: string) {
    const res = await fetch('/api/admin/todos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) load()
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl">
      <h2 className="text-2xl font-semibold text-[#3d2b2b]">To-do list</h2>
      <p className="mt-1 text-sm text-stone-500">
        Salon tasks — check them off as they are done.
      </p>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a to-do…"
          maxLength={200}
          className="min-h-[44px] flex-1 rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="rounded-full bg-[#c98a7d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b97768] disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {loading && <p className="mt-4 text-sm text-stone-500">Loading to-dos…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && todos.length === 0 && (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-stone-500 shadow-sm">
          No to-dos yet. Add your first one above.
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {todos.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id, !t.done)}
              aria-label={`Mark "${t.title}" as ${t.done ? 'not done' : 'done'}`}
              className="h-5 w-5 shrink-0 accent-[#c98a7d]"
            />
            <span
              className={`flex-1 text-sm ${
                t.done ? 'text-stone-400 line-through' : 'text-stone-700'
              }`}
            >
              {t.title}
            </span>
            <button
              onClick={() => remove(t.id)}
              aria-label={`Delete "${t.title}"`}
              className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
