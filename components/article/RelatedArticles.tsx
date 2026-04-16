import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <div className="mt-14 pt-14" style={{ borderTop: '1px solid var(--bdr)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-cond text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--text)' }}>
          Dalsi clanky
        </div>
        <Link href="/dna" className="font-cond text-[11px] font-bold tracking-[0.14em] uppercase no-underline" style={{ color: 'var(--gold)' }}>
          Vsechny →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-[2px] rounded-lg overflow-hidden" style={{ background: 'var(--bdr)' }}>
        {articles.slice(0, 3).map((a) => {
          const imgSrc = a.hero_photo_url ?? (a.set_number ? setImageUrl(a.set_number) : null)
          return (
            <Link
              key={a.id}
              href={`/${a.series}/${a.slug}`}
              className="group block no-underline"
              style={{ background: 'var(--sur)' }}
            >
              {imgSrc && (
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <Image src={imgSrc} alt={a.title} fill className="object-cover photo-dark" sizes="33vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,22,32,0.95) 0%, transparent 60%)' }} />
                  <span className="absolute bottom-3 left-3 font-cond text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-sm z-[2]" style={{ background: 'rgba(10,12,16,0.7)', color: 'var(--gold)' }}>
                    {a.series}
                  </span>
                </div>
              )}
              <div className="p-4">
                <div className="font-cond text-base font-black uppercase leading-[1.1] group-hover:text-gold transition-colors duration-200" style={{ color: 'var(--text)' }}>
                  {a.title}
                </div>
                <div className="mt-2 font-cond text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text3)' }}>
                  {a.brand} · {a.read_time_min ? `${a.read_time_min} min` : ''}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
