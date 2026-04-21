'use client'

const items = [
  { label: 'Live', text: 'Lamborghini Countach −35 % na Alze — platí dnes do půlnoci' },
  { label: 'Live', text: 'Porsche 911 RSR · 75912 — Retiring soon' },
  { label: 'Live', text: 'Hall of Fame #1: Lotus Evija 9.8/10' },
]

export function Ticker() {
  // V2 design: top bar is static (not scrolling). Show first item; rotate via CSS later if needed.
  const item = items[0]

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[201] flex items-center justify-between"
      style={{
        background: 'var(--ink)',
        height: 34,
        padding: '0 var(--px)',
      }}
    >
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: '#4CAF50',
            animation: 'live-pulse 2s ease-in-out infinite',
          }}
        />
        <span>
          <strong style={{ color: 'white', fontWeight: 600 }}>{item.label}:</strong>{' '}
          {item.text}
        </span>
      </div>
      <div className="hidden md:flex gap-5">
        <a
          href="#"
          className="text-[11px] no-underline transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}
        >
          speedchampions.cz
        </a>
        <a
          href="#"
          className="text-[11px] no-underline transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}
        >
          speedchampions.eu
        </a>
      </div>
    </div>
  )
}
