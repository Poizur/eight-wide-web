export type SetStatus = 'available' | 'retiring' | 'retired' | 'upcoming'
export type SetEra = '6wide' | '8wide'
export type LegoLine = 'speed_champions' | 'icons' | 'technic'
export type ArticleSeries = 'dna' | 'generace' | 'paddock' | 'investment'
export type Store = 'mall' | 'alza' | 'lego' | 'bricklink'
export type Confidence = 'speculation' | 'probable' | 'likely' | 'confirmed'

export interface LegoSet {
  id: string
  set_number: string
  name: string
  brand: string
  year_released: number | null
  pieces: number | null
  rrp_czk: number | null
  rrp_eur: number | null
  status: SetStatus
  era: SetEra | null
  lego_line: LegoLine
  brickset_img_url: string | null
  hero_photo_url: string | null
  lego_photos: string[]
  real_photos: string[]
  rebrickable_id: string | null
  rebrickable_url: string | null
  bricklink_avg_czk: number | null
  investment_roi: number | null
  dna_article_slug: string | null
  sibling_set_number: string | null
  rating_overall: number | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  series: ArticleSeries
  number: number | null
  brand: string | null
  set_number: string | null
  set_number_old: string | null
  hero_photo_url: string | null
  excerpt: string | null
  read_time_min: number | null
  rating_overall: number | null
  rating_shape: number | null
  rating_detail: number | null
  rating_build: number | null
  rating_value: number | null
  rating_display: number | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  is_draft: boolean
  created_at: string
  updated_at: string
}

export interface PriceSnapshot {
  id: string
  set_number: string
  store: Store
  price_czk: number
  url: string | null
  in_stock: boolean
  discount_pct: number | null
  scraped_at: string
}

export interface PriceAlert {
  id: string
  email: string
  set_number: string
  target_price_czk: number
  store: string | null
  triggered: boolean
  triggered_at: string | null
  confirmed: boolean
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  source: string | null
  confirmed: boolean
  confirm_token: string
  unsubscribed: boolean
  created_at: string
}

export interface Rumor {
  id: string
  car_name: string
  brand: string | null
  confidence: Confidence
  source: string | null
  description: string | null
  fulfilled: boolean
  fulfilled_at: string | null
  set_number: string | null
  published_at: string | null
  created_at: string
}
