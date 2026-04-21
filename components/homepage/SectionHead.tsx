import Link from 'next/link'

interface SectionHeadProps {
  title: string
  sub?: string
  linkHref?: string
  linkLabel?: string
}

export function SectionHead({ title, sub, linkHref, linkLabel }: SectionHeadProps) {
  return (
    <div
      className="flex items-center justify-between pt-9 pb-5 mb-6"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-baseline gap-2.5">
        <div
          className="font-serif italic"
          style={{ fontSize: 20, color: 'var(--ink)', fontWeight: 400 }}
        >
          {title}
        </div>
        {sub && (
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {sub}
          </div>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="text-xs font-semibold no-underline flex items-center gap-1 transition-all duration-200 hover:gap-2"
          style={{ color: 'var(--red)' }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
