'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle logout
  if (searchParams.get('logout') === '1') {
    const supabase = createClient()
    supabase.auth.signOut().then(() => router.replace('/admin/login'))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[380px] px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-6 h-[2px] mx-auto mb-2" style={{ background: 'var(--gold)' }} />
          <div className="font-sans text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Eight <span style={{ color: 'var(--gold)' }}>Wide</span>
          </div>
          <div className="font-cond text-[9px] tracking-[0.22em] uppercase mt-1" style={{ color: 'var(--text3)' }}>
            Admin Panel
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="px-4 py-3 rounded-lg font-sans text-sm outline-none transition-colors focus:border-[var(--gold)]"
              style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Heslo</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="px-4 py-3 rounded-lg font-sans text-sm outline-none transition-colors focus:border-[var(--gold)]"
              style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', color: 'var(--text)' }}
            />
          </div>

          {error && (
            <div className="font-cond text-xs px-3 py-2 rounded" style={{ background: 'rgba(200,40,30,0.12)', color: '#E8715B' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase py-3 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            {loading ? 'Prihlasovani...' : 'Prihlasit se'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg)' }} />}>
      <LoginForm />
    </Suspense>
  )
}
