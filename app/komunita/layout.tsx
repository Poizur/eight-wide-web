import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Komunita / Bazaar — Speed Champions marketplace',
  description: 'Pripravujeme dedikovany marketplace pro LEGO Speed Champions komunitu. Retired sety, sbirky, bez poplatku.',
}

export default function KomunitaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
