import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'
import { allGeneraceArticles } from '.contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer2/hooks'
import { ReadProgress } from '@/components/article/ReadProgress'
import { Chapter } from '@/components/mdx/Chapter'
import { PullQuote } from '@/components/mdx/PullQuote'
import { SpecsTable } from '@/components/mdx/SpecsTable'
import { ComparisonSlider } from '@/components/mdx/ComparisonSlider'

const mdxComponents = { Chapter, PullQuote, SpecsTable, ComparisonSlider }

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return allGeneraceArticles.filter(a => !a.draft).map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data } = await supabase.from('articles').select('title, excerpt').eq('slug', params.slug).eq('series', 'generace').single()
  if (!data) return { title: 'Clanek nenalezen' }
  return { title: `${data.title} — Generace`, description: data.excerpt }
}

function MdxContent({ slug }: { slug: string }) {
  const doc = allGeneraceArticles.find(a => a.slug === slug)
  if (!doc) return null
  const MDX = useMDXComponent(doc.body.code)
  return <MDX components={mdxComponents} />
}

export default async function GeneraceArticlePage({ params }: Props) {
  const supabase = createServerClient()

  const { data: article } = await supabase.from('articles').select('*').eq('slug', params.slug).eq('series', 'generace').single()
  if (!article) notFound()
  const a = article as Article

  // Fetch both sets
  let newSet: LegoSet | null = null
  let oldSet: LegoSet | null = null
  if (a.set_number) {
    const { data } = await supabase.from('sets').select('*').eq('set_number', a.set_number).single()
    newSet = data as LegoSet | null
  }
  if (a.set_number_old) {
    const { data } = await supabase.from('sets').select('*').eq('set_number', a.set_number_old).single()
    oldSet = data as LegoSet | null
  }

  const doc = allGeneraceArticles.find(d => d.slug === params.slug)
  const winner = doc?.winner

  const oldImg = a.set_number_old ? setImageUrl(a.set_number_old) : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
  const newImg = a.set_number ? setImageUrl(a.set_number) : 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=900&q=80'

  return (
    <>
      <ReadProgress />

      {/* Split hero */}
      <section className="relative grid grid-cols-2" style={{ height: '80vh', minHeight: 500 }}>
        {/* Old set panel */}
        <div className="relative overflow-hidden">
          <Image src={oldImg} alt={oldSet?.name ?? 'Old'} fill className="object-cover" style={{ filter: 'brightness(0.3) saturate(0.6)' }} sizes="50vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.3) 50%, transparent)' }} />
          <div className="absolute bottom-10 left-8 z-[2]">
            <span className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-1 rounded-sm mb-2 inline-block" style={{ background: 'rgba(200,40,30,0.8)', color: 'white' }}>
              {oldSet?.era ?? '6-wide'} · {oldSet?.year_released ?? ''}
            </span>
            <div className="font-cond text-[28px] font-black uppercase leading-none mt-2" style={{ color: 'var(--text)' }}>
              {oldSet?.name ?? a.set_number_old}
            </div>
            <div className="font-cond text-xs mt-1" style={{ color: 'var(--text3)' }}>
              Set {a.set_number_old} · {oldSet?.pieces ?? '?'} dilku
            </div>
          </div>
        </div>

        {/* New set panel */}
        <div className="relative overflow-hidden">
          <Image src={newImg} alt={newSet?.name ?? 'New'} fill className="object-cover" style={{ filter: 'brightness(0.3) saturate(0.6)' }} sizes="50vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.3) 50%, transparent)' }} />
          <div className="absolute bottom-10 right-8 text-right z-[2]">
            <span className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-1 rounded-sm mb-2 inline-block" style={{ background: 'rgba(201,162,39,0.8)', color: '#000' }}>
              {newSet?.era ?? '8-wide'} · {newSet?.year_released ?? ''}
            </span>
            <div className="font-cond text-[28px] font-black uppercase leading-none mt-2" style={{ color: 'var(--text)' }}>
              {newSet?.name ?? a.set_number}
            </div>
            <div className="font-cond text-xs mt-1" style={{ color: 'var(--text3)' }}>
              Set {a.set_number} · {newSet?.pieces ?? '?'} dilku
            </div>
          </div>
        </div>

        {/* VS circle center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-cond text-xl font-black" style={{ background: 'var(--gold)', color: '#000', boxShadow: '0 0 20px rgba(201,162,39,0.4)' }}>
            VS
          </div>
        </div>

        {/* Center divider line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] z-[5]" style={{ background: 'var(--gold)' }} />

        {/* Winner banner */}
        {winner && (
          <div className="absolute bottom-0 left-0 right-0 z-10 text-center py-3" style={{ background: 'rgba(201,162,39,0.9)' }}>
            <span className="font-cond text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#000' }}>
              Vitez: {winner === 'new' ? (newSet?.name ?? 'Novy') : (oldSet?.name ?? 'Stary')}
            </span>
          </div>
        )}
      </section>

      {/* Article content */}
      <div className="max-w-content mx-auto px-8 py-12">
        <div className="max-w-[780px] mx-auto">
          <h1 className="font-serif font-black tracking-[-0.02em] text-[36px] leading-[1.1] mb-6" style={{ color: 'var(--text)' }}>
            {a.title}
          </h1>

          {/* Comparison table quick stats */}
          {(oldSet || newSet) && (
            <div className="rounded-xl overflow-hidden mb-10" style={{ border: '1px solid var(--bdr)' }}>
              <div className="grid grid-cols-3" style={{ background: 'var(--sur2)' }}>
                <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-4 py-3" style={{ color: 'var(--text3)' }}>Parametr</div>
                <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-4 py-3 text-center" style={{ color: '#E8715B' }}>{oldSet?.name ?? 'Stary'}</div>
                <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-4 py-3 text-center" style={{ color: 'var(--gold)' }}>{newSet?.name ?? 'Novy'}</div>
              </div>
              {[
                { label: 'Rok', old: oldSet?.year_released, new_: newSet?.year_released },
                { label: 'Dilku', old: oldSet?.pieces, new_: newSet?.pieces },
                { label: 'Cena', old: oldSet?.rrp_czk ? formatCZK(oldSet.rrp_czk) : '—', new_: newSet?.rrp_czk ? formatCZK(newSet.rrp_czk) : '—' },
                { label: 'Era', old: oldSet?.era ?? '6wide', new_: newSet?.era ?? '8wide' },
              ].map((row, i) => {
                const oldVal = String(row.old ?? '—')
                const newVal = String(row.new_ ?? '—')
                return (
                  <div key={i} className="grid grid-cols-3" style={{ borderTop: '1px solid var(--bdr)' }}>
                    <div className="font-cond text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-3" style={{ background: 'var(--sur)', color: 'var(--text3)' }}>{row.label}</div>
                    <div className="font-cond text-sm font-bold px-4 py-3 text-center" style={{ background: 'var(--sur)', color: 'var(--text)' }}>{oldVal}</div>
                    <div className="font-cond text-sm font-bold px-4 py-3 text-center" style={{ background: 'var(--sur)', color: 'var(--text)' }}>{newVal}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MDX content */}
          {doc ? <MdxContent slug={params.slug} /> : (
            <div className="text-base leading-[1.8]" style={{ color: 'var(--text2)' }}>
              <p>{a.excerpt}</p>
              <p className="mt-8 font-cond text-sm uppercase tracking-[0.15em]" style={{ color: 'var(--text3)' }}>Plny clanek bude brzy k dispozici.</p>
            </div>
          )}

          {/* Verdict box */}
          {winner && (
            <div className="mt-10 p-6 rounded-xl grid grid-cols-2 gap-6" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
              <div className="text-center">
                <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: winner === 'old' ? 'var(--gold)' : 'var(--text3)' }}>
                  {oldSet?.name ?? 'Stary'} {winner === 'old' && '★'}
                </div>
                <div className="font-cond text-[36px] font-black" style={{ color: winner === 'old' ? 'var(--gold)' : 'var(--text3)' }}>
                  {oldSet?.rating_overall?.toFixed(1) ?? '—'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: winner === 'new' ? 'var(--gold)' : 'var(--text3)' }}>
                  {newSet?.name ?? 'Novy'} {winner === 'new' && '★'}
                </div>
                <div className="font-cond text-[36px] font-black" style={{ color: winner === 'new' ? 'var(--gold)' : 'var(--text3)' }}>
                  {newSet?.rating_overall?.toFixed(1) ?? '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
