'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Article, LegoSet } from '@/lib/supabase/types'
import Link from 'next/link'
import { formatCZK } from '@/lib/utils'

interface Slide {
  article: Article
  set: LegoSet | null
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [fade, setFade] = useState<'in' | 'out' | ''>('in')

  const goTo = useCallback(
    (idx: number) => {
      if (busy || idx === current || slides.length === 0) return
      setBusy(true)
      setFade('out')
      setTimeout(() => {
        setCurrent(idx)
        setFade('in')
        setTimeout(() => {
          setFade('')
          setBusy(false)
        }, 700)
      }, 400)
    },
    [busy, current, slides.length]
  )

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 9000)
    return () => clearInterval(t)
  }, [current, goTo, slides.length])

  if (slides.length === 0) return null

  const s = slides[current]
  const a = s.article
  const set = s.set
  const heroPhoto =
    a.hero_photo_url ??
    'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1800&q=85'

  return (
    <section className="relative flex items-center overflow-hidden" style={{ height: '85vh', minHeight: 560, maxHeight: 820 }}>
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${heroPhoto}')`,
          backgroundPosition: 'center 40%',
          filter: 'brightness(0.5) saturate(1)',
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(10,12,16,0.98) 0%, rgba(10,12,16,0.7) 30%, rgba(10,12,16,0.2) 65%, transparent 100%)',
        }}
      />
      {/* Gold bar */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: 3,
          background: 'linear-gradient(to bottom, var(--gold) 0%, transparent 80%)',
        }}
      />

      {/* Content */}
      <div
        className={`relative z-[2] px-14 max-w-[860px] transition-all duration-[650ms] ${
          fade === 'out'
            ? 'opacity-0 translate-y-3'
            : fade === 'in'
              ? 'opacity-0 translate-y-4 animate-[heroIn_0.65s_ease_forwards]'
              : ''
        }`}
      >
        {/* Tag */}
        <div className="inline-flex items-center gap-[7px] font-cond text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
          <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--gold)' }} />
          {a.series.toUpperCase()} Series · #{String(a.number ?? '').padStart(3, '0')} · {a.brand}
        </div>

        {/* Title */}
        <h1
          className="font-serif font-black tracking-[-0.02em] leading-[1.08] mb-4"
          style={{ fontSize: 'clamp(32px,3.8vw,52px)', color: 'var(--text)' }}
        >
          {a.title}
        </h1>

        {/* Deck */}
        <p className="text-[15px] leading-[1.7] mb-7 max-w-[580px]" style={{ color: 'rgba(234,232,224,0.65)' }}>
          {a.excerpt}
        </p>

        {/* Specs bar */}
        {set && (
          <div
            className="flex w-fit rounded-lg overflow-hidden mb-7"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(10,12,16,0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {[
              { num: String(set.pieces ?? '—'), lbl: 'Dilku' },
              { num: String(set.year_released ?? '—'), lbl: 'Rok' },
              { num: set.rrp_czk ? formatCZK(set.rrp_czk) : '—', lbl: 'Cena' },
              { num: set.status === 'available' ? 'Dostupny' : set.status, lbl: 'Status' },
            ].map((spec, i) => (
              <div key={i} className="px-5 py-[11px]" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div className="font-cond text-[22px] font-black leading-none" style={{ color: 'var(--text)' }}>
                  {spec.num}
                </div>
                <div className="font-cond text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'var(--text3)' }}>
                  {spec.lbl}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          <Link
            href={`/dna/${a.slug}`}
            className="font-cond text-[13px] font-bold tracking-[0.14em] uppercase px-6 py-3 rounded-md flex items-center gap-2 no-underline transition-all duration-200"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            Cist DNA clanek →
          </Link>
          <Link
            href="/generace"
            className="font-cond text-[13px] font-bold tracking-[0.12em] uppercase px-5 py-3 rounded-md no-underline transition-all duration-150"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text2)' }}
          >
            Srovnat generace
          </Link>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-14 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-[3px] rounded-sm border-none p-0 cursor-pointer transition-all duration-[350ms]"
              style={{
                width: i === current ? 44 : 28,
                background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute bottom-8 right-14 font-cond text-[11px] font-bold tracking-[0.2em] z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{String(current + 1).padStart(2, '0')}</span> / {String(slides.length).padStart(2, '0')}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-48 z-[2] flex flex-col items-center gap-1.5">
        <span className="font-cond text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text3)' }}>Scroll</span>
        <div className="w-px h-9" style={{ background: 'linear-gradient(to bottom, var(--text3), transparent)', animation: 'scrollLine 1.5s ease-in-out infinite' }} />
      </div>

      <style jsx>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollLine {
          0%,100% { transform: scaleY(1); opacity: 0.5; }
          50%     { transform: scaleY(0.3); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
