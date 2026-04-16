import type { ReactNode } from 'react'

interface ChapterProps {
  title: string
  children: ReactNode
}

export function Chapter({ title, children }: ChapterProps) {
  const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <section className="mb-14" id={id}>
      <div
        className="font-cond text-[11px] font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-3"
        style={{ color: 'var(--gold)' }}
      >
        <span className="block w-6 h-px" style={{ background: 'var(--gold)' }} />
        {title}
      </div>
      <h2
        className="font-serif italic leading-[1.15] tracking-[-0.01em] mb-[18px]"
        style={{ fontSize: 'clamp(28px,3vw,38px)', color: 'var(--text)' }}
      >
        {title}
      </h2>
      <div className="text-base leading-[1.8]" style={{ color: 'var(--text2)' }}>
        {children}
      </div>
    </section>
  )
}
