'use client'

import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  // Don't render nav on admin pages
  if (pathname.startsWith('/admin')) return null

  return (
    <>
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
          <div className="mb-1" style={{ width: 28, height: 2, background: 'var(--gold)' }} />
          <div className="font-sans" style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Eight <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Wide</span>
          </div>
          <div className="font-cond" style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 3 }}>
            Lego Speed Champions
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
                  'font-cond text-[15px] font-bold tracking-[0.08em] uppercase no-underline rounded-[5px] px-3.5 py-1.5 transition-all duration-150',
                  active ? 'text-[var(--text)]' : 'text-[var(--text3)]'
                )}
                style={{ background: active ? 'rgba(255,255,255,0.05)' : undefined }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex gap-2 items-center">
          <div className="flex overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6 }}>
            <button className="font-cond text-xs font-bold tracking-[0.1em] px-3 py-1.5 bg-[#111] text-white border-none cursor-pointer">CZ</button>
            <button className="font-cond text-xs font-bold tracking-[0.1em] px-3 py-1.5 bg-transparent border-none cursor-pointer" style={{ color: 'rgba(255,255,255,0.45)' }}>EN</button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <div className="flex flex-col gap-[5px]">
            <div className="w-5 h-[2px] rounded" style={{ background: 'var(--text)' }} />
            <div className="w-5 h-[2px] rounded" style={{ background: 'var(--text)' }} />
            <div className="w-3.5 h-[2px] rounded" style={{ background: 'var(--gold)' }} />
          </div>
        </button>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] md:hidden" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(10,12,16,0.7)' }} />

          {/* Slide-in panel */}
          <div
            className="absolute top-0 right-0 bottom-0 w-[280px] flex flex-col py-6 px-6"
            style={{ background: 'var(--sur)', borderLeft: '1px solid var(--bdr)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="self-end mb-6 p-1 border-none bg-transparent cursor-pointer font-cond text-lg"
              style={{ color: 'var(--text3)' }}
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>

            {/* Links */}
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-cond text-base font-bold tracking-[0.08em] uppercase no-underline px-3 py-2.5 rounded-lg transition-all"
                    style={{
                      color: active ? 'var(--text)' : 'var(--text3)',
                      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Lang toggle */}
            <div className="flex mt-6 pt-6" style={{ borderTop: '1px solid var(--bdr)' }}>
              <div className="flex overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6 }}>
                <button className="font-cond text-xs font-bold tracking-[0.1em] px-4 py-2 bg-[#111] text-white border-none cursor-pointer">CZ</button>
                <button className="font-cond text-xs font-bold tracking-[0.1em] px-4 py-2 bg-transparent border-none cursor-pointer" style={{ color: 'rgba(255,255,255,0.45)' }}>EN</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
