import Image from 'next/image'
import Link from 'next/link'
import type { Article, LegoSet } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'
import { SectionHead } from './SectionHead'

interface HofItem {
  article: Article
  set: LegoSet | null
}

export function HofPreview({ items }: { items: HofItem[] }) {
  if (items.length === 0) return null

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className="max-w-content mx-auto px-8">
        <SectionHead title="Hall of Fame" sub="— nejlepsi sety vsech dob" linkHref="/hof" linkLabel="Cely ranking" />
        <div
          className="flex flex-col gap-[2px] rounded-[10px] overflow-hidden"
          style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}
        >
          {items.map((item, i) => {
            const rank = i + 1
            const isGold = rank === 1
            const imgSrc = item.set?.brickset_img_url
              ? item.set.brickset_img_url
              : item.article.set_number
                ? setImageUrl(item.article.set_number)
                : null

            return (
              <Link
                key={item.article.id}
                href={`/dna/${item.article.slug}`}
                className="group grid items-center gap-5 no-underline transition-colors duration-200 hover:bg-sur2"
                style={{
                  gridTemplateColumns: '56px 80px 1fr auto auto',
                  background: 'var(--sur)',
                  padding: '16px 22px',
                  borderLeft: isGold ? '3px solid var(--gold)' : 'none',
                }}
              >
                {/* Rank */}
                <div
                  className="font-cond text-[28px] font-black leading-none"
                  style={{ color: isGold ? 'var(--gold)' : 'rgba(255,255,255,0.12)' }}
                >
                  {String(rank).padStart(2, '0')}
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-[50px] overflow-hidden rounded" style={{ background: 'var(--sur2)' }}>
                  {imgSrc && (
                    <Image
                      src={imgSrc}
                      alt={item.article.title}
                      width={80}
                      height={50}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-[0.85]"
                      style={{ filter: 'brightness(0.55)' }}
                    />
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>
                    {item.article.brand} · {item.set?.year_released ?? ''}
                  </div>
                  <div className="font-cond text-xl font-black uppercase leading-[1.1] my-0.5" style={{ color: 'var(--text)' }}>
                    {item.set?.name ?? item.article.title}
                  </div>
                  <div className="font-cond text-[10px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>
                    Set {item.article.set_number} · {item.set?.pieces ?? '?'} dilku
                  </div>
                </div>

                {/* Score */}
                <div className="text-center px-4" style={{ borderLeft: '1px solid var(--bdr)' }}>
                  <div className="font-cond text-[28px] font-black leading-none" style={{ color: 'var(--gold)' }}>
                    {item.article.rating_overall?.toFixed(1) ?? '—'}
                  </div>
                  <div className="font-cond text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--text3)' }}>
                    skore
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                  {isGold && (
                    <span className="font-cond text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] rounded-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: 'var(--gold)' }}>
                      #{rank} Overall
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
