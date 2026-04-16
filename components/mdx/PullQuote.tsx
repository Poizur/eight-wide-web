import type { ReactNode } from 'react'

interface PullQuoteProps {
  author?: string
  children: ReactNode
}

export function PullQuote({ author, children }: PullQuoteProps) {
  return (
    <blockquote
      className="my-8 py-5 px-5 rounded"
      style={{
        borderLeft: '2px solid var(--gold)',
        background: 'rgba(201,162,39,0.04)',
      }}
    >
      <div className="font-serif font-black tracking-[-0.02em] text-[22px] leading-[1.4]" style={{ color: 'var(--text)' }}>
        {children}
      </div>
      {author && (
        <cite
          className="not-italic block mt-2.5 font-cond text-[11px] font-bold tracking-[0.15em] uppercase"
          style={{ color: 'var(--text3)' }}
        >
          — {author}
        </cite>
      )}
    </blockquote>
  )
}
