import type { Store } from '@/lib/supabase/types'

const AFFILIATE_PARAMS: Record<Store, (url: string) => string> = {
  mall:      (url) => `${url}?utm_source=eightwide&utm_medium=affiliate&utm_campaign=sc`,
  alza:      (url) => `${url}?ref=eightwide`,
  lego:      (url) => `${url}?CMP=AFC-AFF-eightwide_CZ`,
  bricklink: (url) => url,
}

export function affiliateUrl(store: Store, baseUrl: string): string {
  return AFFILIATE_PARAMS[store](baseUrl)
}

export function setImageUrl(setNumber: string): string {
  return `https://images.brickset.com/sets/images/${setNumber}-1.jpg`
}
