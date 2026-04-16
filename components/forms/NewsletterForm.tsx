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
      className="relative overflow-hidden rounded-xl flex items-center justify-between gap-7 px-10 py-9 mb-12"
      style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}
    >
      {/* Gold glow */}
      <div className="absolute -right-[60px] -bottom-[60px] w-[280px] h-[280px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)' }} />

      <div>
        <div className="font-serif font-black tracking-[-0.02em] text-[26px] mb-1.5" style={{ color: 'var(--text)' }}>
          Kazde pondeli do inboxu —<br />
          <span style={{ color: 'var(--gold)' }}>ceny, DNA, novinky.</span>
        </div>
        <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--text2)' }}>
          Zadny spam. Jen to co Speed Champions fanousek skutecne potrebuje vedet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2.5 shrink-0 relative z-[1]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tvuj@email.cz"
          required
          className="font-sans text-[13px] px-4 py-2.5 rounded-md w-[220px] outline-none transition-colors duration-150 focus:border-[var(--gold)]"
          style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-md border-none cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-gold2"
          style={{ background: 'var(--gold)', color: '#000' }}
        >
          {status === 'loading' ? '...' : status === 'success' ? 'Hotovo!' : 'Prihlasit se →'}
        </button>
      </form>
    </div>
  )
}
