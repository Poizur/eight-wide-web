import Link from 'next/link'
import type { LegoSet } from '@/lib/supabase/types'
import { formatCZK } from '@/lib/utils'

function badgeFor(set: LegoSet): { label: string; cls: string } {
  if (set.status === 'retiring') return { label: 'Retiring soon', cls: 'pb-retire' }
  if (set.status === 'upcoming') return { label: 'Nový · 2026', cls: 'pb-new' }
  if (set.status === 'retired') return { label: '+42 % BL', cls: 'pb-rising' }
  return { label: 'Hot · Mall', cls: 'pb-hot' }
}

const badgeStyle: Record<string, { bg: string; color: string }> = {
  'pb-sale':   { bg: 'var(--green-bg)', color: 'var(--green)' },
  'pb-retire': { bg: 'var(--red-bg)',   color: 'var(--red)' },
  'pb-hot':    { bg: 'var(--gold-bg)',  color: 'var(--gold)' },
  'pb-new':    { bg: '#EEF3FD',         color: 'var(--blue)' },
  'pb-rising': { bg: '#F3EEF8',         color: 'var(--purple)' },
}

export function PitStopPreview({ sets }: { sets: LegoSet[] }) {
  const display = sets.slice(0, 5)
  if (display.length === 0) return null

  return (
    <div
      className="rounded-xl overflow-hidden mb-10"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 flex-wrap gap-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
          <span
            className="w-[7px] h-[7px] rounded-full"
            style={{ background: 'var(--green)', animation: 'live-pulse 2s ease-in-out infinite' }}
          />
          Pit Stop — ceny dnes
        </div>
        <div className="text-[11px]" style={{ color: 'var(--subtle)' }}>
          Aktualizováno každé pondělí · Mall.cz, Alza, LEGO.com, BrickLink
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5">
        {display.map((set, i) => {
          const b = badgeFor(set)
          const bs = badgeStyle[b.cls]
          return (
            <Link
              key={set.id}
              href="/ceny"
              className="block no-underline px-5 py-4 transition-colors duration-150 hover:bg-bg"
              style={{
                borderRight:
                  i < display.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase mb-0.5"
                style={{ letterSpacing: '0.1em', color: 'var(--subtle)' }}
              >
                {set.brand}
              </div>
              <div
                className="text-[13px] font-semibold mb-2 leading-[1.2]"
                style={{ color: 'var(--ink)' }}
              >
                {set.name}
              </div>
              <div className="text-[22px] font-bold leading-none mb-1" style={{ color: 'var(--ink)' }}>
                {set.rrp_czk ? formatCZK(set.rrp_czk) : '—'}
              </div>
              <span
                className="inline-block text-[10px] font-bold rounded px-[7px] py-[2px]"
                style={{ background: bs.bg, color: bs.color, letterSpacing: '0.05em' }}
              >
                {b.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
