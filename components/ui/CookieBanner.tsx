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
      className="fixed bottom-0 left-0 right-0 z-[250] flex items-center justify-between gap-4 px-8 py-4"
      style={{
        background: 'rgba(17,22,32,0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--bdr)',
      }}
    >
      <p className="text-[13px] leading-[1.5]" style={{ color: 'var(--text2)' }}>
        Pouzivame cookies pro analytiku a zlepseni webu. Zadne osobni udaje nesdilime s tretimi stranami.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={decline}
          className="font-cond text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-md border-none cursor-pointer transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--text3)' }}
        >
          Odmitnout
        </button>
        <button
          onClick={accept}
          className="font-cond text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-md border-none cursor-pointer"
          style={{ background: 'var(--gold)', color: '#000' }}
        >
          Prijmout
        </button>
      </div>
    </div>
  )
}
