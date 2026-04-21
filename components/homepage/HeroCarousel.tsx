'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Article, LegoSet } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'
import { formatCZK } from '@/lib/utils'
import { getArticleHero } from '@/lib/images'

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
  const heroPhoto = getArticleHero(a, set).src

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      style={{ background: 'var(--ink)', color: 'white', minHeight: 480 }}
    >
      {/* Left side — text */}
      <div
        className={`flex flex-col justify-end px-12 py-14 transition-all duration-[650ms] ${
          fade === 'out' ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Series chip */}
        <div
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase rounded px-2.5 py-1 w-fit mb-5"
          style={{
            color: 'var(--red)',
            background: 'rgba(200,40,30,0.15)',
            border: '1px solid rgba(200,40,30,0.25)',
            letterSpacing: '0.12em',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--red)' }} />
          {a.series.toUpperCase()} Series · #{String(a.number ?? '').padStart(3, '0')}
        </div>

        <h1
          className="font-serif font-normal mb-4"
          style={{
            fontSize: 'clamp(44px,6vw,72px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'white',
          }}
        >
          {a.title.split('—')[0]}
          {a.title.includes('—') && (
            <>
              —<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
                {a.title.split('—').slice(1).join('—').trim()}
              </em>
            </>
          )}
        </h1>

        {a.excerpt && (
          <p
            className="text-[15px] leading-[1.65] mb-7 max-w-[420px]"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {a.excerpt}
          </p>
        )}

        {/* Specs bar */}
        {set && (
          <div
            className="flex w-fit rounded-lg overflow-hidden mb-8"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { val: String(set.pieces ?? '—'), lbl: 'Dílků' },
              { val: String(set.year_released ?? '—'), lbl: 'Rok' },
              { val: set.rrp_czk ? formatCZK(set.rrp_czk) : '—', lbl: 'Cena' },
              { val: set.status === 'available' ? 'Dostupný' : set.status, lbl: 'Status' },
            ].map((spec, i) => (
              <div
                key={i}
                className="px-[18px] py-2.5"
                style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
              >
                <div className="text-lg font-bold leading-none mb-0.5" style={{ color: 'white' }}>
                  {spec.val}
                </div>
                <div
                  className="text-[10px] uppercase font-medium"
                  style={{ letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}
                >
                  {spec.lbl}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <Link
            href={`/dna/${a.slug}`}
            className="inline-flex items-center gap-2 text-[13px] font-semibold px-[22px] py-[11px] rounded-[7px] no-underline transition-all hover:gap-2.5"
            style={{ background: 'white', color: 'var(--ink)', letterSpacing: '0.01em' }}
          >
            Číst DNA článek →
          </Link>
          <Link
            href="/generace"
            className="text-[13px] font-medium px-1 py-[11px] no-underline transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Srovnat generace
          </Link>
        </div>
      </div>

      {/* Right side — image */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: '#0A0A0A', minHeight: 320 }}
      >
        {/* Subtle red glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 60% 50%, rgba(200,40,30,0.08) 0%, transparent 65%), radial-gradient(ellipse at 40% 80%, rgba(200,40,30,0.05) 0%, transparent 50%)',
          }}
        />

        {/* Set badge top-right */}
        {set && (
          <div
            className="absolute top-7 right-7 text-right rounded-lg px-3.5 py-2.5 z-[2]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-xl font-bold leading-none" style={{ color: 'white' }}>
              {set.set_number}
            </div>
            <div
              className="text-[10px] uppercase mt-0.5 font-medium"
              style={{ letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}
            >
              Set number
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="relative w-full h-full">
          <Image
            src={heroPhoto}
            alt={a.title}
            fill
            className="object-contain p-8"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-6 flex gap-2 z-[3]">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full border-none p-0 cursor-pointer transition-all duration-200"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  background: i === current ? 'var(--red)' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
