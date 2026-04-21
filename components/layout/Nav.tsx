'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dna', label: 'DNA' },
  { href: '/generace', label: 'Generace' },
  { href: '/ceny', label: 'Ceny & Slevy' },
  { href: '/hof', label: 'Hall of Fame' },
  { href: '/paddock', label: 'Paddock Rumors' },
  { href: '/sety', label: 'Databáze' },
  { href: '/komunita', label: 'Komunita' },
]

export function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      <nav
        className="sticky top-[34px] z-[100] flex items-center"
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          height: 'var(--nav-h)',
          padding: '0 var(--px)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex flex-col mr-10 shrink-0 no-underline" style={{ lineHeight: 1 }}>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}
          >
            Eight <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>Wide</em>
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 500,
              marginTop: 1,
            }}
          >
            LEGO Speed Champions
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-0.5 flex-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[13px] font-medium px-3 py-1.5 rounded-md transition-all duration-150 no-underline',
                  active ? 'text-ink' : 'text-muted hover:text-ink hover:bg-bg'
                )}
                style={{ letterSpacing: '0.01em' }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex gap-2.5 items-center">
          <div className="flex overflow-hidden rounded-md" style={{ border: '1px solid var(--border)' }}>
            <button
              className="text-[11px] font-semibold px-2.5 py-1 border-none cursor-pointer"
              style={{ background: 'var(--ink)', color: 'white', letterSpacing: '0.06em' }}
            >
              CZ
            </button>
            <button
              className="text-[11px] font-semibold px-2.5 py-1 bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}
            >
              EN
            </button>
          </div>
          <button
            className="text-xs font-semibold px-4 py-1.5 rounded-md border-none cursor-pointer transition-colors hover:bg-[#333]"
            style={{ background: 'var(--ink)', color: 'white', letterSpacing: '0.02em' }}
          >
            Newsletter
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <div className="flex flex-col gap-[5px]">
            <div className="w-5 h-[2px] rounded" style={{ background: 'var(--ink)' }} />
            <div className="w-5 h-[2px] rounded" style={{ background: 'var(--ink)' }} />
            <div className="w-3.5 h-[2px] rounded" style={{ background: 'var(--red)' }} />
          </div>
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(17,17,17,0.4)' }} />
          <div
            className="absolute top-0 right-0 bottom-0 w-[280px] flex flex-col py-6 px-6"
            style={{ background: 'var(--white)', borderLeft: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="self-end mb-6 p-1 border-none bg-transparent cursor-pointer text-lg"
              style={{ color: 'var(--muted)' }}
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>

            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium px-3 py-2.5 rounded-lg no-underline transition-all"
                    style={{
                      color: active ? 'var(--ink)' : 'var(--muted)',
                      background: active ? 'var(--bg)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex overflow-hidden rounded-md" style={{ border: '1px solid var(--border)' }}>
                <button
                  className="text-xs font-semibold px-4 py-2 border-none cursor-pointer"
                  style={{ background: 'var(--ink)', color: 'white' }}
                >
                  CZ
                </button>
                <button
                  className="text-xs font-semibold px-4 py-2 bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--muted)' }}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
