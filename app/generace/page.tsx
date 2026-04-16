import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'

export const metadata: Metadata = {
  title: 'Generace — 6-wide vs 8-wide',
  description: 'Srovnani generaci LEGO Speed Champions setu. Stare vs nove — kdo vyhraje?',
}

export default async function GeneraceArchivePage() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('series', 'generace')
    .eq('is_draft', false)
    .order('published_at', { ascending: false })

  const articles = (data ?? []) as Article[]

  return (
    <>
      {/* Header */}
      <div className="pt-[100px] pb-10" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            Generace
          </div>
          <h1 className="font-serif font-semibold leading-[0.95] mb-4" style={{ fontSize: 'clamp(40px,5vw,64px)', color: 'var(--text)' }}>
            Stare vs. nove —<br />kdo skutecne vyhral?
          </h1>
          <p className="text-[15px] leading-[1.65] max-w-[520px]" style={{ color: 'var(--text2)' }}>
            Prechod z 6-wide na 8-wide zmenil vse. Srovnavame generace side-by-side.
          </p>

          {/* Split preview */}
          <div className="grid grid-cols-2 gap-[3px] mt-8 rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', maxWidth: 700 }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="https://images.brickset.com/sets/images/75912-1.jpg"
                alt="6-wide"
                fill
                className="object-cover"
                style={{ filter: 'brightness(0.35) saturate(0.4)' }}
                sizes="350px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-cond text-[48px] font-black" style={{ color: 'rgba(255,255,255,0.08)' }}>6W</span>
              </div>
              <span className="absolute bottom-3 left-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-1 rounded-sm" style={{ background: 'rgba(200,40,30,0.8)', color: 'white' }}>6-wide · 2015–2019</span>
            </div>
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image
                src="https://images.brickset.com/sets/images/76934-1.jpg"
                alt="8-wide"
                fill
                className="object-cover"
                style={{ filter: 'brightness(0.35) saturate(0.4)' }}
                sizes="350px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-cond text-[48px] font-black" style={{ color: 'rgba(255,255,255,0.08)' }}>8W</span>
              </div>
              <span className="absolute bottom-3 right-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-1 rounded-sm" style={{ background: 'rgba(201,162,39,0.8)', color: '#000' }}>8-wide · 2020+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-content mx-auto px-8 py-10">
        {articles.length > 0 ? (
          <div className="grid grid-cols-2 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
            {articles.map((a) => (
              <GenCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="font-cond text-lg font-bold uppercase mb-2" style={{ color: 'var(--text3)' }}>
              Generace clanky se pripravuji
            </div>
            <p className="text-sm" style={{ color: 'var(--text3)' }}>
              Prvni srovnani bude brzy k dispozici.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function GenCard({ article }: { article: Article }) {
  const oldImg = article.set_number_old ? setImageUrl(article.set_number_old) : null
  const newImg = article.set_number ? setImageUrl(article.set_number) : null

  return (
    <Link href={`/generace/${article.slug}`} className="group block no-underline" style={{ background: 'var(--sur)' }}>
      {/* Split photo */}
      <div className="grid grid-cols-2 gap-[2px] relative" style={{ background: 'var(--bdr)' }}>
        {oldImg && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image src={oldImg} alt="Old" fill className="object-cover photo-dark" sizes="25vw" />
          </div>
        )}
        {newImg && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image src={newImg} alt="New" fill className="object-cover photo-dark" sizes="25vw" />
          </div>
        )}
        {/* VS badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center font-cond text-[10px] font-black" style={{ background: 'var(--gold)', color: '#000' }}>
          VS
        </div>
      </div>
      <div className="p-4">
        <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--text3)' }}>{article.brand}</div>
        <div className="font-cond text-lg font-black uppercase leading-[1.1] group-hover:text-gold transition-colors" style={{ color: 'var(--text)' }}>
          {article.title}
        </div>
        {article.excerpt && <p className="text-xs mt-1 leading-[1.5]" style={{ color: 'var(--text2)' }}>{article.excerpt}</p>}
      </div>
    </Link>
  )
}
