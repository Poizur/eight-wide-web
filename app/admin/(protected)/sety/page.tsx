import { createServerClient } from '@/lib/supabase/server'
import type { LegoSet } from '@/lib/supabase/types'
import Link from 'next/link'
import { formatCZK } from '@/lib/utils'

export default async function AdminSetyPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('sets').select('*').order('year_released', { ascending: false }).limit(100)
  const sets = (data ?? []) as LegoSet[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cond text-2xl font-black uppercase" style={{ color: 'var(--text)' }}>Sety ({sets.length})</h1>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
        {/* Header */}
        <div className="grid items-center px-4 py-2.5" style={{ gridTemplateColumns: '80px 1fr 100px 80px 80px 80px 80px', background: 'var(--sur2)', borderBottom: '1px solid var(--bdr)' }}>
          {['Set #', 'Nazev', 'Znacka', 'Rok', 'Dilku', 'Cena', 'Status'].map(h => (
            <div key={h} className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {sets.map(s => (
          <Link
            key={s.id}
            href={`/admin/sety/${s.set_number}`}
            className="grid items-center px-4 py-2.5 no-underline transition-colors hover:bg-sur2"
            style={{ gridTemplateColumns: '80px 1fr 100px 80px 80px 80px 80px', borderBottom: '1px solid var(--bdr)' }}
          >
            <span className="font-cond text-xs font-bold" style={{ color: 'var(--gold)' }}>{s.set_number}</span>
            <span className="font-cond text-sm font-bold uppercase" style={{ color: 'var(--text)' }}>{s.name}</span>
            <span className="font-cond text-xs" style={{ color: 'var(--text2)' }}>{s.brand}</span>
            <span className="font-cond text-xs" style={{ color: 'var(--text3)' }}>{s.year_released}</span>
            <span className="font-cond text-xs" style={{ color: 'var(--text3)' }}>{s.pieces}</span>
            <span className="font-cond text-xs font-bold" style={{ color: 'var(--text)' }}>{s.rrp_czk ? formatCZK(s.rrp_czk) : '—'}</span>
            <span className="font-cond text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: s.status === 'available' ? 'var(--green)' : s.status === 'retiring' ? 'var(--orange)' : 'var(--text3)' }}>
              {s.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
