'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface ComparisonSliderProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
}

export function ComparisonSlider({
  before,
  after,
  beforeLabel = 'Stary',
  afterLabel = 'Novy',
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPct((x / rect.width) * 100)
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      updatePosition(e.clientX)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [updatePosition]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative my-8 rounded-lg overflow-hidden cursor-ew-resize select-none"
      style={{ aspectRatio: '16/9' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After (full) */}
      <Image src={after} alt={afterLabel} fill className="object-cover" sizes="100vw" />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <Image src={before} alt={beforeLabel} fill className="object-cover" sizes="100vw" />
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      >
        {/* Line */}
        <div className="absolute top-0 bottom-0 w-[3px] left-1/2 -translate-x-1/2" style={{ background: 'var(--gold)' }} />
        {/* Circle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-cond text-xs font-black"
          style={{ background: 'var(--gold)', color: '#000', boxShadow: '0 0 12px rgba(201,162,39,0.4)' }}
        >
          VS
        </div>
      </div>

      {/* Labels */}
      <span
        className="absolute top-3 left-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm z-[5]"
        style={{ background: 'rgba(200,40,30,0.85)', color: 'white' }}
      >
        {beforeLabel}
      </span>
      <span
        className="absolute top-3 right-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm z-[5]"
        style={{ background: 'rgba(201,162,39,0.85)', color: '#000' }}
      >
        {afterLabel}
      </span>
    </div>
  )
}
