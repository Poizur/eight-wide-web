import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet, PriceSnapshot } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'
import { allDnaArticles } from '.contentlayer/generated'
import { useMDXComponent } from 'next-contentlayer2/hooks'

import { articleJsonLd, productJsonLd } from '@/lib/structured-data'
import { ReadProgress } from '@/components/article/ReadProgress'
import { TableOfContents } from '@/components/article/TableOfContents'
import { PriceSidebar } from '@/components/article/PriceSidebar'
import { RelatedArticles } from '@/components/article/RelatedArticles'

import { Chapter } from '@/components/mdx/Chapter'
import { PullQuote } from '@/components/mdx/PullQuote'
import { InlinePhoto } from '@/components/mdx/InlinePhoto'
import { SpecsTable } from '@/components/mdx/SpecsTable'
import { RvbCompare } from '@/components/mdx/RvbCompare'
import { LegoRating } from '@/components/mdx/LegoRating'
import { IconsReview } from '@/components/mdx/IconsReview'
import { BuyDecision } from '@/components/mdx/BuyDecision'

const mdxComponents = {
  Chapter,
  PullQuote,
  InlinePhoto,
  SpecsTable,
  RvbCompare,
  LegoRating,
  IconsReview,
  BuyDecision,
}

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return allDnaArticles
    .filter((a) => !a.draft)
    .map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('series', 'dna')
    .single()

  if (!article) return { title: 'Clanek nenalezen' }

  return {
    title: `${article.title} — DNA #${article.number}`,
    description: article.excerpt ?? article.meta_description,
    openGraph: {
      images: [`/api/og/${params.slug}`],
    },
  }
}

function MdxContent({ slug }: { slug: string }) {
  const doc = allDnaArticles.find((a) => a.slug === slug)
  if (!doc) return null

  const MDXContent = useMDXComponent(doc.body.code)
  return <MDXContent components={mdxComponents} />
}

export default async function DnaArticlePage({ params }: Props) {
  const supabase = createServerClient()

  const [articleRes, relatedRes] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .eq('slug', params.slug)
      .eq('series', 'dna')
      .single(),
    supabase
      .from('articles')
      .select('*')
      .eq('series', 'dna')
      .eq('is_draft', false)
      .neq('slug', params.slug)
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  const article = articleRes.data as Article | null
  if (!article) notFound()

  // Fetch set + prices
  let set: LegoSet | null = null
  let prices: PriceSnapshot[] = []

  if (article.set_number) {
    const [setRes, pricesRes] = await Promise.all([
      supabase.from('sets').select('*').eq('set_number', article.set_number).single(),
      supabase.from('current_prices').select('*').eq('set_number', article.set_number),
    ])
    set = setRes.data as LegoSet | null
    prices = (pricesRes.data ?? []) as PriceSnapshot[]
  }

  const related = (relatedRes.data ?? []) as Article[]

  // Find MDX doc for TOC generation
  const doc = allDnaArticles.find((a) => a.slug === params.slug)

  // Extract chapter titles from MDX for TOC
  const tocItems = doc
    ? (doc.body.raw.match(/<Chapter\s+title="([^"]+)"/g) ?? []).map((m) => {
        const title = m.match(/title="([^"]+)"/)?.[1] ?? ''
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        return { id, title }
      })
    : []

  const heroPhoto =
    article.hero_photo_url ??
    (set?.brickset_img_url
      ? set.brickset_img_url
      : 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1800&q=85')

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article, set)) }}
      />
      {set && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(set, article)) }}
        />
      )}

      <ReadProgress />

      {/* Hero */}
      <section className="relative flex items-end overflow-hidden" style={{ height: '92vh', minHeight: 620 }}>
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url('${heroPhoto}')`,
            backgroundPosition: 'center 40%',
            filter: 'brightness(0.45) saturate(1.1)',
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,12,16,1) 0%, rgba(10,12,16,0.6) 40%, rgba(10,12,16,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,12,16,0.8) 0%, transparent 55%)' }} />

        <div className="relative z-[2] max-w-content mx-auto px-8 pb-16 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3 font-cond text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--text3)' }}>
            <Link href="/" className="no-underline" style={{ color: 'var(--text3)' }}>Home</Link>
            <span>›</span>
            <Link href="/dna" className="no-underline" style={{ color: 'var(--text3)' }}>DNA</Link>
            <span>›</span>
            <span style={{ color: 'var(--text2)' }}>{article.brand}</span>
          </div>

          {/* Series tag */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)' }} />
            <span className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--red)' }}>
              DNA Series · #{String(article.number ?? '').padStart(3, '0')} · {article.brand}
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-serif font-bold tracking-[-0.02em] leading-[0.95] mb-4"
            style={{ fontSize: 'clamp(52px,7vw,96px)', color: 'var(--text)' }}
          >
            {article.title}
          </h1>

          {/* Deck */}
          {article.excerpt && (
            <p className="text-[17px] leading-[1.65] max-w-[520px] mb-6" style={{ color: 'var(--text2)' }}>
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-cond text-xs font-black" style={{ background: 'var(--gold)', color: '#000' }}>
                EW
              </div>
              <span className="text-[13px]" style={{ color: 'var(--text2)' }}>Eight Wide</span>
            </div>
            {article.published_at && (
              <span className="font-cond text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text3)' }}>
                {new Date(article.published_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {article.read_time_min && (
              <span className="font-cond text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text3)' }}>
                {article.read_time_min} min cteni
              </span>
            )}
          </div>
        </div>

        {/* Set badge in hero */}
        {article.set_number && set && (
          <div
            className="absolute bottom-16 right-8 z-[2] text-center"
            style={{
              background: 'rgba(10,12,16,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '14px 18px',
            }}
          >
            <div className="font-cond text-[28px] font-black leading-none" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {article.set_number}
            </div>
            <div className="font-cond text-[8px] font-bold tracking-[0.22em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Set No.
            </div>
            {set.pieces && (
              <div className="font-cond text-[10px] mt-1" style={{ color: 'var(--text3)' }}>
                {set.pieces} dilku · {set.rrp_czk ? formatCZK(set.rrp_czk) : ''}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Article content */}
      <div className="max-w-content mx-auto px-8 py-12">
        <div className="grid gap-14" style={{ gridTemplateColumns: '1fr 320px' }}>
          {/* Main content */}
          <article className="min-w-0">
            {doc ? (
              <MdxContent slug={params.slug} />
            ) : (
              /* Fallback: render excerpt if no MDX */
              <div className="text-base leading-[1.8]" style={{ color: 'var(--text2)' }}>
                <p>{article.excerpt}</p>
                <p className="mt-8 font-cond text-sm uppercase tracking-[0.15em]" style={{ color: 'var(--text3)' }}>
                  Plny clanek bude brzy k dispozici.
                </p>
              </div>
            )}

            <RelatedArticles articles={related} />
          </article>

          {/* Sidebar */}
          <aside className="sticky top-[100px] self-start">
            <TableOfContents items={tocItems} />
            {article.set_number && <PriceSidebar prices={prices} setNumber={article.set_number} />}

            {/* Related sidebar cards */}
            {related.slice(0, 2).map((r) => {
              const img = r.hero_photo_url ?? (r.set_number ? setImageUrl(r.set_number) : null)
              return (
                <Link
                  key={r.id}
                  href={`/dna/${r.slug}`}
                  className="group block no-underline rounded-xl overflow-hidden mb-3"
                  style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}
                >
                  {img && (
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <Image src={img} alt={r.title} fill className="object-cover photo-dark" sizes="320px" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="font-cond text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: 'var(--gold)' }}>
                      DNA #{r.number}
                    </div>
                    <div className="font-cond text-lg font-black uppercase leading-[1.1]" style={{ color: 'var(--text)' }}>
                      {r.title}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                      {r.brand} · {r.read_time_min} min
                    </div>
                  </div>
                </Link>
              )
            })}
          </aside>
        </div>
      </div>
    </>
  )
}
