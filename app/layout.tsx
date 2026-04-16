import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Ticker } from '@/components/layout/Ticker'

export const metadata: Metadata = {
  title: {
    default: 'Eight Wide — LEGO Speed Champions magazin',
    template: '%s — Eight Wide',
  },
  description:
    'Automotive magazin o LEGO Speed Champions. Pribeh kazdeho auta, hodnoceni kazdeho setu.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://speedchampions.cz'
  ),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <Ticker />
        <Nav />
        <main style={{ paddingTop: 'calc(var(--nav-h) + 28px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
