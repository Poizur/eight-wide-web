import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'
import type { ReactNode } from 'react'

interface IconsReviewProps {
  setNumber: string
  legoLine: 'icons' | 'technic'
  name: string
  pieces: number
  priceCzk: number
  buildTime?: string
  difficulty?: string
  status?: string
  children?: ReactNode
}

export function IconsReview({
  setNumber,
  legoLine,
  name,
  pieces,
  priceCzk,
  buildTime,
  difficulty,
  status = 'Dostupny',
  children,
}: IconsReviewProps) {
  return (
    <div
      className="my-10 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--bdr)' }}
    >
      {/* Gold top bar */}
      <div
        className="px-5 py-2.5 font-cond text-[10px] font-bold tracking-[0.2em] uppercase"
        style={{ background: 'var(--gold)', color: '#000' }}
      >
        {legoLine.toUpperCase()} · Set {setNumber}
      </div>

      {/* Header: photo + info */}
      <div className="grid grid-cols-2 gap-0" style={{ background: 'var(--sur)' }}>
        <div className="group relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Image
            src={setImageUrl(setNumber)}
            alt={name}
            fill
            className="object-cover photo-dark"
            sizes="50vw"
          />
        </div>
        <div className="p-6 flex flex-col justify-center">
          <div className="font-cond text-xl font-black uppercase leading-[1.1] mb-1" style={{ color: 'var(--text)' }}>
            {name}
          </div>
          <div className="font-cond text-[13px] mb-4" style={{ color: 'var(--text2)' }}>
            {pieces.toLocaleString('cs-CZ')} dilku · {formatCZK(priceCzk)}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase flex items-center gap-1.5" style={{ color: 'var(--green)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
              {status}
            </div>
            {buildTime && (
              <div className="font-cond text-[11px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>
                Stavba: {buildTime} · {difficulty ?? ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prose content */}
      {children && (
        <div
          className="px-6 py-5 text-[15px] leading-[1.7]"
          style={{ background: 'var(--sur)', borderTop: '1px solid var(--bdr)', color: 'var(--text2)' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
