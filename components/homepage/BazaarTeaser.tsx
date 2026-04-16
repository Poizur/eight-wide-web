'use client'

import { useState } from 'react'

const features = [
  { icon: '01', title: 'Retired sety', desc: 'Sety ktere uz LEGO nevyrabi — zde je jeste najdes' },
  { icon: '02', title: 'Investicni analyza', desc: 'Kazdy inzerat doplnen o BrickEconomy data' },
  { icon: '03', title: 'Verified sellers', desc: 'Overeni prodejci, hodnoceni, historia transakci' },
]

export function BazaarTeaser() {
  const [email, setEmail] = useState('')

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className="max-w-content mx-auto px-8">
        <div
          className="grid items-center gap-16 py-14"
          style={{ gridTemplateColumns: '1fr 380px', borderTop: '1px solid var(--bdr)' }}
        >
          {/* Left */}
          <div>
            <div className="font-cond text-[10px] font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <span className="block w-6 h-px" style={{ background: 'var(--gold)' }} />
              Pripravujeme
            </div>
            <div className="font-serif font-bold tracking-[-0.02em] leading-[1.1] mb-4" style={{ fontSize: 'clamp(28px,3vw,42px)', color: 'var(--text)' }}>
              Bazaar — kup & prodej<br />Speed Champions
            </div>
            <p className="text-[15px] leading-[1.65] max-w-[480px] mb-7" style={{ color: 'var(--text2)' }}>
              Dedikovany marketplace pro SC komunitu. Retired sety, otevrene boxy, cele sbirky. Bez poplatku, jen mezi fanousky.
            </p>
            <div className="flex gap-8 mb-6">
              {[
                { n: '847', l: 'ctenaru ceka' },
                { n: 'Q3 2026', l: 'spusteni' },
                { n: 'zdarma', l: 'pro cleny' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-cond text-2xl font-black leading-none" style={{ color: 'var(--gold)' }}>{s.n}</div>
                  <div className="font-cond text-[10px] tracking-[0.15em] uppercase mt-[3px]" style={{ color: 'var(--text3)' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2.5 max-w-[420px]"
              onSubmit={(e) => {
                e.preventDefault()
                // TODO: submit to /api/waitlist
                setEmail('')
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Notifikovat me pri spusteni"
                className="font-sans text-[13px] px-4 py-2.5 rounded-md flex-1 outline-none transition-colors duration-150 focus:border-[var(--gold)]"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text)',
                }}
              />
              <button
                type="submit"
                className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-md border-none cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-gold2"
                style={{ background: 'var(--gold)', color: '#000' }}
              >
                Chci vedet →
              </button>
            </form>
          </div>

          {/* Right - features */}
          <div className="flex flex-col gap-[2px]">
            {features.map((f) => (
              <div
                key={f.icon}
                className="flex gap-4 items-start px-5 py-[18px] transition-colors duration-200 hover:border-l-[var(--gold)]"
                style={{
                  background: 'var(--sur)',
                  borderLeft: '2px solid var(--bdr)',
                }}
              >
                <div className="font-cond text-[13px] font-black shrink-0 mt-0.5" style={{ color: 'var(--gold)', opacity: 0.5 }}>
                  {f.icon}
                </div>
                <div>
                  <div className="font-cond text-[13px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: 'var(--text)' }}>
                    {f.title}
                  </div>
                  <div className="text-xs leading-[1.5]" style={{ color: 'var(--text3)' }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
