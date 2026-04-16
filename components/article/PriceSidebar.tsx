import type { PriceSnapshot } from '@/lib/supabase/types'
import { formatCZK } from '@/lib/utils'

const storeLabels: Record<string, string> = {
  mall: 'Mall.cz',
  alza: 'Alza.cz',
  lego: 'LEGO.com',
  bricklink: 'BrickLink',
}

export function PriceSidebar({ prices, setNumber }: { prices: PriceSnapshot[]; setNumber: string }) {
  if (prices.length === 0) {
    return (
      <div className="p-5 rounded-xl mb-3" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
        <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text3)' }}>
          Ceny · Set {setNumber}
        </div>
        <div className="text-xs" style={{ color: 'var(--text3)' }}>Ceny zatim nejsou k dispozici.</div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl mb-3" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text3)' }}>
        Ceny · Set {setNumber}
      </div>
      <div className="flex flex-col gap-2">
        {prices.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-1.5"
            style={{ borderBottom: i < prices.length - 1 ? '1px solid var(--bdr)' : 'none' }}
          >
            <span className="font-cond text-xs font-bold" style={{ color: 'var(--text2)' }}>
              {storeLabels[p.store] ?? p.store}
            </span>
            <div className="flex items-center gap-2">
              {p.discount_pct && p.discount_pct > 0 && (
                <span
                  className="font-cond text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'rgba(200,40,30,0.12)', color: '#E8352A' }}
                >
                  -{p.discount_pct.toFixed(0)}%
                </span>
              )}
              <span className="font-cond text-sm font-black" style={{ color: 'var(--text)' }}>
                {formatCZK(p.price_czk)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
