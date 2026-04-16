# 05 — Data Pipeline
## Eight Wide — Brickset API + Scraping + BrickLink + Foto

> Kombinace zdrojů: každý přispívá čím je nejlepší.
> Brickset API = metadata | LEGO.com Playwright = fotky + CZK cena | Mall/Alza = ceny | BrickLink = sekundární trh | Unsplash = reálná auta

---


## 15. DATA PIPELINE — KOMBINACE ZDROJŮ

Každý set v databázi je složen z dat z více zdrojů. Každý zdroj přispívá čím je nejlepší:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PIPELINE — přehled                      │
├───────────────┬─────────────────────────────────────────────────┤
│ Zdroj         │ Co poskytuje                                    │
├───────────────┼─────────────────────────────────────────────────┤
│ Brickset API  │ Metadata (název, dílky, rok, RRP, retired datum)│
│               │ Thumbnail URL (brickset CDN)                    │
│               │ Brickset rating, reviewCount                    │
│               │ dateLastAvailable → retiring/retired detektor   │
├───────────────┼─────────────────────────────────────────────────┤
│ Rebrickable   │ Přesné theme ID pro filter Speed Champions       │
│ CSV           │ Alternativní databáze dílků a náhradní ID        │
│               │ Jen jako backup pokud Brickset API selže         │
├───────────────┼─────────────────────────────────────────────────┤
│ LEGO.com      │ Fullscreen produktové fotky (4–8 ks)             │
│ (Playwright)  │ Aktuální dostupnost v CZ obchodě                │
│               │ CZK cena z LEGO.com CZ                          │
├───────────────┼─────────────────────────────────────────────────┤
│ Mall.cz       │ CZK cena + sleva % oproti RRP                   │
│ (Playwright)  │ Dostupnost skladu                               │
├───────────────┼─────────────────────────────────────────────────┤
│ Alza.cz       │ CZK cena + sleva %                              │
│ (Playwright)  │ Dostupnost skladu                               │
├───────────────┼─────────────────────────────────────────────────┤
│ BrickLink API │ Sekundární tržní cena (avg sold price)          │
│               │ Investment ROI výpočet (aktuální vs RRP)        │
├───────────────┼─────────────────────────────────────────────────┤
│ Unsplash API  │ Fotky reálného auta (landscape, vysoká kvalita)  │
│               │ Query = "{CarName} {Year} car"                   │
└───────────────┴─────────────────────────────────────────────────┘
```

---

### 15.1 Brickset API — scripts/import-brickset.ts

Primární zdroj metadat. Zaregistruj se na brickset.com a získej API key zdarma.

```bash
# .env.local — přidej
BRICKSET_API_KEY=your_api_key_here
BRICKSET_USERNAME=your_username
BRICKSET_PASSWORD=your_password
```

```typescript
// scripts/import-brickset.ts
// Importuje všechny Speed Champions + Icons sety do Supabase
// Spustit: npm run db:import-brickset

import { createClient } from '@supabase/supabase-js'

const BRICKSET_API = 'https://brickset.com/api/v3.asmx'
const THEMES = [
  { theme: 'Speed Champions', line: 'speed_champions' },
  { theme: 'Icons',           line: 'icons' },
  // Technic auta nemají vlastní theme — přidáme manuálně přes seed
]
const YEARS = Array.from({ length: 12 }, (_, i) => 2015 + i) // 2015–2026

async function bricksetGet(method: string, params: Record<string, string>) {
  const paramStr = JSON.stringify({
    apiKey: process.env.BRICKSET_API_KEY,
    userHash: '', // nevyžaduje se pro getSets
    ...params,
  })
  const url = `${BRICKSET_API}/${method}?params=${encodeURIComponent(paramStr)}`
  const res = await fetch(url)
  return res.json()
}

async function importAllSets() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const { theme, line } of THEMES) {
    for (const year of YEARS) {
      console.log(`📦 Fetching ${theme} ${year}...`)

      const data = await bricksetGet('getSets', {
        params: JSON.stringify({ theme, year: String(year), pageSize: '500' })
      })

      const sets = data.sets ?? []
      if (sets.length === 0) continue

      // Mapuj Brickset data na náš schema
      const rows = sets.map((s: any) => ({
        set_number:              s.number,
        name:                    s.name,
        brand:                   extractBrand(s.name), // viz funkce níže
        year_released:           s.year,
        pieces:                  s.pieces ?? null,
        rrp_czk:                 eurToCzk(s.DE_retailPrice), // DE EUR → CZK
        rrp_eur:                 s.DE_retailPrice ?? null,
        status:                  deriveStatus(s),   // viz funkce níže
        era:                     year >= 2020 ? '8wide' : '6wide',
        lego_line:               line,
        brickset_img_url:        s.image?.imageURL ?? null,
        brickset_id:             s.setID,
        brickset_rating:         s.rating ?? null,
        brickset_review_count:   s.reviewCount ?? 0,
        date_last_available:     s.US_dateLastAvailable ?? s.UK_dateLastAvailable ?? null,
        updated_at:              new Date().toISOString(),
      }))

      // Upsert — aktualizuje pokud set_number už existuje
      const { error } = await supabase
        .from('sets')
        .upsert(rows, { onConflict: 'set_number', ignoreDuplicates: false })

      if (error) console.error(`Error upserting ${theme} ${year}:`, error)
      else console.log(`  ✓ ${rows.length} sets upserted`)

      // Rate limit — Brickset dovoluje ~200 req/den na free key
      await new Promise(r => setTimeout(r, 500))
    }
  }
}

// Odvoď status ze dvou datumů
function deriveStatus(set: any): string {
  const lastAvail = set.US_dateLastAvailable ?? set.UK_dateLastAvailable ?? set.DE_dateLastAvailable
  if (!lastAvail) return 'available' // není datum = stále v prodeji

  const lastDate = new Date(lastAvail)
  const now = new Date()
  const monthsLeft = (lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)

  if (lastDate < now)    return 'retired'   // datum je v minulosti
  if (monthsLeft < 6)    return 'retiring'  // vyprší do 6 měsíců
  return 'available'
}

// Extrahuj brand z názvu setu (heuristika)
function extractBrand(name: string): string {
  const brands = ['Ferrari','Porsche','Lamborghini','McLaren','BMW','Aston Martin',
                  'Ford','Bugatti','Lotus','Toyota','Nissan','Mercedes','Pagani',
                  'Koenigsegg','Rimac','Dodge','Chevrolet','Jaguar']
  for (const brand of brands) {
    if (name.includes(brand)) return brand
  }
  return 'Other'
}

// Přibližný kurz EUR → CZK (aktualizuj dle potřeby nebo fetchni live)
function eurToCzk(eurPrice: number | null): number | null {
  if (!eurPrice) return null
  const EUR_CZK = 25.2 // approximace — pro přesnost fetchni z ČNB API
  return Math.round(eurPrice * EUR_CZK)
}

importAllSets().then(() => console.log('✅ Import complete'))
```

**Přidej do package.json scripts:**
```json
"db:import-brickset": "tsx scripts/import-brickset.ts",
```

**Přidej do Supabase schema (doplnění tabulky sets):**
```sql
ALTER TABLE sets
  ADD COLUMN brickset_id        int,
  ADD COLUMN brickset_rating    decimal(3,1),
  ADD COLUMN brickset_review_count int DEFAULT 0,
  ADD COLUMN date_last_available timestamptz;
  -- date_last_available pohání deriveStatus() v cron jobu
```

---

### 15.2 Brickset Denní Sync — Cron job

Jednou denně zkontroluje nové sety a aktualizuje `date_last_available` → automaticky mění status available → retiring → retired.

```typescript
// app/api/cron/sync-brickset/route.ts
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Syncni aktuální rok (nové sety)
  const currentYear = new Date().getFullYear()
  await syncBricksetYear(currentYear)

  // 2. Aktualizuj statusy na základě date_last_available
  await updateSetStatuses()

  return NextResponse.json({ ok: true })
}

async function updateSetStatuses() {
  const supabase = createClient(...)
  const { data: sets } = await supabase
    .from('sets')
    .select('set_number, date_last_available, status')
    .not('date_last_available', 'is', null)

  for (const set of sets ?? []) {
    const newStatus = deriveStatus({ US_dateLastAvailable: set.date_last_available })
    if (newStatus !== set.status) {
      await supabase.from('sets')
        .update({ status: newStatus })
        .eq('set_number', set.set_number)
      console.log(`Status change: ${set.set_number} → ${newStatus}`)
    }
  }
}
```

**vercel.json — přidej cron:**
```json
{
  "crons": [
    { "path": "/api/cron/scrape-prices",  "schedule": "0 6 * * *" },
    { "path": "/api/cron/check-alerts",   "schedule": "0 7 * * *" },
    { "path": "/api/cron/sync-brickset",  "schedule": "0 5 * * *" }
  ]
}
```

---

### 15.3 BrickLink API — sekundární trh

BrickLink má veřejné API pro průměrné prodejní ceny retired setů. Tohle pohání "Investment ROI" a BrickLink sloupec v cenové tabulce.

```typescript
// scripts/sync-bricklink.ts
// BrickLink API — OAuth 1.0, zdarma

async function fetchBricklinkAvgPrice(setNumber: string): Promise<number | null> {
  // BrickLink item type 'S' = set, color 0 = N/A
  // GET /api/store/v1/items/S/{setNumber}/price
  // Vrátí avg_price pro "used" a "new" condition

  const url = `https://api.bricklink.com/api/store/v1/items/S/${setNumber}-1/price?guide_type=sold&new_or_used=N`

  // OAuth 1.0 signature (BrickLink vyžaduje)
  const headers = buildOAuthHeaders(url, 'GET')

  try {
    const res = await fetch(url, { headers })
    const data = await res.json()
    return data.data?.avg_price ?? null
  } catch {
    return null
  }
}

// ROI výpočet
function calculateRoi(rrpCzk: number, avgBricklinkCzk: number): number {
  return +((avgBricklinkCzk / rrpCzk - 1) * 100).toFixed(1) // % zisk
}
```

```bash
# .env.local — přidej
BRICKLINK_CONSUMER_KEY=...
BRICKLINK_CONSUMER_SECRET=...
BRICKLINK_TOKEN=...
BRICKLINK_TOKEN_SECRET=...
```

---

### 15.4 Rebrickable — záloha a cross-check

Rebrickable CSV zůstane jako backup a cross-check zdroj. Stáhni jednou, ulož lokálně.

```typescript
// scripts/crosscheck-rebrickable.ts
// Porovná Brickset data s Rebrickable CSV
// Identifikuje nesrovnalosti v počtech dílků nebo statusu
// Spustit manuálně pokud jsou pochybnosti o datech konkrétního setu

// Rebrickable CSV: https://rebrickable.com/downloads/ → sets.csv
// Speed Champions theme ID v Rebrickable: 736
```

---

### 15.5 Shrnutí pipeline — co běží kdy

```
PŘI SPUŠTĚNÍ PROJEKTU (jednou):
  npm run db:import-brickset    ← všechny SC + Icons sety 2015–2026
  npm run db:seed               ← Icons/Technic sety bez vlastního theme
  npm run prices:scrape         ← první ceny pro všechny dostupné sety

KAŽDÝ DEN (Vercel Cron):
  05:00  sync-brickset          ← nové sety + status updates (retiring/retired)
  06:00  scrape-prices          ← Mall.cz, Alza.cz, LEGO.com CZK ceny
  07:00  check-alerts           ← odešle emaily pro triggnuté price alerts
  Týdně  sync-bricklink         ← BrickLink avg prices pro retired sety

PŘI GENEROVÁNÍ ČLÁNKU (automaticky):
  content-agent                 ← píše MDX
  photo-agent                   ← LEGO.com galerie + Unsplash
  telegram-bot                  ← preview ke schválení

MANUÁLNĚ (admin panel):
  /admin/sety/[setNumber]       ← oprava fotek, metadat, propojení
  /admin/clanky/[slug]          ← schválení / úprava článku
```

---

## 16. DYNAMICKÉ OG OBRÁZKY — app/api/og/[slug]/route.tsx
## 11. PRICE SCRAPING — agents/prices.ts

Mall.cz a Alza.cz nemají veřejné API. Použijeme Playwright pro headless scraping.

```typescript
// scripts/scrape-prices.ts
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

// Konfigurace URL šablon pro každý obchod
const STORE_URL_TEMPLATES = {
  mall: (setNumber: string) =>
    `https://www.mall.cz/vyhledavani?q=lego+${setNumber}`,
  alza: (setNumber: string) =>
    `https://www.alza.cz/search.htm?exps=lego+${setNumber}`,
  lego: (setNumber: string) =>
    `https://www.lego.com/cs-cz/product/${setNumber}`,
}

// CSS selektory pro cenu (může se měnit — udržuj aktuální)
const PRICE_SELECTORS = {
  mall: '.price-box__price',
  alza: '.price-box__price .price',
  lego: '[data-test="product-price"]',
}

async function scrapeAllPrices() {
  const browser = await chromium.launch({ headless: true })
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Načti všechny dostupné sety
  const { data: sets } = await supabase
    .from('sets')
    .select('set_number, rrp_czk')
    .in('status', ['available', 'retiring'])

  for (const set of sets ?? []) {
    for (const [store, urlTemplate] of Object.entries(STORE_URL_TEMPLATES)) {
      try {
        const page = await browser.newPage()
        await page.goto(urlTemplate(set.set_number), { timeout: 15000 })
        await page.waitForSelector(PRICE_SELECTORS[store as keyof typeof PRICE_SELECTORS], { timeout: 5000 })

        const priceText = await page.textContent(PRICE_SELECTORS[store as keyof typeof PRICE_SELECTORS])
        const price = parseFloat(priceText?.replace(/[^0-9,]/g, '').replace(',', '.') ?? '0')

        if (price > 0) {
          const discountPct = set.rrp_czk
            ? +((1 - price / set.rrp_czk) * 100).toFixed(1)
            : null

          await supabase.from('prices').insert({
            set_number: set.set_number,
            store,
            price_czk: price,
            discount_pct: discountPct,
            in_stock: true,
          })
        }

        await page.close()
        await new Promise(r => setTimeout(r, 1200)) // rate limit
      } catch (e) {
        console.error(`Failed ${set.set_number} @ ${store}:`, e)
      }
    }
  }

  await browser.close()
}
```

**Vercel Cron — každý den 6:00 UTC:**
```typescript
// app/api/cron/scrape-prices/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await scrapeAllPrices()
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-prices",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/check-alerts",
      "schedule": "0 7 * * *"
    }
  ]
}
```

---

## 12. EMAILY — RESEND + REACT EMAIL
