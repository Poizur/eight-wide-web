import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServerClient()

  const [setsRes, noPhotoRes, draftsRes] = await Promise.all([
    supabase.from('sets').select('id', { count: 'exact', head: true }),
    supabase.from('sets').select('set_number, name, brand').is('hero_photo_url', null).limit(10),
    supabase.from('articles').select('*').eq('is_draft', true).order('created_at', { ascending: false }).limit(10),
  ])

  const totalSets = setsRes.count ?? 0
  const noPhoto = noPhotoRes.data ?? []
  const drafts = draftsRes.data ?? []

  return (
    <div>
      <h1 className="font-cond text-2xl font-black uppercase mb-6" style={{ color: 'var(--text)' }}>Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { n: String(drafts.length), l: 'Ke schvaleni', c: 'var(--gold)' },
          { n: String(noPhoto.length), l: 'Bez fotek', c: 'var(--orange)' },
          { n: '0', l: 'Chyby', c: 'var(--green)' },
          { n: String(totalSets), l: 'Setu celkem', c: 'var(--text)' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-5" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="font-cond text-[32px] font-black leading-none mb-1" style={{ color: s.c }}>{s.n}</div>
            <div className="font-cond text-[10px] font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--text3)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Drafts queue */}
      <Section title="Fronta ke schvaleni">
        {drafts.length === 0 ? (
          <Empty text="Zadne clanky ke schvaleni" />
        ) : (
          drafts.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <div>
                <span className="font-cond text-[10px] font-bold tracking-[0.14em] uppercase mr-2" style={{ color: 'var(--text3)' }}>
                  {a.series} #{a.number}
                </span>
                <span className="font-cond text-sm font-bold" style={{ color: 'var(--text)' }}>{a.title}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/clanky/${a.slug}`} className="font-cond text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded no-underline" style={{ background: 'var(--gold)', color: '#000' }}>
                  Upravit
                </Link>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Sets without photos */}
      <Section title="Sety bez hero fotky">
        {noPhoto.length === 0 ? (
          <Empty text="Vsechny sety maji fotku" />
        ) : (
          noPhoto.map((s: any) => (
            <div key={s.set_number} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bdr)' }}>
              <div>
                <span className="font-cond text-xs font-bold mr-2" style={{ color: 'var(--text3)' }}>{s.set_number}</span>
                <span className="font-cond text-sm font-bold" style={{ color: 'var(--text)' }}>{s.brand} {s.name}</span>
              </div>
              <Link href={`/admin/sety/${s.set_number}`} className="font-cond text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded no-underline" style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}>
                Pridat fotku
              </Link>
            </div>
          ))
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      <div className="px-4 py-3 font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--bdr)', background: 'var(--sur2)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="px-4 py-6 text-center font-cond text-xs" style={{ color: 'var(--text3)' }}>{text}</div>
}
