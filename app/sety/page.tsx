import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { LegoSet } from '@/lib/supabase/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Databaze setu',
  description: 'Vsechna LEGO Speed Champions auta na jednom miste. Filtry, hodnoceni, ceny.',
}

interface Props {
  searchParams: {
    q?: string; brand?: string; status?: string; era?: string
    line?: string; sort?: string; page?: string
  }
}

const PAGE_SIZE = 24

export default async function SetyPage({ searchParams }: Props) {
  const supabase = createServerClient()
  const { q, brand, status, era, line, sort = 'newest', page: pageStr } = searchParams
  const page = parseInt(pageStr ?? '1', 10)

  let query = supabase.from('sets').select('*', { count: 'exact' })

  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,set_number.ilike.%${q}%`)
  if (brand) query = query.eq('brand', brand)
  if (status) query = query.eq('status', status)
  if (era) query = query.eq('era', era)
  if (line) query = query.eq('lego_line', line)

  if (sort === 'rating') query = query.order('rating_overall', { ascending: false, nullsFirst: false })
  else if (sort === 'price_asc') query = query.order('rrp_czk', { ascending: true, nullsFirst: false })
  else if (sort === 'pieces') query = query.order('pieces', { ascending: false, nullsFirst: false })
  else query = query.order('year_released', { ascending: false, nullsFirst: false })

  query = query.range(0, page * PAGE_SIZE - 1)

  const [setsRes, brandsRes, statsRes] = await Promise.all([
    query,
    supabase.from('sets').select('brand'),
    supabase.from('sets').select('id, status', { count: 'exact', head: false }),
  ])

  const sets = (setsRes.data ?? []) as LegoSet[]
  const totalCount = setsRes.count ?? 0
  const hasMore = sets.length < totalCount

  // Brand counts
  const brandCounts = new Map<string, number>()
  for (const r of (brandsRes.data ?? []) as { brand: string }[]) {
    brandCounts.set(r.brand, (brandCounts.get(r.brand) ?? 0) + 1)
  }
  const brands = Array.from(brandCounts.entries())
    .map(([b, c]) => ({ brand: b, count: c }))
    .sort((a, b) => b.count - a.count)

  // Stats
  const allStats = (statsRes.data ?? []) as { id: string; status: string }[]
  const statsTotal = allStats.length
  const statsAvailable = allStats.filter(s => s.status === 'available').length
  const statsRetired = allStats.filter(s => s.status === 'retired').length

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { q, brand, status, era, line, sort, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== 'newest' || (k === 'sort' && v && v !== 'newest')) p.set(k, v)
    }
    const s = p.toString()
    return `/sety${s ? `?${s}` : ''}`
  }

  return (
    <>
      {/* Search hero */}
      <div className="pt-[100px]" style={{ background: 'linear-gradient(to bottom, rgba(201,162,39,0.03), transparent)' }}>
        <div className="max-w-content mx-auto px-8 pb-9" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            Databaze setu
          </div>
          <h1 className="font-serif font-bold tracking-[-0.02em] leading-[0.95] mb-6" style={{ fontSize: 'clamp(40px,5vw,60px)', color: 'var(--text)' }}>
            Vsechna Speed<br />Champions auta
          </h1>

          {/* Search */}
          <Suspense fallback={null}>
            <form action="/sety" className="flex gap-2.5 max-w-[680px] relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Hledat auto, set cislo, znacku..."
                className="flex-1 px-5 py-3.5 rounded-[9px] font-sans text-[15px] outline-none transition-colors duration-200 focus:border-[var(--gold)]"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', color: 'var(--text)' }}
              />
            </form>
          </Suspense>

          {/* Stats */}
          <div className="flex gap-6 mt-5">
            {[
              { n: String(statsTotal), l: 'setu celkem' },
              { n: String(statsAvailable), l: 'dostupnych' },
              { n: String(statsRetired), l: 'retired' },
              { n: String(brands.length), l: 'znacek' },
            ].map(s => (
              <div key={s.l}>
                <div className="font-cond text-[22px] font-black leading-none" style={{ color: 'var(--gold)' }}>{s.n}</div>
                <div className="font-cond text-[9px] tracking-[0.16em] uppercase mt-0.5" style={{ color: 'var(--text3)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout: sidebar + results */}
      <div className="max-w-content mx-auto px-8 grid gap-8 pt-8 pb-20" style={{ gridTemplateColumns: '240px 1fr' }}>
        {/* Filters sidebar */}
        <aside className="sticky top-[76px] self-start">
          {/* Era toggle */}
          <FilterSection title="Era">
            <div className="flex gap-[2px] rounded-lg overflow-hidden p-[2px]" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
              {[
                { label: 'Vse', value: undefined },
                { label: '6-wide', value: '6wide' },
                { label: '8-wide', value: '8wide' },
              ].map(e => (
                <Link
                  key={e.label}
                  href={buildUrl({ era: e.value })}
                  className="flex-1 text-center font-cond text-[11px] font-bold tracking-[0.1em] uppercase py-[7px] rounded-md no-underline transition-all duration-200"
                  style={{
                    background: era === e.value || (!era && !e.value) ? 'var(--gold)' : 'transparent',
                    color: era === e.value || (!era && !e.value) ? '#000' : 'var(--text3)',
                  }}
                >
                  {e.label}
                </Link>
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Stav">
            {[
              { label: 'Vse', value: undefined },
              { label: 'Dostupny', value: 'available' },
              { label: 'Retiring', value: 'retiring' },
              { label: 'Retired', value: 'retired' },
              { label: 'Chystane', value: 'upcoming' },
            ].map(s => (
              <FilterRow
                key={s.label}
                href={buildUrl({ status: s.value })}
                active={status === s.value || (!status && !s.value)}
                label={s.label}
              />
            ))}
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Znacka">
            <FilterRow href={buildUrl({ brand: undefined })} active={!brand} label="Vse" count={statsTotal} />
            {brands.slice(0, 10).map(b => (
              <FilterRow
                key={b.brand}
                href={buildUrl({ brand: b.brand })}
                active={brand === b.brand}
                label={b.brand}
                count={b.count}
              />
            ))}
          </FilterSection>

          {/* Line */}
          <FilterSection title="Produktova rada">
            {[
              { label: 'Vse', value: undefined },
              { label: 'Speed Champions', value: 'speed_champions' },
              { label: 'Icons', value: 'icons' },
              { label: 'Technic', value: 'technic' },
            ].map(l => (
              <FilterRow
                key={l.label}
                href={buildUrl({ line: l.value })}
                active={line === l.value || (!line && !l.value)}
                label={l.label}
              />
            ))}
          </FilterSection>

          <Link
            href="/sety"
            className="block w-full text-center font-cond text-[11px] font-bold tracking-[0.14em] uppercase py-2.5 rounded-[7px] no-underline transition-all duration-150 hover:border-[rgba(255,255,255,0.2)]"
            style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}
          >
            Resetovat filtry
          </Link>
        </aside>

        {/* Results */}
        <div>
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <div className="font-cond text-xs font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>
              Zobrazeno <span style={{ color: 'var(--gold)' }}>{sets.length}</span> z <span style={{ color: 'var(--gold)' }}>{totalCount}</span> setu
            </div>
            <div className="flex gap-1">
              {[
                { label: 'Nejnovejsi', value: 'newest' },
                { label: 'Skore', value: 'rating' },
                { label: 'Cena', value: 'price_asc' },
                { label: 'Dilky', value: 'pieces' },
              ].map(s => (
                <Link
                  key={s.value}
                  href={buildUrl({ sort: s.value })}
                  className="font-cond text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-[5px] rounded-[5px] no-underline transition-all duration-150"
                  style={{
                    background: sort === s.value ? 'var(--sur)' : 'transparent',
                    border: `1px solid ${sort === s.value ? 'rgba(255,255,255,0.15)' : 'var(--bdr)'}`,
                    color: sort === s.value ? 'var(--text)' : 'var(--text3)',
                  }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Sets grid */}
          <div
            className="grid grid-cols-4 gap-[2px] rounded-xl overflow-hidden"
            style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}
          >
            {sets.map(set => <SetCard key={set.id} set={set} />)}

            {hasMore && (
              <div className="flex items-center justify-center" style={{ background: 'var(--sur)', minHeight: 200, border: '2px dashed var(--bdr)' }}>
                <div className="text-center p-5">
                  <div className="font-cond text-[28px] font-black" style={{ color: 'var(--text3)' }}>+{totalCount - sets.length}</div>
                  <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase mt-1" style={{ color: 'var(--text3)' }}>dalsich setu</div>
                </div>
              </div>
            )}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="font-cond text-xs font-bold tracking-[0.16em] uppercase px-8 py-3.5 rounded-lg no-underline transition-all duration-200 hover:border-[rgba(255,255,255,0.2)] hover:text-[var(--text2)]"
                style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}
              >
                Nacist dalsich {PAGE_SIZE} setu
              </Link>
            </div>
          )}

          {sets.length === 0 && (
            <div className="py-20 text-center">
              <div className="font-cond text-lg font-bold uppercase" style={{ color: 'var(--text3)' }}>
                Zadne sety nenalezeny
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase pb-2 mb-2.5" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--bdr)' }}>
        {title}
      </div>
      <div className="flex flex-col gap-[2px]">{children}</div>
    </div>
  )
}

function FilterRow({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-2.5 py-[7px] rounded-md no-underline transition-colors duration-150"
      style={{ background: active ? 'var(--sur)' : 'transparent' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
          style={{
            border: active ? 'none' : '1px solid var(--bdr)',
            background: active ? 'var(--gold)' : 'transparent',
          }}
        >
          {active && <div className="w-1.5 h-1.5 rounded-[1px]" style={{ background: '#000' }} />}
        </div>
        <span className="font-cond text-xs font-bold tracking-[0.06em] uppercase" style={{ color: active ? 'var(--text)' : 'var(--text2)' }}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="font-cond text-[11px]" style={{ color: 'var(--text3)' }}>{count}</span>
      )}
    </Link>
  )
}

function SetCard({ set }: { set: LegoSet }) {
  const imgSrc = set.brickset_img_url ?? setImageUrl(set.set_number)
  const statusCfg: Record<string, { label: string; cls: string }> = {
    available: { label: 'Dostupny', cls: 'bg-[rgba(255,255,255,0.06)] text-[var(--text3)]' },
    retired: { label: 'Retired', cls: 'bg-[rgba(200,40,30,0.2)] text-[#E8715B]' },
    retiring: { label: 'Retiring', cls: 'bg-[rgba(230,126,34,0.2)] text-[#E6923A]' },
    upcoming: { label: 'Novy', cls: 'bg-[rgba(52,152,219,0.2)] text-[#5DADE2]' },
  }
  const st = statusCfg[set.status] ?? statusCfg.available
  const dnaHref = set.dna_article_slug ? `/dna/${set.dna_article_slug}` : null

  return (
    <Link
      href={dnaHref ?? `/sety?q=${set.set_number}`}
      className="group block no-underline overflow-hidden transition-colors duration-200 hover:bg-sur2 relative"
      style={{ background: 'var(--sur)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Image src={imgSrc} alt={set.name} fill className="object-cover photo-dark" sizes="25vw" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,22,32,0.9) 0%, transparent 60%)' }} />
        {/* Set badge */}
        <div className="absolute top-2 right-2 text-center opacity-0 -translate-y-[3px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-[2]" style={{ background: 'rgba(10,12,16,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 9px' }}>
          <div className="font-cond text-[13px] font-black leading-none" style={{ color: 'rgba(255,255,255,0.9)' }}>{set.set_number}</div>
          <div className="font-cond text-[7px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Set No.</div>
        </div>
        {/* Status badge */}
        <span className={`absolute bottom-2 left-2 font-cond text-[8px] font-bold tracking-[0.12em] uppercase px-1.5 py-[2px] rounded-sm ${st.cls}`}>
          {st.label}
        </span>
        {/* Score badge */}
        {set.rating_overall && (
          <div className="absolute top-2 left-2 font-cond text-[10px] font-black px-1.5 py-[2px] rounded z-[2]" style={{ background: 'rgba(201,162,39,0.85)', color: '#000' }}>
            {set.rating_overall.toFixed(1)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <div className="font-cond text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>
          {set.brand}
        </div>
        <div className="font-cond text-sm font-black uppercase leading-[1.1] mb-1.5 group-hover:text-gold transition-colors duration-150" style={{ color: 'var(--text)' }}>
          {set.name}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-cond text-[10px] tracking-[0.1em] uppercase" style={{ color: 'var(--text3)' }}>
            {set.pieces} dilku
          </span>
          <span className="font-cond text-sm font-black" style={{ color: set.rrp_czk ? 'var(--gold)' : 'var(--text3)' }}>
            {set.rrp_czk ? formatCZK(set.rrp_czk) : 'BrickLink'}
          </span>
        </div>
      </div>
    </Link>
  )
}
