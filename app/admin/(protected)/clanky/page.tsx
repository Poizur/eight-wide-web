import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminClankyPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(50)
  const articles = data ?? []

  return (
    <div>
      <h1 className="font-cond text-2xl font-black uppercase mb-6" style={{ color: 'var(--text)' }}>Clanky ({articles.length})</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
        <div className="grid items-center px-4 py-2.5" style={{ gridTemplateColumns: '1fr 100px 80px 80px 80px', background: 'var(--sur2)', borderBottom: '1px solid var(--bdr)' }}>
          {['Titulek', 'Serie', 'Znacka', 'Rating', 'Status'].map(h => (
            <div key={h} className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>{h}</div>
          ))}
        </div>
        {articles.map((a: any) => (
          <Link
            key={a.id}
            href={`/admin/clanky/${a.slug}`}
            className="grid items-center px-4 py-2.5 no-underline transition-colors hover:bg-sur2"
            style={{ gridTemplateColumns: '1fr 100px 80px 80px 80px', borderBottom: '1px solid var(--bdr)' }}
          >
            <div>
              <span className="font-cond text-[10px] font-bold mr-2" style={{ color: 'var(--text3)' }}>#{a.number}</span>
              <span className="font-cond text-sm font-bold" style={{ color: 'var(--text)' }}>{a.title}</span>
            </div>
            <span className="font-cond text-xs uppercase" style={{ color: 'var(--gold)' }}>{a.series}</span>
            <span className="font-cond text-xs" style={{ color: 'var(--text2)' }}>{a.brand}</span>
            <span className="font-cond text-xs font-bold" style={{ color: 'var(--gold)' }}>{a.rating_overall?.toFixed(1) ?? '—'}</span>
            <span className="font-cond text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: a.is_draft ? 'var(--orange)' : 'var(--green)' }}>
              {a.is_draft ? 'Draft' : 'Published'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
