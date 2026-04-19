'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

interface ArticleData {
  id: string; slug: string; title: string; series: string; number: number | null
  brand: string | null; set_number: string | null; excerpt: string | null
  read_time_min: number | null; rating_overall: number | null
  rating_shape: number | null; rating_detail: number | null; rating_build: number | null
  rating_value: number | null; rating_display: number | null
  is_draft: boolean; published_at: string | null
}

export default function ArticleEditorPage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('articles').select('*').eq('slug', slug).single()
      .then(({ data }) => { if (data) setArticle(data as ArticleData) })
  }, [slug])

  async function handleSave() {
    if (!article) return
    setSaving(true); setMsg('')
    const res = await fetch(`/api/admin/articles/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(article) })
    setSaving(false)
    setMsg(res.ok ? 'Ulozeno' : 'Chyba')
  }

  async function handlePublish() {
    if (!article) return
    const updated = { ...article, is_draft: false, published_at: article.published_at ?? new Date().toISOString() }
    setArticle(updated)
    setSaving(true); setMsg('')
    const res = await fetch(`/api/admin/articles/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
    setSaving(false)
    setMsg(res.ok ? 'Publikovano' : 'Chyba')
  }

  if (!article) return <div className="py-20 text-center font-cond text-sm" style={{ color: 'var(--text3)' }}>Nacitani...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cond text-2xl font-black uppercase" style={{ color: 'var(--text)' }}>{article.title}</h1>
          <div className="font-cond text-xs mt-1" style={{ color: article.is_draft ? 'var(--orange)' : 'var(--green)' }}>
            {article.is_draft ? 'DRAFT' : 'PUBLISHED'}
          </div>
        </div>
        <div className="flex gap-2">
          {msg && <span className="font-cond text-xs py-2 px-3 rounded" style={{ background: msg.includes('Chyba') ? 'rgba(200,40,30,0.12)' : 'rgba(39,174,96,0.12)', color: msg.includes('Chyba') ? '#E8715B' : 'var(--green)' }}>{msg}</span>}
          {article.is_draft && (
            <button onClick={handlePublish} disabled={saving} className="font-cond text-xs font-bold tracking-[0.12em] uppercase px-5 py-2.5 rounded-lg border-none cursor-pointer" style={{ background: 'var(--green)', color: '#fff' }}>
              Schvalit & publikovat
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="font-cond text-xs font-bold tracking-[0.12em] uppercase px-5 py-2.5 rounded-lg border-none cursor-pointer" style={{ background: 'var(--gold)', color: '#000' }}>
            {saving ? '...' : 'Ulozit'}
          </button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="space-y-6">
          <FormSection title="Metadata">
            <Field label="Titulek" value={article.title} onChange={v => setArticle({ ...article, title: v })} />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Field label="Serie" value={article.series} onChange={v => setArticle({ ...article, series: v })} />
              <Field label="Znacka" value={article.brand ?? ''} onChange={v => setArticle({ ...article, brand: v || null })} />
              <Field label="Set #" value={article.set_number ?? ''} onChange={v => setArticle({ ...article, set_number: v || null })} />
            </div>
            <div className="mt-4">
              <Field label="Excerpt" value={article.excerpt ?? ''} onChange={v => setArticle({ ...article, excerpt: v || null })} />
            </div>
          </FormSection>

          <FormSection title="Hodnoceni">
            <div className="grid grid-cols-6 gap-3">
              {(['rating_overall', 'rating_shape', 'rating_detail', 'rating_build', 'rating_value', 'rating_display'] as const).map(k => (
                <Field key={k} label={k.replace('rating_', '')} value={String(article[k] ?? '')} onChange={v => setArticle({ ...article, [k]: parseFloat(v) || null })} />
              ))}
            </div>
          </FormSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--text3)' }}>Info</div>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text2)' }}>
              <div>Serie: <strong>{article.series}</strong></div>
              <div>Cislo: <strong>#{article.number}</strong></div>
              <div>Set: <strong>{article.set_number ?? '—'}</strong></div>
              <div>Rating: <strong style={{ color: 'var(--gold)' }}>{article.rating_overall?.toFixed(1) ?? '—'}</strong></div>
            </div>
          </div>
          {!article.is_draft && article.slug && (
            <a href={`/${article.series}/${article.slug}`} target="_blank" className="block text-center font-cond text-[10px] font-bold tracking-[0.12em] uppercase py-2.5 rounded no-underline" style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}>
              Nahled na webu →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--text3)' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-cond text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="px-3 py-2 rounded text-sm outline-none transition-colors focus:border-[var(--gold)]" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)', fontFamily: 'var(--sans)' }} />
    </div>
  )
}
