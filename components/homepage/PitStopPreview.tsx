import Link from 'next/link'
import type { LegoSet } from '@/lib/supabase/types'
import { formatCZK } from '@/lib/utils'
import { SectionHead } from './SectionHead'

function statusBadge(set: LegoSet) {
  if (set.status === 'retiring') return { label: 'Retiring soon', cls: 'bg-[rgba(200,40,30,0.12)] text-[#E8352A]' }
  if (set.status === 'retired') return { label: 'Retired', cls: 'bg-[rgba(169,126,208,0.1)] text-[#A97ED0]' }
  if (set.status === 'upcoming') return { label: 'Novy', cls: 'bg-[rgba(92,160,224,0.1)] text-[#5CA0E0]' }
  return { label: 'Dostupny', cls: 'bg-[rgba(30,158,90,0.12)] text-[#1E9E5A]' }
}

const accentColors: Record<string, string> = {
  available: '#1E9E5A',
  retiring: 'var(--red)',
  retired: '#A97ED0',
  upcoming: '#5CA0E0',
}

export function PitStopPreview({ sets }: { sets: LegoSet[] }) {
  const display = sets.slice(0, 5)
  if (display.length === 0) return null

  return (
    <div className="rounded-[10px] overflow-hidden mb-11" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--bdr)' }}>
        <div className="flex items-center gap-2 font-cond text-xs font-bold tracking-[0.18em] uppercase">
          <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#1E9E5A', boxShadow: '0 0 6px #1E9E5A', animation: 'live-pulse 2s ease-in-out infinite' }} />
          Pit Stop — ceny dnes
        </div>
        <Link href="/ceny" className="font-cond text-[10px] tracking-[0.1em] uppercase no-underline" style={{ color: 'var(--text3)' }}>
          Vsechny ceny →
        </Link>
      </div>

      {/* Price cards row */}
      <div className="grid grid-cols-5">
        {display.map((set, i) => {
          const badge = statusBadge(set)
          const accent = accentColors[set.status] ?? 'var(--gold)'
          return (
            <Link
              key={set.id}
              href="/ceny"
              className="group block relative no-underline px-[18px] py-4 transition-colors duration-150 hover:bg-sur2"
              style={{ borderRight: i < 4 ? '1px solid var(--bdr)' : 'none' }}
            >
              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200"
                style={{ background: accent }}
              />
              <div className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase mb-0.5" style={{ color: 'var(--text3)' }}>
                {set.brand}
              </div>
              <div className="font-cond text-sm font-bold tracking-[0.05em] uppercase leading-[1.1] mb-2" style={{ color: 'var(--text)' }}>
                {set.name}
              </div>
              <div className="font-cond text-[26px] font-black leading-none mb-1.5" style={{ color: 'var(--text)' }}>
                {set.rrp_czk ? formatCZK(set.rrp_czk) : '—'}
              </div>
              <span className={`font-cond text-[10px] font-bold tracking-[0.08em] uppercase px-[7px] py-[2px] rounded-sm ${badge.cls}`}>
                {badge.label}
              </span>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
