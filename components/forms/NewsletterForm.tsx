'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      className="relative overflow-hidden flex items-center justify-between gap-8 px-12 py-10 mb-12 flex-wrap rounded-2xl"
      style={{ background: 'var(--ink)' }}
    >
      {/* Subtle red orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: -60,
          top: -60,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(200,40,30,0.08)',
        }}
      />

      <div className="relative z-[1]">
        <div
          className="font-serif mb-2"
          style={{ fontSize: 28, color: 'white', lineHeight: 1.2 }}
        >
          Co stojí za to, <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>rovnou do mailu.</em>
        </div>
        <p className="text-[13px] leading-[1.55]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Nový DNA článek, sleva nad 20 %, retiring warning. Bez spamu. Každé pondělí.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2.5 shrink-0 relative z-[1]"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tvůj@email.cz"
          required
          className="text-[13px] px-4 py-[11px] rounded-lg w-[240px] outline-none transition-colors"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
            fontFamily: 'var(--sans)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="text-[13px] font-semibold px-5 py-[11px] rounded-lg border-none cursor-pointer whitespace-nowrap transition-colors hover:bg-[#eee]"
          style={{ background: 'white', color: 'var(--ink)', fontFamily: 'var(--sans)' }}
        >
          {status === 'loading' ? '...' : status === 'success' ? 'Hotovo!' : 'Chci to →'}
        </button>
      </form>
    </div>
  )
}
