'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dna', label: 'DNA' },
  { href: '/generace', label: 'Generace' },
  { href: '/ceny', label: 'Ceny' },
  { href: '/hof', label: 'Hall of Fame' },
  { href: '/paddock', label: 'Paddock' },
  { href: '/sety', label: 'Databaze' },
  { href: '/komunita', label: 'Komunita' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-[28px] left-0 right-0 z-[200] flex items-center"
      style={{
        background: 'rgba(10,12,16,0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        height: 'var(--nav-h)',
        borderBottom: '1px solid var(--bdr)',
        padding: '0 var(--px)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex flex-col mr-8 shrink-0 no-underline">
        <div
          className="mb-1"
          style={{ width: 28, height: 2, background: 'var(--gold)' }}
        />
        <div
          className="font-sans"
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Eight{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Wide</span>
        </div>
        <div
          className="font-cond"
          style={{
            fontSize: 8,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text3)',
            marginTop: 3,
          }}
        >
          Lego Speed Champions
        </div>
      </Link>

      {/* Links */}
      <div className="flex gap-0.5 flex-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-cond text-[15px] font-bold tracking-[0.08em] uppercase no-underline rounded-[5px] px-3.5 py-1.5 transition-all duration-150',
                active ? 'text-[var(--text)]' : 'text-[var(--text3)]'
              )}
              style={{
                background: active ? 'rgba(255,255,255,0.05)' : undefined,
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Right side */}
      <div className="flex gap-2 items-center">
        <div
          className="flex overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
          }}
        >
          <button
            className="font-cond text-xs font-bold tracking-[0.1em] px-3 py-1.5 bg-[#111] text-white border-none cursor-pointer"
          >
            CZ
          </button>
          <button
            className="font-cond text-xs font-bold tracking-[0.1em] px-3 py-1.5 bg-transparent border-none cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            EN
          </button>
        </div>
      </div>
    </nav>
  )
}
