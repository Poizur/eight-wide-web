import Link from 'next/link'
import { SectionHead } from './SectionHead'

interface BrandStat {
  brand: string
  count: number
  minYear: number
  maxYear: number
}

export function BrandsStrip({ brands }: { brands: BrandStat[] }) {
  const display = brands.slice(0, 7)
  const remaining = brands.length - 7

  return (
    <div style={{ background: 'var(--sur2)', padding: '0 0 8px' }}>
      <div className="max-w-content mx-auto px-8">
        <SectionHead title="Znacky" sub="— vsechny automobilky v nasi databazi" linkHref="/sety" linkLabel="Cela databaze" />
        <div
          className="grid grid-cols-8 gap-[2px] rounded-[10px] overflow-hidden"
          style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}
        >
          {display.map((b) => (
            <Link
              key={b.brand}
              href={`/sety?brand=${encodeURIComponent(b.brand)}`}
              className="block text-center no-underline py-[22px] px-4 transition-colors duration-200 hover:bg-sur2"
              style={{ background: 'var(--sur)' }}
            >
              <div className="font-cond text-[15px] font-black tracking-[0.04em] uppercase mb-2" style={{ color: 'var(--text)' }}>
                {b.brand}
              </div>
              <div className="font-cond text-[22px] font-black leading-none" style={{ color: 'var(--gold)' }}>
                {b.count} setu
              </div>
              <div className="font-cond text-[10px] tracking-[0.14em] uppercase mt-1" style={{ color: 'var(--text3)' }}>
                {b.minYear} — {b.maxYear}
              </div>
            </Link>
          ))}
          {remaining > 0 && (
            <Link
              href="/sety"
              className="block text-center no-underline py-[22px] px-4 transition-colors duration-200 hover:bg-sur2"
              style={{ background: 'var(--sur)' }}
            >
              <div className="font-cond text-[28px] font-black mb-2" style={{ color: 'var(--gold)' }}>
                +{remaining}
              </div>
              <div className="font-cond text-xs" style={{ color: 'var(--text2)' }}>
                dalsich znacek
              </div>
              <div className="font-cond text-[10px] tracking-[0.14em] uppercase mt-1" style={{ color: 'var(--text3)' }}>
                v databazi →
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
