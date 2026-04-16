import Link from 'next/link'

const bgCars = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=40',
  'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=400&q=40',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=400&q=40',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=40',
  'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=400&q=40',
]

const suggestions = [
  { href: '/dna', series: 'DNA Series', name: 'Pribehy aut + LEGO recenze' },
  { href: '/hof', series: 'Hall of Fame', name: 'Nejlepsi Speed Champions ever' },
  { href: '/paddock', series: 'Paddock Rumors', name: 'Co prijde priste?' },
]

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden relative" style={{ minHeight: 'calc(100vh - var(--nav-h) - 28px)' }}>
      {/* Giant 404 background text */}
      <div
        className="absolute font-cond font-black leading-none pointer-events-none select-none"
        style={{
          fontSize: 'clamp(280px,38vw,520px)',
          color: 'rgba(255,255,255,0.018)',
          letterSpacing: '-0.06em',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      >
        404
      </div>

      {/* Grid of dark car photos */}
      <div
        className="absolute inset-0 grid grid-cols-5 gap-[2px] pointer-events-none"
        style={{ opacity: 0.06 }}
      >
        {bgCars.map((src, i) => (
          <div key={i} className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" style={{ filter: 'saturate(0)' }} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-[2] text-center px-8 max-w-[600px]">
        {/* Status badge with blinking red dot */}
        <div
          className="inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 mb-7"
          style={{
            background: 'rgba(200,40,30,0.08)',
            border: '1px solid rgba(200,40,30,0.2)',
          }}
        >
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{
              background: 'var(--red)',
              animation: 'blink-404 1s ease-in-out infinite',
            }}
          />
          <span className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--red)' }}>
            Signal Lost — 404
          </span>
        </div>

        {/* Error code */}
        <div
          className="font-cond font-black leading-none tracking-[-0.04em] mb-1"
          style={{ fontSize: 'clamp(80px,12vw,120px)', color: 'var(--text)' }}
        >
          4<span style={{ color: 'var(--gold)' }}>0</span>4
        </div>

        {/* Title */}
        <div
          className="font-serif font-bold tracking-[-0.02em] leading-[1.2] mb-4"
          style={{ fontSize: 'clamp(24px,3vw,36px)', color: 'var(--text2)' }}
        >
          Tato stranka<br />skoncila v barierach.
        </div>

        {/* Description */}
        <p className="text-[15px] leading-[1.65] max-w-[400px] mx-auto mb-9" style={{ color: 'var(--text3)' }}>
          Bud jsi zadal spatnou adresu, nebo jsme stranku prestehovali. Kazdopadne — neni to tvoje chyba, je to nase.
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap mb-12">
          <Link
            href="/"
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-7 py-3 rounded-lg no-underline transition-opacity duration-200 hover:opacity-85"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            ← Zpet na hlavni
          </Link>
          <Link
            href="/sety"
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-7 py-[11px] rounded-lg no-underline transition-all duration-200 hover:border-[rgba(255,255,255,0.18)]"
            style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}
          >
            Databaze setu
          </Link>
          <Link
            href="/ceny"
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-7 py-[11px] rounded-lg no-underline transition-all duration-200 hover:border-[rgba(255,255,255,0.18)]"
            style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}
          >
            Ceny & slevy
          </Link>
        </div>

        {/* Suggested links */}
        <div className="pt-8" style={{ borderTop: '1px solid var(--bdr)' }}>
          <div className="font-cond text-[10px] font-bold tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--text3)' }}>
            Mozna hledas toto —
          </div>
          <div className="grid grid-cols-3 gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group block text-left no-underline rounded-lg p-3.5 transition-all duration-200 hover:bg-sur2"
                style={{
                  background: 'var(--sur)',
                  border: '1px solid var(--bdr)',
                }}
              >
                <div className="font-cond text-[9px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--gold)' }}>
                  {s.series}
                </div>
                <div className="font-cond text-[13px] font-black uppercase leading-[1.2]" style={{ color: 'var(--text)' }}>
                  {s.name}
                </div>
                <span className="block text-sm mt-2 transition-colors duration-150 group-hover:text-gold" style={{ color: 'var(--text3)' }}>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink-404 {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
