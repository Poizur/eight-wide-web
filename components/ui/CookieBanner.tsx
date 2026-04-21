'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-[480px] z-[250] flex items-center justify-between gap-4 px-5 py-4 rounded-xl shadow-card-hv"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
      }}
    >
      <p className="text-[13px] leading-[1.5]" style={{ color: 'var(--ink2)' }}>
        Používáme cookies pro analytiku. Žádné osobní údaje nesdílíme.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={decline}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-md border-none cursor-pointer transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          Odmítnout
        </button>
        <button
          onClick={accept}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-md border-none cursor-pointer"
          style={{ background: 'var(--ink)', color: 'white' }}
        >
          Přijmout
        </button>
      </div>
    </div>
  )
}
