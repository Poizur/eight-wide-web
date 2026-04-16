import Image from 'next/image'
import Link from 'next/link'
import type { LegoSet } from '@/lib/supabase/types'
import { setImageUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'
import { SectionHead } from './SectionHead'

// Placeholder real-car photos mapped by brand (Unsplash)
const realPhotos: Record<string, string> = {
  Ferrari: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=700&q=80',
  Porsche: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
  Lamborghini: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=700&q=80',
  McLaren: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80',
  Lotus: 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=700&q=80',
}

const fallback = 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=700&q=80'

export function RealVsBrick({ sets }: { sets: LegoSet[] }) {
  const display = sets.slice(0, 3)
  if (display.length === 0) return null

  return (
    <div className="mb-11">
      <SectionHead title="Real vs. Brick" sub="— realne auto vs. LEGO" linkHref="/dna" linkLabel="Cela galerie" />
      <div
        className="grid grid-cols-3 gap-[2px] rounded-xl overflow-hidden"
        style={{ background: 'var(--bdr)', border: '1px solid var(--bdr)' }}
      >
        {display.map((set) => (
          <Link
            key={set.id}
            href={set.dna_article_slug ? `/dna/${set.dna_article_slug}` : `/sety`}
            className="group relative overflow-hidden no-underline block"
            style={{ aspectRatio: '4/3' }}
          >
            <Image
              src={realPhotos[set.brand] ?? fallback}
              alt={set.name}
              fill
              className="object-cover photo-dark"
              sizes="33vw"
            />

            {/* Overlay gradient */}
            <div
              className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-50"
              style={{
                background: 'linear-gradient(to top, rgba(10,12,16,0.92) 0%, rgba(10,12,16,0.2) 60%, transparent 100%)',
              }}
            />

            {/* Set badge - always visible */}
            <div
              className="absolute top-3.5 right-3.5 z-[2] text-center"
              style={{
                background: 'rgba(10,12,16,0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '9px 13px',
              }}
            >
              <div className="font-cond text-xl font-black leading-none tracking-[0.02em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {set.set_number}
              </div>
              <div className="font-cond text-[8px] font-bold tracking-[0.22em] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Set No.
              </div>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-[18px] z-[2]">
              <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-[400ms] group-hover:text-gold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {set.brand} · {set.year_released}
              </div>
              <div className="font-serif font-semibold text-xl leading-[1.1]" style={{ color: 'var(--text)' }}>
                {set.name}
              </div>
              <div className="font-cond text-[11px] tracking-[0.1em] mt-0.5 transition-colors duration-[400ms]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {set.pieces} dilku · {set.rrp_czk ? formatCZK(set.rrp_czk) : set.status}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
