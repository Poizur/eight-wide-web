import { createServerClient } from '@/lib/supabase/server'
import type { Rumor } from '@/lib/supabase/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paddock Rumors — co prijde priste',
  description: 'Spekulace, leaky a potvrzene informace o budoucich LEGO Speed Champions setech.',
}

const confidenceConfig: Record<string, { label: string; color: string; bg: string; pct: number }> = {
  speculation: { label: 'Spekulace', color: '#9B59B6', bg: 'rgba(155,89,182,0.12)', pct: 25 },
  probable:    { label: 'Pravdepodobne', color: '#E67E22', bg: 'rgba(230,126,34,0.12)', pct: 50 },
  likely:      { label: 'Temer jiste', color: '#27AE60', bg: 'rgba(39,174,96,0.12)', pct: 75 },
  confirmed:   { label: 'Potvrzeno', color: '#3498DB', bg: 'rgba(52,152,219,0.12)', pct: 100 },
}

export default async function PaddockPage() {
  const supabase = createServerClient()

  const [rumorsRes, fulfilledRes] = await Promise.all([
    supabase.from('rumors').select('*').eq('fulfilled', false)
      .order('created_at', { ascending: false }),
    supabase.from('rumors').select('*').eq('fulfilled', true)
      .order('fulfilled_at', { ascending: false }).limit(5),
  ])

  const rumors = (rumorsRes.data ?? []) as Rumor[]
  const fulfilled = (fulfilledRes.data ?? []) as Rumor[]

  const featured = rumors[0]
  const rest = rumors.slice(1)

  // Stats per confidence
  const stats = Object.entries(confidenceConfig).map(([key, cfg]) => ({
    ...cfg,
    key,
    count: rumors.filter(r => r.confidence === key).length,
  }))

  return (
    <>
      {/* Hero */}
      <div className="relative pt-[100px] pb-10 overflow-hidden" style={{ borderBottom: '1px solid var(--bdr)' }}>
        {/* Large BG text */}
        <div className="absolute font-cond font-black leading-none pointer-events-none select-none" style={{ fontSize: 'clamp(120px,18vw,240px)', color: 'rgba(255,255,255,0.015)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap' }}>
          PADDOCK RUMORS
        </div>

        <div className="max-w-content mx-auto px-8 relative z-[2]">
          <div className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--red)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--red)', animation: 'live-pulse 1s ease-in-out infinite' }} />
            Paddock Rumors · Live
          </div>
          <h1 className="font-serif font-black tracking-[-0.02em] leading-[0.95] mb-6" style={{ fontSize: 'clamp(40px,5vw,64px)', color: 'var(--text)' }}>
            Co prijde priste?
          </h1>

          {/* Stats + Legend */}
          <div className="flex gap-5 mb-6">
            {stats.map(s => (
              <div key={s.key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                <span className="font-cond text-xs font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--text2)' }}>{s.label}</span>
                <span className="font-cond text-sm font-black" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-8 py-10 pb-20">
        {/* Featured */}
        {featured && (
          <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="p-6">
              <ConfidenceBadge confidence={featured.confidence} />
              <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mt-3 mb-1" style={{ color: 'var(--text3)' }}>{featured.brand}</div>
              <div className="font-cond text-[28px] font-black uppercase leading-[1.05] mb-3" style={{ color: 'var(--text)' }}>{featured.car_name}</div>
              {featured.description && <p className="text-[15px] leading-[1.65] mb-4 max-w-[600px]" style={{ color: 'var(--text2)' }}>{featured.description}</p>}
              {featured.source && <div className="font-cond text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--text3)' }}>Zdroj: {featured.source}</div>}
              {/* Meter bar */}
              <div className="mt-4 h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', maxWidth: 400 }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${confidenceConfig[featured.confidence]?.pct ?? 25}%`, background: confidenceConfig[featured.confidence]?.color }} />
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-[2px] rounded-xl overflow-hidden mb-12" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
            {rest.map(r => (
              <div key={r.id} className="p-5" style={{ background: 'var(--sur)' }}>
                <ConfidenceBadge confidence={r.confidence} />
                <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mt-2 mb-0.5" style={{ color: 'var(--text3)' }}>{r.brand}</div>
                <div className="font-cond text-lg font-black uppercase leading-[1.1] mb-2" style={{ color: 'var(--text)' }}>{r.car_name}</div>
                {r.description && <p className="text-[13px] leading-[1.55] mb-3" style={{ color: 'var(--text2)' }}>{r.description}</p>}
                {r.source && <div className="font-cond text-[9px] tracking-[0.1em] uppercase" style={{ color: 'var(--text3)' }}>Zdroj: {r.source}</div>}
                <div className="mt-3 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${confidenceConfig[r.confidence]?.pct ?? 25}%`, background: confidenceConfig[r.confidence]?.color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fulfilled rumors */}
        {fulfilled.length > 0 && (
          <div>
            <div className="font-cond text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text3)' }}>
              Splnene rumors
            </div>
            <div className="flex flex-col gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
              {fulfilled.map(r => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3" style={{ background: 'var(--sur)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(39,174,96,0.15)' }}>
                    <span style={{ color: 'var(--green)', fontSize: 12 }}>&#10003;</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-cond text-sm font-black uppercase" style={{ color: 'var(--text)' }}>{r.car_name}</span>
                    <span className="font-cond text-xs ml-2" style={{ color: 'var(--text3)' }}>{r.brand}</span>
                  </div>
                  {r.set_number && <span className="font-cond text-xs font-bold" style={{ color: 'var(--gold)' }}>Set {r.set_number}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {rumors.length === 0 && fulfilled.length === 0 && (
          <div className="text-center py-20 font-cond text-lg uppercase" style={{ color: 'var(--text3)' }}>
            Zatim zadne rumors
          </div>
        )}
      </div>
    </>
  )
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const cfg = confidenceConfig[confidence] ?? confidenceConfig.speculation
  return (
    <span className="inline-flex items-center gap-1.5 font-cond text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-[3px] rounded" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}
