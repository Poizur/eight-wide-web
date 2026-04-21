import Link from 'next/link'

const footerLinks = [
  { href: '/dna', label: 'DNA' },
  { href: '/generace', label: 'Generace' },
  { href: '/ceny', label: 'Ceny' },
  { href: '/komunita', label: 'Komunita' },
  { href: '/hof', label: 'Hall of Fame' },
  { href: '/o-nas', label: 'O webu' },
]

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--white)',
        borderTop: '1px solid var(--border)',
        padding: '32px var(--px)',
      }}
    >
      <div
        className="max-w-content mx-auto flex justify-between items-center gap-6 flex-wrap"
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'var(--ink)',
            }}
          >
            Eight <em style={{ color: 'var(--red)' }}>Wide</em>
          </div>
          <div
            className="text-[11px] mt-[3px]"
            style={{ color: 'var(--subtle)', letterSpacing: '0.03em' }}
          >
            Where real cars meet real bricks
          </div>
        </div>

        <div className="flex gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs no-underline transition-colors duration-150 hover:text-ink"
              style={{ color: 'var(--muted)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2">
          <div
            className="text-[11px] font-medium px-2.5 py-1 rounded"
            style={{
              background: 'var(--red-bg)',
              border: '1px solid rgba(200,40,30,0.2)',
              color: 'var(--red)',
            }}
          >
            speedchampions.cz
          </div>
          <div
            className="text-[11px] font-medium px-2.5 py-1 rounded"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            speedchampions.eu
          </div>
        </div>
      </div>
    </footer>
  )
}
