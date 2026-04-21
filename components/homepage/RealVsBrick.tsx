// TODO: replace hardcoded set list with DB-driven curation when agent pipeline defines flow

import Image from 'next/image'
import Link from 'next/link'
import type { LegoSet } from '@/lib/supabase/types'
import { formatCZK } from '@/lib/utils'
import { createServerClient } from '@/lib/supabase/server'
import { getReferenceImage } from '@/lib/images'
import { SetImage } from '@/components/ui/SetImage'
import { SectionHead } from './SectionHead'

const FEATURED_SET_NUMBERS = ['76934', '75912', '76908'] as const

export async function RealVsBrick() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('sets')
    .select('*')
    .in('set_number', FEATURED_SET_NUMBERS as unknown as string[])

  const sets = (data ?? []) as LegoSet[]

  // Preserve hardcoded order + filter out sets without reference image
  const displayable = FEATURED_SET_NUMBERS
    .map(num => sets.find(s => s.set_number === num))
    .filter((s): s is LegoSet => {
      if (!s) return false
      return getReferenceImage(s) !== null
    })

  if (displayable.length === 0) return null

  return (
    <div className="mb-11">
      <SectionHead
        title="Real vs. Brick"
        sub="— realne auto vs. LEGO side-by-side"
        linkHref="/dna"
        linkLabel="Cela galerie"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}>
        {displayable.map(set => (
          <RvbMiniSplit key={set.id} set={set} />
        ))}
      </div>
    </div>
  )
}

function RvbMiniSplit({ set }: { set: LegoSet }) {
  const referenceSrc = getReferenceImage(set) // guaranteed non-null by filter above
  if (!referenceSrc) return null

  const href = set.dna_article_slug ? `/dna/${set.dna_article_slug}` : '/sety'

  return (
    <Link
      href={href}
      className="group block no-underline"
      style={{ background: 'var(--sur)' }}
    >
      {/* Split image pair */}
      <div className="grid grid-cols-2 gap-[1px] relative" style={{ background: 'var(--bdr)' }}>
        {/* LEFT — REALITY */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Image
            src={referenceSrc}
            alt={`${set.name} — reference photo`}
            fill
            className="object-cover photo-dark"
            sizes="(max-width: 768px) 50vw, 17vw"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.7) 0%, transparent 60%)' }} />
          <span
            className="absolute top-2 left-2 font-cond text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-[3px] rounded-sm z-[2]"
            style={{ background: 'rgba(200,40,30,0.85)', color: 'white' }}
          >
            Reality
          </span>
        </div>

        {/* RIGHT — LEGO */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <SetImage
            set={set}
            alt={`LEGO ${set.name}`}
            fill
            className="object-cover photo-dark"
            sizes="(max-width: 768px) 50vw, 17vw"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.7) 0%, transparent 60%)' }} />
          <span
            className="absolute top-2 left-2 font-cond text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-[3px] rounded-sm z-[2]"
            style={{ background: 'rgba(201,162,39,0.85)', color: '#000' }}
          >
            LEGO
          </span>
          {/* Set number badge, always visible */}
          <div
            className="absolute top-2 right-2 z-[2] text-center"
            style={{
              background: 'rgba(10,12,16,0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
            }}
          >
            <div className="font-cond text-xs font-black leading-none" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {set.set_number}
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-4 py-3">
        <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-[400ms] group-hover:text-gold" style={{ color: 'var(--text3)' }}>
          {set.brand} · {set.year_released}
        </div>
        <div className="font-serif font-bold tracking-[-0.02em] text-lg leading-[1.1]" style={{ color: 'var(--text)' }}>
          {set.name}
        </div>
        <div className="font-cond text-[11px] tracking-[0.1em] mt-0.5" style={{ color: 'var(--text3)' }}>
          {set.pieces} dilku · {set.rrp_czk ? formatCZK(set.rrp_czk) : set.status}
        </div>
      </div>
    </Link>
  )
}
