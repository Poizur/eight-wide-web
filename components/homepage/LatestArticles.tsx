import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'
import { SectionHead } from './SectionHead'

const seriesConfig: Record<string, { label: string; cls: string }> = {
  dna:        { label: 'DNA Series', cls: 'text-red bg-[rgba(200,40,30,0.12)]' },
  generace:   { label: 'Generace', cls: 'text-gold bg-[rgba(201,162,39,0.1)]' },
  paddock:    { label: 'Paddock Rumors', cls: 'text-[#A97ED0] bg-[rgba(169,126,208,0.1)]' },
  investment: { label: 'The Investment', cls: 'text-green bg-[rgba(30,158,90,0.1)]' },
}

function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  const series = seriesConfig[article.series] ?? seriesConfig.dna
  const imgSrc = article.hero_photo_url ?? (article.set_number ? setImageUrl(article.set_number) : null)

  return (
    <Link href={`/${article.series}/${article.slug}`} className="group block no-underline" style={{ background: 'var(--sur)', transition: 'background 0.15s', cursor: 'pointer' }}>
      <div className="relative" style={{ position: 'relative' }}>
        {/* Gold left bar on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 z-10" style={{ background: 'var(--gold)' }} />

        {/* Photo */}
        {imgSrc && featured && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
            <Image src={imgSrc} alt={article.title} fill className="object-cover photo-dark" sizes="(max-width:768px) 100vw, 60vw" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,22,32,0.95) 0%, rgba(17,22,32,0.3) 50%, transparent 100%)' }} />
            <div className="absolute bottom-3.5 left-4 z-[2] font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-[3px] rounded-sm" style={{ background: 'rgba(10,12,16,0.7)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              {series.label}
            </div>
            {article.set_number && (
              <div className="absolute top-3.5 right-3.5 z-[3] text-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms]" style={{ background: 'rgba(10,12,16,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '9px 13px' }}>
                <div className="font-cond text-[8px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Set No.</div>
                <div className="font-cond text-xl font-black leading-none tracking-[0.02em]" style={{ color: 'rgba(255,255,255,0.92)' }}>{article.set_number}</div>
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className={featured ? 'p-[18px]' : 'px-4 py-3.5'}>
          <div className={`inline-flex items-center gap-[5px] font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-[3px] rounded-sm mb-2.5 ${series.cls}`}>
            <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'currentColor' }} />
            {series.label}
          </div>
          {featured ? (
            <div className="font-serif italic text-[21px] leading-[1.2] tracking-[-0.01em] mb-2 group-hover:text-gold transition-colors duration-200" style={{ color: 'var(--text)' }}>
              {article.title}
            </div>
          ) : (
            <div className="font-cond text-base font-bold tracking-[0.02em] uppercase leading-[1.2] mb-1.5 group-hover:text-gold transition-colors duration-200" style={{ color: 'var(--text)' }}>
              {article.title}
            </div>
          )}
          {featured && article.excerpt && (
            <p className="text-[13px] leading-[1.6] mb-3.5" style={{ color: 'var(--text2)' }}>{article.excerpt}</p>
          )}
          <div className="flex justify-between items-center font-cond text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text3)', borderTop: featured ? '1px solid var(--bdr)' : 'none', paddingTop: featured ? 12 : 4, marginTop: featured ? 12 : 4 }}>
            <span>{article.brand} · {article.published_at ? new Date(article.published_at).getFullYear() : ''}</span>
            <span>{article.read_time_min ? `${article.read_time_min} min` : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function LatestArticles({ articles }: { articles: Article[] }) {
  const featured = articles[0]
  const side = articles.slice(1, 4)
  const bottom = articles.slice(4, 7)

  return (
    <div>
      <SectionHead title="Prave vyslo" sub="— tento tyden" linkHref="/dna" linkLabel="Vsechny clanky" />

      {/* Main grid: featured + side */}
      <div className="grid gap-[2px] rounded-[10px] overflow-hidden mb-[2px]" style={{ gridTemplateColumns: '1.55fr 1fr', background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
        {featured && <ArticleCard article={featured} featured />}
        <div className="flex flex-col gap-[2px]" style={{ background: 'var(--bdr)' }}>
          {side.map((a) => (
            <div key={a.id} style={{ flex: 1 }}>
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 3-grid */}
      {bottom.length > 0 && (
        <div className="grid grid-cols-3 gap-[2px] mb-10" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)', borderLeft: 'none', borderRight: 'none' }}>
          {bottom.map((a) => (
            <ArticleCard key={a.id} article={a} featured />
          ))}
        </div>
      )}
    </div>
  )
}
