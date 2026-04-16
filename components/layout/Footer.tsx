import Link from 'next/link'

const footerLinks = [
  { href: '/dna', label: 'DNA' },
  { href: '/generace', label: 'Generace' },
  { href: '/ceny', label: 'Ceny' },
  { href: '/komunita', label: 'Komunita' },
  { href: '/hof', label: 'Hall of Fame' },
]

export function Footer() {
  return (
    <footer
      style={{
        background: '#060809',
        borderTop: '1px solid var(--bdr)',
        padding: '28px var(--px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div className="font-sans text-lg font-semibold">
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Eight</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}> Wide</span>
        </div>
        <div
          className="font-sans text-xs"
          style={{ color: 'var(--text3)', marginTop: 4 }}
        >
          Where real cars meet real bricks
        </div>
      </div>

      <div className="flex gap-5">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-cond text-xs font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
            style={{ color: 'var(--text3)' }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <div
          className="font-cond text-[11px] font-bold tracking-[0.1em]"
          style={{ color: 'var(--text)' }}
        >
          speedchampions.cz
        </div>
        <div
          className="font-cond text-[11px] font-bold tracking-[0.1em]"
          style={{ color: 'var(--text3)' }}
        >
          speedchampions.eu
        </div>
      </div>
    </footer>
  )
}
