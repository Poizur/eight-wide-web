import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const BRICKSET_API = 'https://brickset.com/api/v3.asmx'
const API_KEY = process.env.BRICKSET_API_KEY

const THEMES = [
  { theme: 'Speed Champions', line: 'speed_champions' },
  { theme: 'Icons', line: 'icons' },
]
const YEARS = Array.from({ length: 12 }, (_, i) => 2015 + i) // 2015–2026

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function bricksetGetSets(theme: string, year: number) {
  const params = JSON.stringify({
    apiKey: API_KEY,
    userHash: '',
    params: JSON.stringify({ theme, year: String(year), pageSize: '500' }),
  })
  const url = `${BRICKSET_API}/getSets`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `params=${encodeURIComponent(params)}`,
  })
  const data = await res.json()
  return data.sets ?? []
}

function extractBrand(name: string): string {
  const brands = [
    'Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'BMW', 'Aston Martin',
    'Ford', 'Bugatti', 'Lotus', 'Toyota', 'Nissan', 'Mercedes', 'Pagani',
    'Koenigsegg', 'Rimac', 'Dodge', 'Chevrolet', 'Jaguar', 'Audi',
  ]
  for (const brand of brands) {
    if (name.includes(brand)) return brand
  }
  return 'Other'
}

function deriveStatus(set: any): string {
  const lastAvail =
    set.US_dateLastAvailable ?? set.UK_dateLastAvailable ?? set.DE_dateLastAvailable
  if (!lastAvail) return 'available'

  const lastDate = new Date(lastAvail)
  const now = new Date()
  const monthsLeft =
    (lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)

  if (lastDate < now) return 'retired'
  if (monthsLeft < 6) return 'retiring'
  return 'available'
}

function eurToCzk(eurPrice: number | null): number | null {
  if (!eurPrice) return null
  const EUR_CZK = 25.2
  return Math.round(eurPrice * EUR_CZK)
}

async function importAllSets() {
  if (!API_KEY) {
    console.error('BRICKSET_API_KEY is not set in .env.local')
    console.log('Skipping Brickset import. Set BRICKSET_API_KEY to enable.')
    return
  }

  for (const { theme, line } of THEMES) {
    for (const year of YEARS) {
      console.log(`Fetching ${theme} ${year}...`)

      try {
        const sets = await bricksetGetSets(theme, year)
        if (sets.length === 0) continue

        const rows = sets.map((s: any) => ({
          set_number: String(s.number),
          name: s.name,
          brand: extractBrand(s.name),
          year_released: s.year,
          pieces: s.pieces ?? null,
          rrp_czk: eurToCzk(s.LEGOCom?.DE?.retailPrice ?? null),
          rrp_eur: s.LEGOCom?.DE?.retailPrice ?? null,
          status: deriveStatus(s),
          era: s.year >= 2020 ? '8wide' : '6wide',
          lego_line: line,
          brickset_img_url: s.image?.imageURL ?? null,
          brickset_id: s.setID,
          brickset_rating: s.rating ?? null,
          brickset_review_count: s.reviewCount ?? 0,
          date_last_available:
            s.US_dateLastAvailable ?? s.UK_dateLastAvailable ?? null,
          updated_at: new Date().toISOString(),
        }))

        const { error } = await supabase
          .from('sets')
          .upsert(rows, { onConflict: 'set_number', ignoreDuplicates: false })

        if (error) console.error(`  Error upserting ${theme} ${year}:`, error.message)
        else console.log(`  ${rows.length} sets upserted`)

        // Rate limit — Brickset allows ~200 req/day on free key
        await new Promise((r) => setTimeout(r, 500))
      } catch (e: any) {
        console.error(`  Failed ${theme} ${year}:`, e.message)
      }
    }
  }

  console.log('Import complete!')
}

importAllSets()
