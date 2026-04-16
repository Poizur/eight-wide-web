import Link from 'next/link'

interface SectionHeadProps {
  title: string
  sub?: string
  linkHref?: string
  linkLabel?: string
}

export function SectionHead({ title, sub, linkHref, linkLabel }: SectionHeadProps) {
  return (
    <div className="flex items-center justify-between py-11 pb-5" style={{ borderBottom: '1px solid var(--bdr)', marginBottom: 24 }}>
      <div className="flex items-center gap-2.5">
        <div className="w-[3px] h-[18px] rounded-sm" style={{ background: 'var(--gold)' }} />
        <div className="font-cond text-sm font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text)' }}>
          {title}
        </div>
        {sub && (
          <div className="font-cond text-xs tracking-[0.1em]" style={{ color: 'var(--text3)' }}>
            {sub}
          </div>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="font-cond text-xs font-bold tracking-[0.14em] uppercase no-underline flex items-center gap-[5px] transition-all duration-200 hover:gap-[9px]"
          style={{ color: 'var(--gold)' }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
