import Image from 'next/image'
import Link from 'next/link'
import type { Article, LegoSet } from '@/lib/supabase/types'
import { formatCZK } from '@/lib/utils'

interface DnaStripProps {
  article: Article
  set: LegoSet | null
}

export function DnaStrip({ article, set }: DnaStripProps) {
  const imgSrc =
    article.hero_photo_url ??
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'

  return (
    <Link
      href={`/dna/${article.slug}`}
      className="group relative grid grid-cols-2 overflow-hidden rounded-xl mb-10 no-underline"
      style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', minHeight: 260 }}
    >
      {/* Photo side */}
      <div className="relative overflow-hidden">
        <Image
          src={imgSrc}
          alt={article.title}
          fill
          className="object-cover photo-dark"
          sizes="50vw"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, var(--sur) 100%)' }} />
      </div>

      {/* Content side */}
      <div className="p-8 flex flex-col justify-center relative z-[2]">
        <div className="font-cond text-[10px] font-bold tracking-[0.22em] uppercase mb-2 flex items-center gap-[7px]" style={{ color: 'var(--gold)' }}>
          <span className="block w-5 h-px" style={{ background: 'var(--gold)' }} />
          DNA Series · #{String(article.number ?? '').padStart(3, '0')} — {article.brand}
        </div>
        <div className="font-serif italic text-[30px] leading-[1.15] tracking-[-0.01em] mb-3" style={{ color: 'var(--text)' }}>
          {article.title}
        </div>
        <p className="text-[13px] leading-[1.65] mb-5 max-w-[380px]" style={{ color: 'var(--text2)' }}>
          {article.excerpt}
        </p>

        {/* Stats */}
        {set && (
          <div className="flex gap-5 mb-5">
            {[
              { num: String(set.pieces ?? '—'), lbl: 'Dilku' },
              { num: String(set.year_released ?? '—'), lbl: 'Set rok' },
              { num: set.rrp_czk ? formatCZK(set.rrp_czk) : '—', lbl: 'Cena' },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-cond text-xl font-black leading-none" style={{ color: 'var(--text)' }}>{s.num}</div>
                <div className="font-cond text-[9px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        )}

        <span
          className="font-cond text-[13px] font-bold tracking-[0.14em] uppercase px-6 py-3 rounded-md w-fit flex items-center gap-2"
          style={{ background: 'var(--gold)', color: '#000' }}
        >
          Cist DNA #{String(article.number ?? '').padStart(3, '0')} →
        </span>
      </div>
    </Link>
  )
}
