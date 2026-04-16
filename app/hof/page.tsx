import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'

export const metadata: Metadata = {
  title: 'Hall of Fame — nejlepsi sety vsech dob',
  description: 'Definitivni ranking LEGO Speed Champions setu. Hodnoceni tvaru, detailu, stavby, hodnoty a display efektu.',
}

export default async function HofPage() {
  const supabase = createServerClient()

  const [articlesRes, setsRes] = await Promise.all([
    supabase.from('articles').select('*').eq('series', 'dna').eq('is_draft', false)
      .order('rating_overall', { ascending: false, nullsFirst: false }).limit(15),
    supabase.from('sets').select('*'),
  ])

  const articles = (articlesRes.data ?? []) as Article[]
  const setMap = new Map((setsRes.data ?? []).map((s: any) => [s.set_number, s as LegoSet]))

  const top1 = articles[0]
  const top2to10 = articles.slice(1, 10)
  const honorable = articles.slice(10, 15)

  return (
    <>
      {/* Hero */}
      <div className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg), rgba(201,162,39,0.04))' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold)' }}>Hall of Fame</div>
          <h1 className="font-serif italic leading-[0.95] mb-4" style={{ fontSize: 'clamp(44px,6vw,72px)', color: 'var(--text)' }}>
            Nejlepsi sety<br />vsech dob.
          </h1>
          <p className="text-[15px] leading-[1.65] max-w-[500px]" style={{ color: 'var(--text2)' }}>
            Definitivni ranking. Tvar, detail, stavba, hodnota, display efekt — kazda kategorie se pocita.
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-8 grid gap-10 py-10 pb-20" style={{ gridTemplateColumns: '1fr 260px' }}>
        <div>
          {/* #1 Featured */}
          {top1 && <HofHero article={top1} set={top1.set_number ? setMap.get(top1.set_number) ?? null : null} />}

          {/* #2-10 Rows */}
          <div className="flex flex-col gap-[2px] rounded-xl overflow-hidden mt-[2px]" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
            {top2to10.map((a, i) => (
              <HofRow key={a.id} rank={i + 2} article={a} set={a.set_number ? setMap.get(a.set_number) ?? null : null} />
            ))}
          </div>

          {/* Honorable mentions */}
          {honorable.length > 0 && (
            <div className="mt-12">
              <div className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text3)' }}>
                Cestne uznani
              </div>
              <div className="grid grid-cols-3 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
                {honorable.map(a => {
                  const set = a.set_number ? setMap.get(a.set_number) ?? null : null
                  const img = set?.brickset_img_url ?? (a.set_number ? setImageUrl(a.set_number) : null)
                  return (
                    <Link key={a.id} href={`/dna/${a.slug}`} className="group block no-underline" style={{ background: 'var(--sur)' }}>
                      {img && (
                        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                          <Image src={img} alt={a.title} fill className="object-cover photo-dark" sizes="33vw" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>{a.brand}</div>
                        <div className="font-cond text-sm font-black uppercase leading-[1.1] group-hover:text-gold transition-colors" style={{ color: 'var(--text)' }}>{set?.name ?? a.title}</div>
                        {a.rating_overall && <div className="font-cond text-sm font-black mt-1" style={{ color: 'var(--gold)' }}>{a.rating_overall.toFixed(1)}/10</div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sticky top-[100px] self-start">
          {/* Methodology */}
          <div className="p-5 rounded-xl mb-4" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text3)' }}>Metodika hodnoceni</div>
            {[
              { label: 'Tvar & proporce', w: '25 %' },
              { label: 'Detail & vernost', w: '25 %' },
              { label: 'Stavba', w: '20 %' },
              { label: 'Hodnota', w: '20 %' },
              { label: 'Display efekt', w: '10 %' },
            ].map(m => (
              <div key={m.label} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--bdr)' }}>
                <span className="font-cond text-xs font-bold" style={{ color: 'var(--text2)' }}>{m.label}</span>
                <span className="font-cond text-xs font-black" style={{ color: 'var(--gold)' }}>{m.w}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}

function HofHero({ article, set }: { article: Article; set: LegoSet | null }) {
  const img = set?.brickset_img_url ?? (article.set_number ? setImageUrl(article.set_number) : null)
  const categories = [
    { label: 'Tvar', val: article.rating_shape },
    { label: 'Detail', val: article.rating_detail },
    { label: 'Stavba', val: article.rating_build },
    { label: 'Hodnota', val: article.rating_value },
    { label: 'Display', val: article.rating_display },
  ]

  return (
    <Link href={`/dna/${article.slug}`} className="group block no-underline rounded-xl overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', borderLeft: '3px solid var(--gold)' }}>
      <div className="grid items-center" style={{ gridTemplateColumns: '120px 1fr 110px' }}>
        {/* Rank */}
        <div className="flex items-center justify-center">
          <span className="font-cond text-[72px] font-black leading-none" style={{ color: 'var(--gold)' }}>01</span>
        </div>

        {/* Info + photo */}
        <div className="flex gap-5 p-5">
          {img && (
            <div className="relative overflow-hidden rounded-lg shrink-0" style={{ width: 160, aspectRatio: '4/3' }}>
              <Image src={img} alt={article.title} fill className="object-cover photo-dark" sizes="160px" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>{article.brand} · {set?.year_released}</div>
            <div className="font-cond text-2xl font-black uppercase leading-[1.05] my-1" style={{ color: 'var(--text)' }}>{set?.name ?? article.title}</div>
            <div className="font-cond text-[10px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>Set {article.set_number} · {set?.pieces} dilku</div>
            {/* Score bars */}
            <div className="flex flex-col gap-1.5 mt-3">
              {categories.map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="font-cond text-[9px] font-bold tracking-[0.08em] uppercase w-12" style={{ color: 'var(--text3)' }}>{c.label}</span>
                  <div className="flex-1 h-[3px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-sm" style={{ width: `${(c.val ?? 0) * 10}%`, background: 'var(--gold)' }} />
                  </div>
                  <span className="font-cond text-[10px] font-black w-6 text-right" style={{ color: 'var(--text)' }}>{c.val?.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-center px-4" style={{ borderLeft: '1px solid var(--bdr)' }}>
          <div className="font-cond text-[56px] font-black leading-none" style={{ color: 'var(--gold)' }}>
            {article.rating_overall?.toFixed(1)}
          </div>
          <div className="font-cond text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--text3)' }}>skore</div>
        </div>
      </div>
    </Link>
  )
}

function HofRow({ rank, article, set }: { rank: number; article: Article; set: LegoSet | null }) {
  const img = set?.brickset_img_url ?? (article.set_number ? setImageUrl(article.set_number) : null)

  return (
    <Link
      href={`/dna/${article.slug}`}
      className="group grid items-center gap-5 no-underline transition-colors hover:bg-sur2"
      style={{ gridTemplateColumns: '72px 90px 1fr auto 80px', background: 'var(--sur)', padding: '14px 22px' }}
    >
      <div className="font-cond text-[24px] font-black leading-none" style={{ color: rank <= 3 ? 'var(--gold)' : 'rgba(255,255,255,0.12)' }}>
        {String(rank).padStart(2, '0')}
      </div>
      <div className="w-[90px] h-14 overflow-hidden rounded" style={{ background: 'var(--sur2)' }}>
        {img && <Image src={img} alt={article.title} width={90} height={56} className="w-full h-full object-cover" style={{ filter: 'brightness(0.15)' }} />}
      </div>
      <div>
        <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>{article.brand} · {set?.year_released}</div>
        <div className="font-cond text-lg font-black uppercase leading-[1.1]" style={{ color: 'var(--text)' }}>{set?.name ?? article.title}</div>
        <div className="font-cond text-[10px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>Set {article.set_number} · {set?.pieces} dilku</div>
      </div>
      <div className="flex gap-1.5">
        {rank <= 3 && (
          <span className="font-cond text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-[3px] rounded-sm" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: 'var(--gold)' }}>
            Top {rank}
          </span>
        )}
      </div>
      <div className="text-center" style={{ borderLeft: '1px solid var(--bdr)', paddingLeft: 16 }}>
        <div className="font-cond text-[22px] font-black leading-none" style={{ color: 'var(--gold)' }}>
          {article.rating_overall?.toFixed(1) ?? '—'}
        </div>
        <div className="font-cond text-[9px] tracking-[0.15em] uppercase" style={{ color: 'var(--text3)' }}>skore</div>
      </div>
    </Link>
  )
}
