import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Ticker } from '@/components/layout/Ticker'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: {
    default: 'Eight Wide — LEGO Speed Champions',
    template: '%s — Eight Wide',
  },
  description:
    'Příběh každého auta. Hodnocení každého setu. LEGO Speed Champions, Icons a Technic — bez marketingu, jen fakta a skóre.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://speedchampions.cz'
  ),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body style={{ paddingTop: 34 }}>
        <Ticker />
        <Nav />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
