'use client'

const items = [
  'LEGO 76934 Ferrari F40 — NOVE',
  'Porsche 911 RSR #75912 — RETIRING SOON',
  'Hall of Fame #1: Lotus Evija 9.8/10',
  'Paddock: Nissan Skyline GT-R R34 — LIKELY',
  'Pit Stop: Alza sleva -15% na McLaren',
]

export function Ticker() {
  const doubled = [...items, ...items]

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[201] overflow-hidden"
      style={{
        background: 'var(--red)',
        height: 28,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="ticker-track flex whitespace-nowrap">
        {doubled.map((text, i) => (
          <span
            key={i}
            className="font-cond text-[11px] font-bold tracking-[0.14em] uppercase mx-8"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {text}
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
