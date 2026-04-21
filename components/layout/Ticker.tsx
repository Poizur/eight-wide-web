'use client'

export function Ticker() {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: 'var(--ink)',
        padding: '7px var(--px)',
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
          Live: <strong style={{ color: 'white', fontWeight: 600 }}>Lamborghini Countach −35 % na Alze</strong> — platí dnes do půlnoci
        </span>
      </div>
      <div className="hidden md:flex gap-5">
        <a
          href="https://speedchampions.cz"
          className="text-[11px] no-underline transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}
        >
          speedchampions.cz
        </a>
        <a
          href="https://speedchampions.eu"
          className="text-[11px] no-underline transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}
        >
          speedchampions.eu
        </a>
      </div>
    </div>
  )
}
