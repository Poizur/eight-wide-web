'use client'

import type { Store } from '@/lib/supabase/types'
import { affiliateUrl } from '@/lib/affiliate'
import { formatCZK } from '@/lib/utils'

interface BuyButtonProps {
  store: Store
  baseUrl: string
  price: number
  label?: string
}

const storeLabels: Record<Store, string> = {
  mall: 'Mall.cz',
  alza: 'Alza.cz',
  lego: 'LEGO.com',
  bricklink: 'BrickLink',
}

export function BuyButton({ store, baseUrl, price, label }: BuyButtonProps) {
  return (
    <a
      href={affiliateUrl(store, baseUrl)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 font-cond text-xs font-bold tracking-[0.08em] uppercase no-underline rounded-md px-4 py-2.5 transition-all duration-200"
      style={{
        background: 'var(--gold)',
        color: 'var(--bg)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--gold2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--gold)'
      }}
    >
      <span>{label ?? storeLabels[store]}</span>
      <span style={{ opacity: 0.7 }}>{formatCZK(price)}</span>
    </a>
  )
}
