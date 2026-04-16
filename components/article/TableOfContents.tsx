'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  title: string
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="p-5 rounded-xl mb-3" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
      <div className="font-cond text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text3)' }}>
        Obsah
      </div>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-2 py-[7px] no-underline transition-colors duration-150"
            style={{
              borderBottom: i < items.length - 1 ? '1px solid var(--bdr)' : 'none',
              color: activeId === item.id ? 'var(--gold)' : 'var(--text2)',
            }}
          >
            <span className="font-cond text-[10px] font-black w-[18px] shrink-0" style={{ color: 'var(--text3)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-cond text-[13px] font-bold">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
