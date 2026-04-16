'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'

interface SetData {
  set_number: string; name: string; brand: string; year_released: number | null
  pieces: number | null; rrp_czk: number | null; status: string; era: string | null
  lego_line: string; hero_photo_url: string | null; lego_photos: string[]
  real_photos: string[]; dna_article_slug: string | null; sibling_set_number: string | null
  rating_overall: number | null
}

export default function SetEditorPage() {
  const params = useParams()
  const router = useRouter()
  const setNumber = params.setNumber as string
  const [set, setSet] = useState<SetData | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('sets').select('*').eq('set_number', setNumber).single()
      .then(({ data }) => { if (data) setSet(data as SetData) })
  }, [setNumber])

  async function handleSave() {
    if (!set) return
    setSaving(true)
    setMsg('')
    const res = await fetch(`/api/admin/sets/${setNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(set),
    })
    setSaving(false)
    if (res.ok) setMsg('Ulozeno')
    else setMsg('Chyba pri ukladani')
  }

  if (!set) return <div className="py-20 text-center font-cond text-sm" style={{ color: 'var(--text3)' }}>Nacitani...</div>

  const imgSrc = set.hero_photo_url ?? setImageUrl(setNumber)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cond text-2xl font-black uppercase" style={{ color: 'var(--text)' }}>
          Set {setNumber} · {set.name}
        </h1>
        <div className="flex gap-2">
          {msg && <span className="font-cond text-xs py-2 px-3 rounded" style={{ background: msg === 'Ulozeno' ? 'rgba(39,174,96,0.12)' : 'rgba(200,40,30,0.12)', color: msg === 'Ulozeno' ? 'var(--green)' : '#E8715B' }}>{msg}</span>}
          <button onClick={handleSave} disabled={saving} className="font-cond text-xs font-bold tracking-[0.12em] uppercase px-5 py-2.5 rounded-lg border-none cursor-pointer" style={{ background: 'var(--gold)', color: '#000' }}>
            {saving ? 'Ukladam...' : 'Ulozit zmeny'}
          </button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Main form */}
        <div className="space-y-6">
          <FormSection title="Zakladni informace">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nazev" value={set.name} onChange={v => setSet({ ...set, name: v })} />
              <Field label="Znacka" value={set.brand} onChange={v => setSet({ ...set, brand: v })} />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Field label="Rok" value={String(set.year_released ?? '')} onChange={v => setSet({ ...set, year_released: parseInt(v) || null })} />
              <Field label="Dilku" value={String(set.pieces ?? '')} onChange={v => setSet({ ...set, pieces: parseInt(v) || null })} />
              <Field label="RRP (Kc)" value={String(set.rrp_czk ?? '')} onChange={v => setSet({ ...set, rrp_czk: parseFloat(v) || null })} />
              <Field label="Rating" value={String(set.rating_overall ?? '')} onChange={v => setSet({ ...set, rating_overall: parseFloat(v) || null })} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <SelectField label="Status" value={set.status} options={['available', 'retiring', 'retired', 'upcoming']} onChange={v => setSet({ ...set, status: v })} />
              <SelectField label="Era" value={set.era ?? ''} options={['6wide', '8wide']} onChange={v => setSet({ ...set, era: v || null })} />
              <SelectField label="Produktova rada" value={set.lego_line} options={['speed_champions', 'icons', 'technic']} onChange={v => setSet({ ...set, lego_line: v })} />
            </div>
          </FormSection>

          <FormSection title="Hero fotka">
            <Field label="URL" value={set.hero_photo_url ?? ''} onChange={v => setSet({ ...set, hero_photo_url: v || null })} />
          </FormSection>

          <FormSection title="Propojeni">
            <div className="grid grid-cols-2 gap-4">
              <Field label="DNA clanek slug" value={set.dna_article_slug ?? ''} onChange={v => setSet({ ...set, dna_article_slug: v || null })} />
              <Field label="Icons sibling set #" value={set.sibling_set_number ?? ''} onChange={v => setSet({ ...set, sibling_set_number: v || null })} />
            </div>
          </FormSection>
        </div>

        {/* Sidebar preview */}
        <div>
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
            <div className="relative" style={{ aspectRatio: '4/3' }}>
              <Image src={imgSrc} alt={set.name} fill className="object-cover" style={{ filter: 'brightness(0.7)' }} sizes="320px" />
            </div>
            <div className="p-4">
              <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--text3)' }}>{set.brand} · {set.year_released}</div>
              <div className="font-cond text-lg font-black uppercase" style={{ color: 'var(--text)' }}>{set.name}</div>
              <div className="font-cond text-sm font-bold mt-1" style={{ color: 'var(--gold)' }}>Set {setNumber}</div>
            </div>
          </div>
          <a href={`/sety?q=${setNumber}`} target="_blank" className="block text-center font-cond text-[10px] font-bold tracking-[0.12em] uppercase py-2 rounded no-underline" style={{ border: '1px solid var(--bdr)', color: 'var(--text3)' }}>
            Nahled na webu →
          </a>
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

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-cond text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--text3)' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="px-3 py-2 rounded text-sm outline-none cursor-pointer" style={{ background: 'var(--sur2)', border: '1px solid var(--bdr)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
