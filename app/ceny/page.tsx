import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { LegoSet, PriceSnapshot } from '@/lib/supabase/types'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pit Stop — Ceny dnes',
  description: 'Aktualni ceny LEGO Speed Champions setu. Mall.cz, Alza, LEGO.com, BrickLink. Price alerts zdarma.',
}

interface Props {
  searchParams: { tab?: string; brand?: string; q?: string }
}

const tabs = [
  { key: 'all', label: 'Aktualni ceny' },
  { key: 'sale', label: 'Slevy' },
  { key: 'retiring', label: 'Retiring soon' },
  { key: 'retired', label: 'Retired sety' },
]

const rowBorder: Record<string, string> = {
  sale: '3px solid var(--green)',
  retiring: '3px solid var(--orange)',
  new: '3px solid #3498DB',
  hot: '3px solid var(--red)',
}

const badgeCfg: Record<string, { label: string; cls: string }> = {
  available: { label: 'Dostupny', cls: 'bg-[rgba(255,255,255,0.06)] text-[var(--text3)]' },
  retiring: { label: 'Retiring', cls: 'bg-[rgba(230,126,34,0.15)] text-[#E67E22]' },
  retired: { label: 'Retired', cls: 'bg-[rgba(200,40,30,0.15)] text-[#E8715B]' },
  upcoming: { label: 'Novy', cls: 'bg-[rgba(52,152,219,0.15)] text-[#5DADE2]' },
}

export default async function CenyPage({ searchParams }: Props) {
  const supabase = createServerClient()
  const tab = searchParams.tab ?? 'all'
  const brand = searchParams.brand

  // Fetch sets with optional filtering
  let setsQuery = supabase.from('sets').select('*')
  if (tab === 'retiring') setsQuery = setsQuery.eq('status', 'retiring')
  else if (tab === 'retired') setsQuery = setsQuery.eq('status', 'retired')
  if (brand) setsQuery = setsQuery.eq('brand', brand)
  setsQuery = setsQuery.order('year_released', { ascending: false }).limit(50)

  const [setsRes, pricesRes, statsRes] = await Promise.all([
    setsQuery,
    supabase.from('current_prices').select('*'),
    supabase.from('sets').select('id, status', { count: 'exact', head: false }),
  ])

  const sets = (setsRes.data ?? []) as LegoSet[]
  const allPrices = (pricesRes.data ?? []) as PriceSnapshot[]
  const allStats = (statsRes.data ?? []) as { id: string; status: string }[]

  // Build price map: set_number -> store -> price
  const priceMap = new Map<string, Map<string, PriceSnapshot>>()
  for (const p of allPrices) {
    if (!priceMap.has(p.set_number)) priceMap.set(p.set_number, new Map())
    priceMap.get(p.set_number)!.set(p.store, p)
  }

  // Stats
  const saleCount = allPrices.filter(p => p.discount_pct && p.discount_pct > 0).length
  const retiringCount = allStats.filter(s => s.status === 'retiring').length
  const upcomingCount = allStats.filter(s => s.status === 'upcoming').length

  // Get unique brands for filter
  const brands = Array.from(new Set(sets.map(s => s.brand))).sort()

  // Filter for sale tab
  let displaySets = sets
  if (tab === 'sale') {
    displaySets = sets.filter(s => {
      const sp = priceMap.get(s.set_number)
      return sp && Array.from(sp.values()).some(p => p.discount_pct && p.discount_pct > 0)
    })
  }

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { tab, brand, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v && !(k === 'tab' && v === 'all')) p.set(k, v)
    }
    const s = p.toString()
    return `/ceny${s ? `?${s}` : ''}`
  }

  return (
    <>
      {/* Page header */}
      <div className="pt-[100px] pb-10" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8 grid items-end gap-8" style={{ gridTemplateColumns: '1fr auto' }}>
          <div>
            <div className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-1.5" style={{ color: 'var(--green)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--green)', animation: 'live-pulse 2s ease-in-out infinite' }} />
              Live data
            </div>
            <h1 className="font-serif font-black tracking-[-0.02em] leading-[0.95] mb-3" style={{ fontSize: 'clamp(40px,5vw,64px)', color: 'var(--text)' }}>
              Pit Stop —<br />ceny dnes
            </h1>
            <div className="font-cond text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--text3)' }}>
              Zdroje: Mall.cz, Alza, LEGO.com, BrickLink
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { n: String(saleCount), l: 'Aktivnich slev', c: 'var(--green)' },
              { n: String(retiringCount), l: 'Retiring brzy', c: 'var(--orange)' },
              { n: String(upcomingCount), l: 'Novych setu', c: '#5DADE2' },
              { n: String(allStats.length), l: 'Setu celkem', c: 'var(--gold)' },
            ].map(s => (
              <div key={s.l} className="text-center rounded-[10px] px-5 py-4" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
                <div className="font-cond text-[28px] font-black leading-none mb-1" style={{ color: s.c }}>{s.n}</div>
                <div className="font-cond text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-[86px] z-[100]" style={{ background: 'rgba(10,12,16,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8 flex items-center">
          {tabs.map(t => (
            <Link
              key={t.key}
              href={buildUrl({ tab: t.key })}
              className="font-cond text-[13px] font-bold tracking-[0.1em] uppercase px-5 py-4 no-underline transition-all duration-200"
              style={{
                color: tab === t.key ? 'var(--gold)' : 'var(--text3)',
                borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              {t.label}
            </Link>
          ))}
          <div className="flex-1" />
          <Suspense fallback={null}>
            <form action="/ceny" className="flex items-center gap-2">
              <input type="hidden" name="tab" value={tab} />
              <input
                name="q"
                defaultValue={searchParams.q}
                placeholder="Hledat set nebo model..."
                className="px-3.5 py-[7px] rounded-md font-sans text-[13px] w-[220px] outline-none transition-colors focus:border-[var(--gold)]"
                style={{ background: 'var(--sur)', border: '1px solid var(--bdr)', color: 'var(--text)' }}
              />
            </form>
          </Suspense>
        </div>
      </div>

      {/* Brand filters */}
      <div style={{ background: 'var(--sur)', borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8 py-3 flex items-center gap-2.5 flex-wrap">
          <span className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>Znacka:</span>
          <Link href={buildUrl({ brand: undefined })} className={`font-cond text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-[5px] rounded-[5px] no-underline transition-all ${!brand ? 'bg-gold text-black' : ''}`} style={brand ? { border: '1px solid var(--bdr)', color: 'var(--text3)' } : {}}>Vse</Link>
          {brands.slice(0, 8).map(b => (
            <Link key={b} href={buildUrl({ brand: b })} className={`font-cond text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-[5px] rounded-[5px] no-underline transition-all ${brand === b ? 'bg-gold text-black' : ''}`} style={brand !== b ? { border: '1px solid var(--bdr)', color: 'var(--text3)' } : {}}>
              {b}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-content mx-auto px-8 py-8 pb-20">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-4 flex-wrap">
          {[
            { c: 'var(--green)', l: 'Sleva' },
            { c: 'var(--orange)', l: 'Retiring soon' },
            { c: '#3498DB', l: 'Novy set' },
            { c: 'var(--red)', l: 'Zdrazujici / Hot' },
          ].map(leg => (
            <div key={leg.l} className="flex items-center gap-1.5 font-cond text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text3)' }}>
              <div className="w-4 h-[3px] rounded-sm" style={{ background: leg.c }} />
              {leg.l}
            </div>
          ))}
        </div>

        {/* Price table */}
        <div className="rounded-xl overflow-hidden mb-8" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
          {/* Header */}
          <div className="grid items-center px-5 py-3" style={{ gridTemplateColumns: '280px 80px 1fr 1fr 1fr 1fr 80px 80px', background: 'var(--sur2)', borderBottom: '1px solid var(--bdr)' }}>
            {['Set / Model', 'Dilku', 'Mall.cz', 'Alza.cz', 'LEGO.com', 'BrickLink', 'Stav', 'Alert'].map(h => (
              <div key={h} className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {displaySets.map(set => {
            const sp = priceMap.get(set.set_number)
            const mall = sp?.get('mall')
            const alza = sp?.get('alza')
            const lego = sp?.get('lego')
            const bl = sp?.get('bricklink')
            const badge = badgeCfg[set.status] ?? badgeCfg.available

            // Determine row type
            let rowType = ''
            if (set.status === 'retiring') rowType = 'retiring'
            else if (set.status === 'upcoming') rowType = 'new'
            else if (mall?.discount_pct && mall.discount_pct > 0) rowType = 'sale'

            return (
              <div
                key={set.id}
                className="grid items-center px-5 py-3.5 transition-colors duration-150 hover:bg-sur2"
                style={{
                  gridTemplateColumns: '280px 80px 1fr 1fr 1fr 1fr 80px 80px',
                  borderBottom: '1px solid var(--bdr)',
                  borderLeft: rowBorder[rowType] ?? 'none',
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <Image
                    src={set.brickset_img_url ?? setImageUrl(set.set_number)}
                    alt={set.name}
                    width={48}
                    height={30}
                    className="rounded object-cover"
                    style={{ background: 'var(--sur2)', filter: 'brightness(0.2)' }}
                  />
                  <div>
                    <div className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>{set.brand}</div>
                    <div className="font-cond text-sm font-black uppercase leading-[1.1]" style={{ color: 'var(--text)' }}>{set.name}</div>
                    <div className="font-cond text-[9px] tracking-[0.1em]" style={{ color: 'var(--text3)' }}>Set {set.set_number}</div>
                  </div>
                </div>

                {/* Pieces */}
                <div className="font-cond text-[13px]" style={{ color: 'var(--text3)' }}>{set.pieces ?? '—'}</div>

                {/* Prices */}
                <PriceCell price={mall} rrp={set.rrp_czk} />
                <PriceCell price={alza} rrp={set.rrp_czk} />
                <PriceCell price={lego} rrp={set.rrp_czk} />
                <PriceCell price={bl} rrp={set.rrp_czk} isBrickLink />

                {/* Status */}
                <div>
                  <span className={`font-cond text-[9px] font-bold tracking-[0.12em] uppercase px-[7px] py-[3px] rounded ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Alert */}
                <button className="font-cond text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-1 rounded border-none cursor-pointer transition-all duration-150 hover:border-[var(--gold)] hover:text-gold" style={{ background: 'none', border: '1px solid var(--bdr)', color: 'var(--text3)' }}>
                  + Alert
                </button>
              </div>
            )
          })}

          {displaySets.length === 0 && (
            <div className="py-12 text-center font-cond text-sm uppercase" style={{ color: 'var(--text3)' }}>
              Zadne sety v teto kategorii
            </div>
          )}
        </div>

        {/* Price Alert Section */}
        <PriceAlertSection />
      </div>
    </>
  )
}

function PriceCell({ price, rrp, isBrickLink }: { price?: PriceSnapshot; rrp: number | null; isBrickLink?: boolean }) {
  if (!price) {
    return <div className="font-cond text-[13px]" style={{ color: 'var(--text3)' }}>{isBrickLink ? '—' : 'Nedostupne'}</div>
  }

  const isBest = rrp && price.price_czk < rrp
  const isHigh = rrp && price.price_czk > rrp * 1.2

  return (
    <div className="font-cond text-[13px]" style={{ color: isBest ? 'var(--green)' : isHigh ? 'var(--red)' : 'var(--text2)', fontWeight: isBest ? 700 : 400 }}>
      {formatCZK(price.price_czk)}
      {price.discount_pct && price.discount_pct > 0 && (
        <small className="ml-1 text-[10px]" style={{ color: 'var(--green)' }}>-{price.discount_pct.toFixed(0)}%</small>
      )}
    </div>
  )
}

function PriceAlertSection() {
  return (
    <div className="rounded-xl p-7" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-serif font-black tracking-[-0.02em] text-[28px] mb-1.5" style={{ color: 'var(--text)' }}>Price Alert</div>
          <div className="text-sm" style={{ color: 'var(--text2)' }}>Nastav cilovou cenu — upozornime te emailem kdyz set zlevni.</div>
        </div>
        <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-3.5 py-1.5 rounded-md" style={{ border: '1px solid rgba(201,162,39,0.3)', color: 'var(--gold)' }}>
          Zdarma
        </div>
      </div>
      <form
        action="/api/price-alert"
        method="POST"
        className="grid items-end gap-2.5"
        style={{ gridTemplateColumns: '1fr 200px 160px 160px auto' }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Tvuj email</label>
          <input name="email" type="email" required placeholder="tvuj@email.cz" className="px-3.5 py-2.5 rounded-[7px] font-sans text-sm outline-none transition-colors focus:border-[var(--gold)]" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Set cislo</label>
          <input name="set_number" type="text" required placeholder="napr. 76934" className="px-3.5 py-2.5 rounded-[7px] font-sans text-sm outline-none transition-colors focus:border-[var(--gold)]" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Cilova cena</label>
          <input name="target_price_czk" type="number" required placeholder="500" className="px-3.5 py-2.5 rounded-[7px] font-sans text-sm outline-none transition-colors focus:border-[var(--gold)]" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>Obchod</label>
          <select name="store" className="px-3.5 py-2.5 rounded-[7px] font-sans text-sm cursor-pointer outline-none" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)' }}>
            <option value="any">Jakykoli</option>
            <option value="mall">Mall.cz</option>
            <option value="alza">Alza.cz</option>
            <option value="lego">LEGO.com</option>
          </select>
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-[7px] border-none cursor-pointer font-cond text-xs font-bold tracking-[0.12em] uppercase whitespace-nowrap" style={{ background: 'var(--gold)', color: '#000' }}>
          Nastavit alert →
        </button>
      </form>
    </div>
  )
}
