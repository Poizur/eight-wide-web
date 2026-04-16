'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const LAUNCH_DATE = new Date('2026-09-01T00:00:00')

const features = [
  { n: '01', title: 'Retired sety', desc: 'Sety ktere uz LEGO nevyrabi — zde je jeste najdes za rozumnou cenu.' },
  { n: '02', title: 'Investicni analyza', desc: 'Kazdy inzerat automaticky doplneny o BrickLink data a ROI kalkulaci.' },
  { n: '03', title: 'Verified sellers', desc: 'Overeni prodejci s hodnocenim a historii transakci.' },
  { n: '04', title: 'Price alerts', desc: 'Nastav cilovou cenu — upozornime te kdyz se na bazaru objevi.' },
  { n: '05', title: 'Kolekce', desc: 'Ukazuj svou sbirku, sleduj ostatni, inspiruj se displayi.' },
  { n: '06', title: 'Chat', desc: 'Primá komunikace mezi kupujicim a prodavajicim. Zadni prostrednici.' },
]

const mockListings = [
  { name: 'Ferrari F40 · 76934', price: '589 Kc', seller: 'tomas_sc', status: 'Zabaleny' },
  { name: 'Porsche 911 RSR · 75912', price: '1 290 Kc', seller: 'brick_invest', status: 'Retired' },
  { name: 'Lotus Evija · 76907', price: '449 Kc', seller: 'speed_fan', status: 'Otevreny' },
  { name: 'McLaren Senna · 76909', price: '1 680 Kc', seller: 'lego_cz', status: 'Sealed' },
]

export default function KomunitaPage() {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [waitlistCount, setWaitlistCount] = useState(847)
  const [email, setEmail] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      const diff = LAUNCH_DATE.getTime() - now.getTime()
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return }
      setCountdown({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // Simulate counter growth
  useEffect(() => {
    const t = setInterval(() => {
      setWaitlistCount(c => c + (Math.random() > 0.7 ? 1 : 0))
    }, 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden flex items-center" style={{ minHeight: 'calc(100vh - var(--nav-h) - 28px)' }}>
        {/* Large BG text */}
        <div className="absolute font-cond font-black leading-none pointer-events-none select-none" style={{ fontSize: 'clamp(140px,22vw,320px)', color: 'rgba(255,255,255,0.015)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap' }}>
          BAZAAR
        </div>

        <div className="max-w-content mx-auto px-8 w-full relative z-[2] grid items-center gap-12" style={{ gridTemplateColumns: '1fr 420px' }}>
          {/* Left */}
          <div>
            <div className="font-cond text-[10px] font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <span className="block w-6 h-px" style={{ background: 'var(--gold)' }} />
              Pripravujeme · Q3 2026
            </div>
            <h1 className="font-serif font-black tracking-[-0.02em] leading-[1.05] mb-4" style={{ fontSize: 'clamp(44px,5.5vw,72px)', color: 'var(--text)' }}>
              Bazaar — kup & prodej<br />Speed Champions
            </h1>
            <p className="text-[15px] leading-[1.65] max-w-[480px] mb-8" style={{ color: 'var(--text2)' }}>
              Dedikovany marketplace pro SC komunitu. Retired sety, otevrene boxy, cele sbirky. Bez poplatku, jen mezi fanousky.
            </p>

            {/* Countdown */}
            <div className="flex gap-4 mb-8">
              {[
                { val: countdown.d, label: 'Dnu' },
                { val: countdown.h, label: 'Hodin' },
                { val: countdown.m, label: 'Minut' },
                { val: countdown.s, label: 'Sekund' },
              ].map((c, i) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-cond text-[40px] font-black leading-none" style={{ color: 'var(--gold)' }}>
                      {String(c.val).padStart(2, '0')}
                    </div>
                    <div className="font-cond text-[9px] tracking-[0.16em] uppercase mt-1" style={{ color: 'var(--text3)' }}>
                      {c.label}
                    </div>
                  </div>
                  {i < 3 && <span className="font-cond text-[28px] font-black" style={{ color: 'var(--text3)' }}>:</span>}
                </div>
              ))}
            </div>

            {/* Waitlist count */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-cond text-2xl font-black" style={{ color: 'var(--gold)' }}>{waitlistCount.toLocaleString('cs-CZ')}</span>
              <span className="font-cond text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--text3)' }}>ctenaru ceka</span>
            </div>

            {/* Email form */}
            <form
              className="flex gap-2.5 max-w-[420px]"
              onSubmit={(e) => {
                e.preventDefault()
                setEmail('')
                setWaitlistCount(c => c + 1)
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Notifikovat me pri spusteni"
                className="flex-1 px-4 py-2.5 rounded-md font-sans text-[13px] outline-none transition-colors focus:border-[var(--gold)]"
                style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
              />
              <button type="submit" className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-md border-none cursor-pointer whitespace-nowrap" style={{ background: 'var(--gold)', color: '#000' }}>
                Chci vedet →
              </button>
            </form>
          </div>

          {/* Right — blurred marketplace preview */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <span className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>Marketplace preview</span>
              <span className="font-cond text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: 'var(--gold)' }}>Coming soon</span>
            </div>
            {mockListings.map((item, i) => (
              <div
                key={i}
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom: i < mockListings.length - 1 ? '1px solid var(--bdr)' : 'none',
                  opacity: i === 0 ? 1 : 0.4,
                  filter: i === 0 ? 'none' : 'blur(4px)',
                }}
              >
                <div>
                  <div className="font-cond text-xs font-bold uppercase" style={{ color: 'var(--text)' }}>{item.name}</div>
                  <div className="font-cond text-[10px]" style={{ color: 'var(--text3)' }}>@{item.seller} · {item.status}</div>
                </div>
                <div className="font-cond text-sm font-black" style={{ color: 'var(--gold)' }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-content mx-auto px-8 py-12 pb-20">
        <div className="grid grid-cols-3 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
          {features.map(f => (
            <div key={f.n} className="p-5 relative" style={{ background: 'var(--sur)' }}>
              <div className="absolute top-3 right-4 font-cond text-[40px] font-black leading-none pointer-events-none" style={{ color: 'rgba(255,255,255,0.03)' }}>{f.n}</div>
              <div className="font-cond text-[13px] font-black opacity-50 mb-2" style={{ color: 'var(--gold)' }}>{f.n}</div>
              <div className="font-cond text-[13px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: 'var(--text)' }}>{f.title}</div>
              <div className="text-xs leading-[1.5]" style={{ color: 'var(--text3)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
