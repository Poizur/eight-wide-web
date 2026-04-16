import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DNA — Pribeh kazdeho auta',
  description: 'Kazdy Speed Champions set ma pribeh. DNA serie ho vypravuje — od realneho auta az po LEGO verzi.',
}

interface Props {
  searchParams: { brand?: string; sort?: string; page?: string }
}

export default async function DnaArchivePage({ searchParams }: Props) {
  const supabase = createServerClient()
  const brand = searchParams.brand
  const sort = searchParams.sort ?? 'newest'
  const page = parseInt(searchParams.page ?? '1', 10)
  const PAGE_SIZE = 12

  // Fetch articles
  let query = supabase
    .from('articles')
    .select('*')
    .eq('series', 'dna')
    .eq('is_draft', false)

  if (brand) query = query.eq('brand', brand)

  if (sort === 'rating') {
    query = query.order('rating_overall', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('published_at', { ascending: false })
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const [articlesRes, brandsRes, countRes] = await Promise.all([
    query,
    supabase.from('articles').select('brand').eq('series', 'dna').eq('is_draft', false),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('series', 'dna').eq('is_draft', false),
  ])

  const articles = (articlesRes.data ?? []) as Article[]
  const totalCount = countRes.count ?? 0

  // Unique brands
  const allBrands = Array.from(new Set((brandsRes.data ?? []).map((r: any) => r.brand).filter(Boolean))) as string[]

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <>
      {/* Page header */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg), rgba(201,162,39,0.04))' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)' }} />
            <span className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--red)' }}>
              DNA Series
            </span>
          </div>
          <h1
            className="font-serif font-black tracking-[-0.02em] leading-[0.95] mb-6"
            style={{ fontSize: 'clamp(48px,6vw,80px)', color: 'var(--text)' }}
          >
            Pribeh kazdeho auta.
          </h1>
          <div className="flex gap-8">
            <Stat num={String(totalCount)} label="clanku" />
            <Stat num={String(allBrands.length)} label="znacek" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <div
          className="sticky z-[100] flex items-center gap-2 overflow-x-auto px-8 max-w-content mx-auto"
          style={{
            top: 'calc(28px + var(--nav-h))',
            height: 56,
            background: 'rgba(10,12,16,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--bdr)',
          }}
        >
          <FilterBtn href="/dna" active={!brand} label="Vse" />
          {allBrands.map((b) => (
            <FilterBtn key={b} href={`/dna?brand=${encodeURIComponent(b)}${sort !== 'newest' ? `&sort=${sort}` : ''}`} active={brand === b} label={b} />
          ))}
          <div className="ml-auto flex gap-1">
            <FilterBtn href={`/dna${brand ? `?brand=${brand}&` : '?'}sort=newest`} active={sort === 'newest'} label="Nejnovejsi" />
            <FilterBtn href={`/dna${brand ? `?brand=${brand}&` : '?'}sort=rating`} active={sort === 'rating'} label="Hodnoceni" />
          </div>
        </div>
      </Suspense>

      {/* Articles grid */}
      <div className="max-w-content mx-auto px-8 py-8">
        {/* Featured */}
        {featured && <FeaturedCard article={featured} />}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-[2px] rounded-lg overflow-hidden mt-[2px]" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="py-20 text-center">
            <div className="font-cond text-lg font-bold uppercase" style={{ color: 'var(--text3)' }}>
              Zadne clanky {brand ? `pro ${brand}` : ''}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-cond text-[28px] font-black leading-none" style={{ color: 'var(--gold)' }}>{num}</div>
      <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase mt-0.5" style={{ color: 'var(--text3)' }}>{label}</div>
    </div>
  )
}

function FilterBtn({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className="shrink-0 font-cond text-xs font-bold tracking-[0.1em] uppercase px-3.5 py-1.5 rounded-md no-underline transition-all duration-150"
      style={{
        background: active ? 'var(--gold)' : 'transparent',
        color: active ? '#000' : 'var(--text3)',
        border: active ? 'none' : '1px solid var(--bdr)',
      }}
    >
      {label}
    </Link>
  )
}

function FeaturedCard({ article }: { article: Article }) {
  const imgSrc = article.hero_photo_url ?? (article.set_number ? setImageUrl(article.set_number) : null)

  return (
    <Link
      href={`/dna/${article.slug}`}
      className="group block no-underline rounded-lg overflow-hidden"
      style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}
    >
      <div className="relative" style={{ position: 'relative' }}>
        <div className="absolute left-0 top-0 bottom-0 w-[2px] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 z-10" style={{ background: 'var(--gold)' }} />
        {imgSrc && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
            <Image src={imgSrc} alt={article.title} fill className="object-cover photo-dark" sizes="100vw" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,22,32,0.95) 0%, rgba(17,22,32,0.3) 50%, transparent 100%)' }} />
            {article.set_number && (
              <div className="absolute top-4 right-4 z-[3] text-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms]" style={{ background: 'rgba(10,12,16,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '9px 13px' }}>
                <div className="font-cond text-[8px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Set No.</div>
                <div className="font-cond text-base font-black leading-none" style={{ color: 'rgba(255,255,255,0.92)' }}>{article.set_number}</div>
              </div>
            )}
          </div>
        )}
        <div className="p-5">
          <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text3)' }}>
            {article.brand} · #{article.number}
          </div>
          <div className="font-cond text-[26px] font-black uppercase leading-[1.05] mb-2 group-hover:text-red transition-colors duration-200" style={{ color: 'var(--text)' }}>
            {article.title}
          </div>
          {article.excerpt && <p className="text-[13px] leading-[1.55] mb-3" style={{ color: 'var(--text2)' }}>{article.excerpt}</p>}
          <div className="flex justify-between items-center font-cond text-[11px] tracking-[0.1em] uppercase pt-3" style={{ color: 'var(--text3)', borderTop: '1px solid var(--bdr)' }}>
            <span>{article.brand} · {article.published_at ? new Date(article.published_at).getFullYear() : ''}</span>
            <div className="flex items-center gap-2">
              {article.rating_overall && (
                <span className="font-cond text-lg font-black" style={{ color: 'var(--gold)' }}>
                  {article.rating_overall.toFixed(1)}<span className="text-xs" style={{ color: 'var(--text3)' }}>/10</span>
                </span>
              )}
              <span>{article.read_time_min ? `${article.read_time_min} min` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: Article }) {
  const imgSrc = article.hero_photo_url ?? (article.set_number ? setImageUrl(article.set_number) : null)

  return (
    <Link
      href={`/dna/${article.slug}`}
      className="group block no-underline"
      style={{ background: 'var(--sur)' }}
    >
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 z-10" style={{ background: 'var(--red)' }} />
        {imgSrc && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image src={imgSrc} alt={article.title} fill className="object-cover photo-dark" sizes="50vw" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,22,32,0.95) 0%, rgba(17,22,32,0.3) 50%, transparent 100%)' }} />
            {article.set_number && (
              <div className="absolute top-3 right-3 z-[3] text-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms]" style={{ background: 'rgba(10,12,16,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px' }}>
                <div className="font-cond text-[7px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Set No.</div>
                <div className="font-cond text-base font-black leading-none" style={{ color: 'rgba(255,255,255,0.9)' }}>{article.set_number}</div>
              </div>
            )}
          </div>
        )}
        <div className="p-[18px]">
          <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text3)' }}>
            {article.brand}
          </div>
          <div className="font-cond text-xl font-black uppercase leading-[1.05] mb-2 group-hover:text-red transition-colors duration-200" style={{ color: 'var(--text)' }}>
            {article.title}
          </div>
          <div className="flex justify-between items-center font-cond text-[11px] tracking-[0.1em] uppercase pt-3" style={{ color: 'var(--text3)', borderTop: '1px solid var(--bdr)' }}>
            <span>{article.read_time_min ? `${article.read_time_min} min` : ''}</span>
            {article.rating_overall && (
              <span className="font-cond text-lg font-black" style={{ color: 'var(--gold)' }}>
                {article.rating_overall.toFixed(1)}<span className="text-xs" style={{ color: 'var(--text3)' }}>/10</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
