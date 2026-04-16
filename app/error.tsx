'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: 'calc(100vh - var(--nav-h) - 28px)' }}>
      <div className="text-center px-8 max-w-[500px]">
        <div
          className="inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 mb-7"
          style={{ background: 'rgba(200,40,30,0.08)', border: '1px solid rgba(200,40,30,0.2)' }}
        >
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--red)' }} />
          <span className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--red)' }}>
            Chyba
          </span>
        </div>

        <div className="font-serif font-semibold text-[32px] leading-[1.2] mb-4" style={{ color: 'var(--text2)' }}>
          Neco se pokazilo.
        </div>
        <p className="text-[15px] leading-[1.65] mb-8" style={{ color: 'var(--text3)' }}>
          {error.message || 'Neocekavana chyba. Zkus to znovu nebo se vrat na hlavni stranku.'}
        </p>

        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={reset}
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-7 py-3 rounded-lg border-none cursor-pointer transition-opacity duration-200 hover:opacity-85"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            Zkusit znovu
          </button>
          <Link
            href="/"
            className="font-cond text-xs font-bold tracking-[0.14em] uppercase px-7 py-[11px] rounded-lg no-underline transition-all duration-200"
            style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}
          >
            Hlavni stranka
          </Link>
        </div>
      </div>
    </div>
  )
}
