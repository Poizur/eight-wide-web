import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Bazaar — Speed Champions marketplace',
  description: 'Retired sety, otevřené boxy, celé sbírky. Bez poplatků, jen mezi fanoušky. Spuštění Q3 2026.',
}

export default function KomunitaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
