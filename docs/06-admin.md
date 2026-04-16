# 06 — Admin Panel + Photo Agent
## Eight Wide — správa obsahu

> Admin panel je na /admin — chráněný Supabase Auth.
> Slouží k opravě fotek, schvalování článků, správě setů.
> Photo agent běží automaticky, admin je fallback.

---


### 8.13 Admin Panel — `app/admin/`

Chráněná sekce přístupná pouze po přihlášení přes Supabase Auth. URL: `/admin`

**Účel:** Ruční korekce toho co agent nestáhl správně nebo vůbec. Každý set má svou kartu — jako produkt v e-shopu. Edituješ hero fotku, galerii, texty, LEGO fotky. Žádné psaní kódu, jen formuláře.

**Autentifikace:**
```typescript
// app/admin/layout.tsx
// Middleware přesměruje na /admin/login pokud není session
// Supabase Auth — email + heslo, jen jeden uživatel (ty)
// app/admin/login/page.tsx — jednoduchý login formulář
```

**Adresářová struktura adminu:**
```
app/admin/
├── layout.tsx          ← Auth guard + admin nav
├── login/
│   └── page.tsx        ← Login formulář
├── page.tsx            ← Dashboard — přehled (stats + fronta ke schválení)
├── sety/
│   ├── page.tsx        ← Seznam všech setů (tabulka, search, filter)
│   └── [setNumber]/
│       └── page.tsx    ← Karta setu — editor
├── clanky/
│   ├── page.tsx        ← Seznam článků (draft/published)
│   └── [slug]/
│       └── page.tsx    ← Editor článku — schválení / zamítnutí / úprava
└── rumors/
    └── page.tsx        ← Správa rumors
```

---

**Admin Dashboard — `app/admin/page.tsx`**

```
┌─ Eight Wide Admin ──────────────────────────────────────────┐
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 12       │ │ 3        │ │ 5        │ │ 147      │       │
│  │ Ke schr. │ │ Bez fotek│ │ Drafts   │ │ Setů     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  FRONTA KE SCHVÁLENÍ ─────────────────────────────          │
│  [DNA #048 · Nissan R34]  [Schválit ✓] [Upravit ✎] [✕]     │
│  [DNA #049 · BMW M3 E30]  [Schválit ✓] [Upravit ✎] [✕]     │
│                                                              │
│  SETY BEZ HERO FOTKY ─────────────────────────────          │
│  [76920 · Ford GT] [Přidat fotku]                           │
└─────────────────────────────────────────────────────────────┘
```

---

**Karta setu — `app/admin/sety/[setNumber]/page.tsx`**

Toto je hlavní editor. Vizuálně jako produktová karta v e-shopu:

```
┌─ Set 76934 · Ferrari F40 ───────────────────────────────────┐
│                                                              │
│  ZÁKLADNÍ INFORMACE  ──────────────────────────────         │
│  Název:        [Ferrari F40                    ]            │
│  Značka:       [Ferrari          ]                          │
│  Rok:          [2023] Dílků: [318] RRP: [629 Kč]           │
│  Status:       ● Dostupný  ○ Retiring  ○ Retired            │
│  Éra:          ○ 6-wide  ● 8-wide                           │
│  lego_line:    ● speed_champions  ○ icons  ○ technic        │
│                                                              │
│  HERO FOTKA  ──────────────────────────────────────         │
│  [náhled aktuální hero fotky — tmavý photo reveal]          │
│  URL: [https://images.lego.com/...]                         │
│  [Změnit URL] nebo [Nahrát soubor]                          │
│  [Spustit agent — hledej znovu na LEGO.com]                 │
│                                                              │
│  GALERIE LEGO FOTEK  ──────────────────────────────         │
│  [foto 1] [foto 2] [foto 3] [foto 4] [+ Přidat]            │
│  Drag & drop pro změnu pořadí. Klik pro smazání.            │
│  [Spustit agent — stáhni z LEGO.com]                        │
│                                                              │
│  FOTKY REÁLNÉHO AUTA  ─────────────────────────────         │
│  [foto 1] [foto 2] [foto 3] [+ Přidat]                      │
│  [Spustit agent — hledej na Unsplash]                       │
│  Unsplash query: [Ferrari F40 1987        ] [Hledat]        │
│                                                              │
│  DNA ČLÁNEK  ──────────────────────────────────────         │
│  Propojeno: ● ferrari-f40  nebo  [Vybrat článek]            │
│  Icons sibling: [10317] nebo [Prázdné]                      │
│                                                              │
│  CENY (poslední aktualizace: dnes 06:00)  ─────────         │
│  Mall.cz: 589 Kč  Alza: 629 Kč  LEGO.com: 629 Kč          │
│  BrickLink avg: 720 Kč  [Spustit scraping]                  │
│                                                              │
│           [Uložit změny]   [Náhled na webu →]               │
└─────────────────────────────────────────────────────────────┘
```

**Implementace karty setu:**
```typescript
// app/admin/sety/[setNumber]/page.tsx
// Server Component načte data, Client Component form pro editaci

'use client'
import { useState } from 'react'

interface SetEditorProps {
  set: LegoSet
  legoPhotos: string[]    // URLs z Supabase Storage
  realPhotos: string[]    // URLs z Supabase Storage
}

// Formulář ukládá přes /api/admin/sets/[setNumber] PUT endpoint
// Fotky se nahrají do Supabase Storage bucket 'set-photos'
// Struktura: set-photos/[setNumber]/hero.jpg
//            set-photos/[setNumber]/lego/1.jpg, 2.jpg, ...
//            set-photos/[setNumber]/real/1.jpg, 2.jpg, ...
```

---

**Editor článku — `app/admin/clanky/[slug]/page.tsx`**

Toto je approval flow pro AI-generované články:

```
┌─ DNA #048 · Nissan Skyline GT-R R34 ────────────────────────┐
│  Status: ČEKÁ NA SCHVÁLENÍ  │  Vygenerováno: před 2 hod     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO FOTKA  ─────────────────────────────────────          │
│  [náhled]  [Změnit]                                         │
│                                                              │
│  METADATA  ────────────────────────────────────────         │
│  Titulek:  [Nissan Skyline GT-R R34 — legenda z Japonska]   │
│  Excerpt:  [Agent vygeneroval excerpt...]                    │
│  Read time: [14 min]  Set: [76XXX]  Rating: [9.1]           │
│                                                              │
│  NÁHLED OBSAHU  ───────────────────────────────────         │
│  [scrollovatelný preview MDX článku]                        │
│  [stejný render jako na produkčním webu]                    │
│                                                              │
│  FRONTMATTER  ─────────────────────────────────────         │
│  [editovatelný YAML blok]                                   │
│                                                              │
│  [✓ Schválit a publikovat]  [✎ Upravit]  [↺ Přegenerovat]  │
│  [✕ Zamítnout]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Supabase Storage pro fotky:**
```sql
-- Buckety (vytvoř v Supabase Dashboard → Storage)
-- 'set-photos'  — public bucket, fotky setů a reálných aut
-- Struktura:
--   set-photos/{set_number}/hero.jpg          ← hlavní foto pro karty
--   set-photos/{set_number}/lego/{n}.jpg      ← LEGO produktové fotky
--   set-photos/{set_number}/real/{n}.jpg      ← fotky reálného auta

-- Přidej do tabulky sets:
ALTER TABLE sets
  ADD COLUMN hero_photo_url text,           -- přepíše brickset CDN pokud vyplněno
  ADD COLUMN lego_photos jsonb DEFAULT '[]', -- ['url1','url2',...]
  ADD COLUMN real_photos jsonb DEFAULT '[]'; -- ['url1','url2',...]
```

**API routes pro admin:**
```
app/api/admin/
├── sets/[setNumber]/route.ts    ← GET + PUT set data
├── photos/fetch-lego/route.ts   ← spustí photo agenta pro LEGO.com
├── photos/fetch-real/route.ts   ← spustí photo agenta pro Unsplash
├── articles/[slug]/route.ts     ← GET + PUT + publish/reject
└── auth/route.ts                ← Supabase Auth wrapper
```

Všechny `/api/admin/*` routes kontrolují session — bez přihlášení vrátí 401.

---

### 8.14 Photo Agent — `agents/photos.ts`
### 8.14 Photo Agent — `agents/photos.ts`

Agent který běží automaticky po vygenerování každého DNA článku. Výsledek uloží do Supabase Storage a aktualizuje tabulku `sets`. Pokud se cokoli nepovede, set se přidá do fronty "Bez fotek" v admin dashboardu.

**Zdroj 1 — LEGO.com (pro LEGO fotky):**
```typescript
// agents/photos.ts
import { chromium } from 'playwright'

async function fetchLegoPhotos(setNumber: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // LEGO.com product URL pattern
  // Nejprve zkus cs-cz, fallback na en-us
  const urls = [
    `https://www.lego.com/cs-cz/product/${setNumber}`,
    `https://www.lego.com/en-us/product/${setNumber}`,
  ]

  for (const url of urls) {
    try {
      await page.goto(url, { timeout: 15000 })

      // LEGO.com galerie — thumbnail obrázky v carouselu
      // Selector může se změnit — udržuj aktuální
      await page.waitForSelector('[data-test="product-image"]', { timeout: 8000 })

      const photoUrls = await page.evaluate(() => {
        // Sbírej všechny obrázky z galerie
        const imgs = document.querySelectorAll('[data-test="product-image"] img, .gallery img')
        return Array.from(imgs)
          .map(img => (img as HTMLImageElement).src)
          .filter(src => src.includes('lego.com') && !src.includes('placeholder'))
          // Upgraduj na high-res (LEGO.com má parametry pro velikost)
          .map(src => src.replace(/\/[0-9]+x[0-9]+\//, '/800x800/'))
          .slice(0, 6) // max 6 fotek
      })

      if (photoUrls.length > 0) {
        await browser.close()
        return photoUrls
      }
    } catch (e) {
      console.warn(`LEGO.com fetch failed for ${setNumber}:`, e)
    }
  }

  await browser.close()
  return [] // agent selhal → přidá do fronty "Bez fotek"
}
```

**Zdroj 2 — Unsplash API (pro fotky reálného auta):**
```typescript
async function fetchRealCarPhotos(
  carName: string,    // 'Ferrari F40'
  yearReal: number,   // 1987
  count = 4
): Promise<string[]> {
  // Unsplash API — zdarma, 50 req/hod
  const query = encodeURIComponent(`${carName} ${yearReal} car`)
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  )
  const data = await res.json()

  return data.results
    ?.map((photo: any) => photo.urls.regular) // 1080px wide
    ?? []
}
```

**Uložení do Supabase Storage:**
```typescript
async function savePhotoToStorage(
  supabase: SupabaseClient,
  imageUrl: string,
  storagePath: string  // 'set-photos/76934/lego/1.jpg'
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    const blob = await res.blob()

    const { data, error } = await supabase.storage
      .from('set-photos')
      .upload(storagePath, blob, {
        contentType: 'image/jpeg',
        upsert: true, // přepíše pokud existuje
      })

    if (error) throw error

    // Vrátí veřejné URL
    const { data: urlData } = supabase.storage
      .from('set-photos')
      .getPublicUrl(storagePath)

    return urlData.publicUrl
  } catch (e) {
    console.error(`Failed to save photo to ${storagePath}:`, e)
    return null
  }
}
```

**Hlavní funkce agenta:**
```typescript
export async function runPhotoAgent(setNumber: string, article: DnaArticleFrontmatter) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log(`📸 Photo agent starting for set ${setNumber}...`)

  // 1. LEGO fotky z LEGO.com
  const legoUrls = await fetchLegoPhotos(setNumber)
  const legoStored: string[] = []

  for (const [i, url] of legoUrls.entries()) {
    const stored = await savePhotoToStorage(
      supabase, url,
      `${setNumber}/lego/${i + 1}.jpg`
    )
    if (stored) legoStored.push(stored)
  }

  // 2. Reálné auto z Unsplash
  const realUrls = await fetchRealCarPhotos(article.title, article.year_real ?? 2000)
  const realStored: string[] = []

  for (const [i, url] of realUrls.entries()) {
    const stored = await savePhotoToStorage(
      supabase, url,
      `${setNumber}/real/${i + 1}.jpg`
    )
    if (stored) realStored.push(stored)
  }

  // 3. Hero fotka = první LEGO fotka (nebo první reálná pokud LEGO selhal)
  const heroUrl = legoStored[0] ?? realStored[0] ?? null

  // 4. Ulož do databáze
  await supabase.from('sets').update({
    hero_photo_url: heroUrl,
    lego_photos: legoStored,
    real_photos: realStored,
    updated_at: new Date().toISOString(),
  }).eq('set_number', setNumber)

  // 5. Reportuj výsledek
  const success = legoStored.length > 0 || realStored.length > 0
  console.log(`📸 Photo agent done: ${legoStored.length} LEGO + ${realStored.length} real photos`)

  if (!success) {
    // Přidej do fronty "Bez fotek" — admin dashboard to ukáže
    console.warn(`⚠️ No photos found for set ${setNumber} — added to admin queue`)
  }

  return { legoStored, realStored, heroUrl, success }
}
```

**Integrace do workflow:**
```typescript
// agents/content.ts — po vygenerování článku automaticky spustí photo agenta
async function generateDnaArticle(setNumber: string) {
  const research = await runResearchAgent(setNumber)
  const article = await runContentAgent(research)
  await runQualityGate(article)
  await runSeoAgent(article)

  // Photo agent — paralelně, neblokuje schválení článku
  runPhotoAgent(setNumber, article.frontmatter).catch(console.error)

  await sendTelegramPreview(article)
}
```

**.env.local — přidej:**
```bash
# Unsplash
UNSPLASH_ACCESS_KEY=...   # zdarma na unsplash.com/developers

# Supabase Storage (public bucket URL)
NEXT_PUBLIC_STORAGE_URL=https://xxxx.supabase.co/storage/v1/object/public/set-photos
```

