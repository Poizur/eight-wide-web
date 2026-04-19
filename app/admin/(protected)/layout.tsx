import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import type { ReactNode } from 'react'
import Link from 'next/link'

const adminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/sety', label: 'Sety' },
  { href: '/admin/clanky', label: 'Clanky' },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Admin nav bar */}
      <div
        className="flex items-center justify-between px-6 h-14"
        style={{ background: 'var(--sur)', borderBottom: '1px solid var(--bdr)' }}
      >
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-sans text-base font-semibold no-underline" style={{ color: 'var(--text)' }}>
            Eight <span style={{ color: 'var(--gold)' }}>Wide</span>
            <span className="ml-2 font-cond text-[10px] font-bold tracking-[0.16em] uppercase px-2 py-0.5 rounded" style={{ background: 'rgba(201,162,39,0.1)', color: 'var(--gold)' }}>
              Admin
            </span>
          </Link>
          {adminLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="font-cond text-xs font-bold tracking-[0.1em] uppercase no-underline transition-colors hover:text-[var(--text)]"
              style={{ color: 'var(--text3)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-cond text-[10px] font-bold tracking-[0.12em] uppercase no-underline" style={{ color: 'var(--text3)' }}>
            Web →
          </Link>
          <form action="/admin/login" method="get">
            <input type="hidden" name="logout" value="1" />
            <button type="submit" className="font-cond text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded border-none cursor-pointer" style={{ background: 'rgba(200,40,30,0.12)', color: '#E8715B' }}>
              Odhlasit
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
