'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) {
      setError('Wrong email or password. Please try again.')
      return
    }
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-rose-100">
      <p className="text-center text-2xl font-semibold text-[#3d2b2b]">GlossnGrace</p>
      <p className="mt-1 text-center text-sm text-stone-500">Admin sign in</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="admin email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            placeholder="••••••••"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[#c98a7d] py-3 text-sm font-semibold text-white transition hover:bg-[#b97768] disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
