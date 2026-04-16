# 03 — Stránky
## Eight Wide — Specifikace všech stránek

> Pro každou stránku: nejprve `view` příslušný HTML prototyp v /reference/, pak implementuj.
> Prototypy jsou autoritativní vizuální vzor.

| Stránka | Route | Reference soubor |
|---|---|---|
| Homepage | `/` | `reference/eight-wide-photos.html` |
| DNA Archiv | `/dna` | `reference/dna-archive.html` |
| DNA Článek | `/dna/[slug]` | `reference/dna-ferrari-f40.html` |
| Generace Archiv | `/generace` | `reference/generace-archive.html` |
| Generace Článek | `/generace/[slug]` | `reference/generace-article.html` |
| Ceny / Pit Stop | `/ceny` | `reference/ceny.html` |
| Hall of Fame | `/hof` | `reference/hall-of-fame.html` |
| Paddock Rumors | `/paddock` | `reference/paddock-rumors.html` |
| Databáze setů | `/sety` | `reference/databaze.html` |
| Komunita/Bazaar | `/komunita` | `reference/komunita.html` |
| 404 | `not-found.tsx` | `reference/404.html` |

---


## 8. STRÁNKY — DETAILNÍ SPECIFIKACE

### 8.1 Homepage — `app/page.tsx`

```typescript
// Server Component — data fetchuje na serveru
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createServerClient()

  const [latestArticles, topSets, currentSales, hofTop5] = await Promise.all([
    supabase.from('articles').select('*,sets(*)').eq('is_draft',false)
      .order('published_at',{ascending:false}).limit(5),
    supabase.from('sets').select('*').eq('status','available')
      .order('rating_overall',{ascending:false}).limit(8),
    supabase.from('current_prices')
      .select('*').not('discount_pct','is',null).order('discount_pct').limit(5),
    supabase.from('articles').select('*,sets(*)')
      .eq('series','dna').eq('is_draft',false)
      .order('rating_overall',{ascending:false}).limit(5),
  ])
  // render...
}
```

**Sekce v pořadí:**
1. `<Ticker>` — scrollující bar (červená, fixní nahoře pod navem)
2. `<Nav>` — fixed, 58px
3. `<HeroCarousel>` — 4 slidy z posledních DNA článků, 9s auto-rotate
4. `<LatestArticles>` — featured 2/3 + 2 menší karty
5. `<RealVsBrick>` — 3-grid: reálné auto foto ← → LEGO foto
6. `<DnaStrip>` — split layout, zlatý accent, stats
7. `<PitStopPreview>` — 5 price karet (slevy + retiring)
8. `<BrandsStrip>` — 8 značek s počty setů + hover zlatý
9. `<HofPreview>` — top 5 ranked list
10. `<SeriesTimeline>` — 2015→2026 horizontální timeline
11. `<BazaarTeaser>` — komunitní teaser + newsletter
12. `<Footer>`

---

### 8.2 DNA Archiv — `app/dna/page.tsx`

```typescript
// Podporuje URL search params pro filtry
// ?brand=Ferrari&status=available&sort=rating

export default async function DnaPage({
  searchParams
}: {
  searchParams: { brand?: string; status?: string; sort?: string; page?: string }
}) { ... }
```

Layout přesně viz `dna-archive.html`:
- Page header: serif italic "Příběh každého auta.", stats (N článků, N značek)
- `<FilterBar sticky>` — brand chips + sort select
- 2-sloupcový layout: articles + sidebar
- Featured karta (1. výsledek) přes celou šířku
- Zbytek: 2-sloupcový grid

---

### 8.3 DNA Článek — `app/dna/[slug]/page.tsx`

```typescript
// generateStaticParams pro ISR
export async function generateStaticParams() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('series', 'dna')
    .eq('is_draft', false)
  return data?.map(a => ({ slug: a.slug })) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // načti z articles tabulky
  return {
    title: `${article.title} — DNA #${article.number} — Eight Wide`,
    description: article.excerpt,
    openGraph: {
      images: [`/api/og/${params.slug}`],  // dynamická OG
    }
  }
}
```

Obsah viz `dna-ferrari-f40.html`:
- Fullscreen hero fotka + gradient
- Read progress bar (zlatá 2px linka pod navem)
- 2 sloupce: article (2/3) + sticky sidebar (1/3)
- MDX komponenty (viz sekce 10)
- Sidebar: TOC + ceny setu + related articles

**Přístup k Icons/Technic setům — car-first architektura:**

> **Klíčové rozhodnutí:** Neexistuje samostatná sekce `/icons/`. Web je organizován podle auta, ne podle produktové linie LEGO. Člověk hledá "Ferrari F40 LEGO" — chce vidět všechny verze na jednom místě, ne hledat na dvou URL.

Pokud existuje Icons nebo Technic verze stejného auta, je součástí **téhož DNA článku**. Jeden článek = jedno auto = všechny LEGO verze.

**Struktura DNA článku s Icons verzí:**
```
[ příběh reálného auta — beze změny ]

──── Speed Champions ────────────────
[ SC LegoRating — set 76908 ]

──── Icons / Technic ────────────────     ← sekce se zobrazí jen pokud existuje
[ <IconsReview> — plnohodnotná recenze Icons setu ]
[ <LegoRating> pro Icons verzi ]

──── Které koupit? ──────────────────     ← zobrazí se jen pokud jsou obě sekce
[ <BuyDecision> — 3 věty, 2 buy buttons ]
```

**`<IconsReview>` komponenta — plnohodnotná, ne jen callout:**
```typescript
// components/mdx/IconsReview.tsx
// Renderuje kompletní recenzi Icons/Technic setu přímo v DNA článku.
// Není to odkaz na jinou stránku — je to obsah tady.

interface IconsReviewProps {
  setNumber: string        // '10317'
  legoLine: 'icons' | 'technic'
  buildTime?: string       // '~4 hodiny'
  difficulty?: 'střední' | 'pokročilý' | 'expert'
  mechanisms?: string[]    // ['otevírací kapota', 'funkční odpružení'] — jen pro Technic
}
```

**Vizuální design `<IconsReview>`:**
```
┌─────────────────────────────────────────────────────────────┐
│  ICONS · Set 10317                            zlatý top bar  │
├─────────────────────────────────────────────────────────────┤
│  [foto setu — photo reveal]  │  Lamborghini Countach         │
│                               │  25th Anniversary             │
│                               │  1 161 dílků · ~3 499 Kč    │
│                               │  ★ Dostupný                  │
│                               │  Stavba: ~4 h · Pokročilý   │
├─────────────────────────────────────────────────────────────┤
│  [prose text — 200–300 slov o Icons verzi]                  │
│  Jiný důraz než SC — věrnost detailu, sběratelský aspekt    │
├─────────────────────────────────────────────────────────────┤
│  <LegoRating> — stejná komponenta, jiné skóre               │
│  (věrnost / detail / stavba / komplexita / prezentace)      │
└─────────────────────────────────────────────────────────────┘
```

**`<BuyDecision>` komponenta** — zobrazí se jen pokud jsou v článku obě verze:
```typescript
// components/mdx/BuyDecision.tsx
// Jednoduchá odpověď na otázku "které koupit?"
// Vizuálně: 2 karty side-by-side, každá s bullet pointy a buy button

interface BuyDecisionProps {
  scSetNumber: string      // '76908'
  iconsSetNumber: string   // '10317'
  scFor: string[]          // ['Sbírka display shelf', 'Budget do 700 Kč', 'Rychlá stavba 30 min']
  iconsFor: string[]       // ['Stavební zážitek 4h', 'Vitrína centerpiece', 'Maximální detail']
}
```

**Vizuální design `<BuyDecision>`:**
```
┌─────────────────────┐  ┌─────────────────────┐
│  Speed Champions    │  │  Icons / Technic     │
│  Set 76908          │  │  Set 10317           │
│  262 dílků · 629 Kč │  │  1161 dílků · 3499 Kč│
│                     │  │                      │
│  ✓ Sbírka / shelf   │  │  ✓ Stavební zážitek  │
│  ✓ Budget           │  │  ✓ Vitrína           │
│  ✓ 30 min stavba    │  │  ✓ Max detail        │
│                     │  │                      │
│  [Koupit →]         │  │  [Koupit →]          │
└─────────────────────┘  └─────────────────────┘
```

**MDX frontmatter — rozšíření pro DNA s Icons verzí:**
```yaml
title: "Lamborghini Countach"
slug: "lamborghini-countach"
series: "dna"
# SC set — povinné
set_number: "76908"
set_pieces: 262
set_price_czk: 629
# Rating SC
rating_shape: 9.4
rating_detail: 8.9
rating_build: 8.2
rating_value: 9.5
rating_display: 9.1

# Icons/Technic verze — volitelné, pokud chybí → sekce se nezobrazí
icons_set_number: "10317"       # prázdné nebo chybějící = nezobrazí se
icons_lego_line: "icons"        # "icons" | "technic"
icons_set_pieces: 1161
icons_set_price_czk: 3499
icons_build_time: "~4 hodiny"
icons_difficulty: "pokročilý"
# Rating Icons
icons_rating_shape: 9.6
icons_rating_detail: 9.7
icons_rating_build: 9.2
icons_rating_complexity: 8.8    # místo "hodnota" — jiný cenový segment
icons_rating_display: 9.9
# buy_decision se zobrazí automaticky pokud jsou vyplněna obě set_number
sc_for: ["Sbírka a display shelf", "Budget do 700 Kč", "30 min stavba"]
icons_for: ["Stavební zážitek ~4 hodiny", "Vitrína centerpiece", "Maximální věrnost detailu"]
```

**Databáze — propojení SC ↔ Icons v tabulce sets:**
```sql
-- Přidej do tabulky sets (v SQL schématu výše)
ALTER TABLE sets ADD COLUMN lego_line text DEFAULT 'speed_champions'
  CHECK (lego_line IN ('speed_champions', 'icons', 'technic'));

ALTER TABLE sets ADD COLUMN sibling_set_number text REFERENCES sets(set_number);
-- sibling: SC Countach 76908 ↔ Icons Countach 10317 (obousměrné)
```

**Seed data pro Icons/Technic sety:**
```typescript
const ICONS_AND_TECHNIC_SETS = [
  // Icons
  { set_number: '10317', name: 'Lamborghini Countach 25th Anniversary',
    brand: 'Lamborghini', year_released: 2023, pieces: 1161, rrp_czk: 3499,
    status: 'available', lego_line: 'icons', sibling_set_number: '76908' },
  { set_number: '10295', name: 'Porsche 911',
    brand: 'Porsche', year_released: 2021, pieces: 1458, rrp_czk: 3299,
    status: 'retired', lego_line: 'icons', sibling_set_number: '75912' },
  // Technic
  { set_number: '42143', name: 'Ferrari Daytona SP3',
    brand: 'Ferrari', year_released: 2022, pieces: 3778, rrp_czk: 4999,
    status: 'available', lego_line: 'technic' },
  { set_number: '42141', name: 'McLaren Formula 1 Race Car',
    brand: 'McLaren', year_released: 2022, pieces: 1432, rrp_czk: 2799,
    status: 'available', lego_line: 'technic', sibling_set_number: '76918' },
  { set_number: '42172', name: 'Pagani Utopia',
    brand: 'Pagani', year_released: 2024, pieces: 3975, rrp_czk: 4999,
    status: 'available', lego_line: 'technic' },
]
```

**Jak se Icons sety zobrazují jinde na webu:**

- **Databáze setů `/sety`** — Icons/Technic jsou v databázi, filtrovat přes `?line=icons` nebo `?line=technic`. Žádná nová stránka — jen filter chip navíc.
- **Ceny `/ceny`** — Icons sety mají svůj řádek v tabulce. Dražší tier, jiný tab nebo sekce "Icons & Technic" pod hlavní tabulkou.
- **Nav** — beze změny. Žádná nová položka. Icons jsou součástí DNA, ne samostatná sekce.
- **Hall of Fame** — oddělené rankingy: `Speed Champions HOF` (výchozí tab) + `Icons & Technic HOF` (druhý tab). Nesrovnávají se navzájem — různé cenové ligy.

---

### 8.4 Generace Archiv — `app/generace/page.tsx`

Viz `generace-archive.html`:
- Page header se split preview (6-wide VS 8-wide)
- Stats: N srovnání, N× vyhrál nový, N× vyhrál starý
- Filtry: auto (ne značka), era přechod
- Karty: vždy split foto — levá polovina starý set, pravá nový

---

### 8.5 Generace Článek — `app/generace/[slug]/page.tsx`

Viz `generace-article.html`:
- Split hero: levý panel = starý set, pravý panel = nový set, VS divider uprostřed
- Winner banner dole v heroi
- Comparison tabulka (3 sloupce, zvýrazněné vítězné buňky)
- `<ComparisonSlider>` — interaktivní drag slider (viz sekce 10)
- Verdict box se skóre obou setů

---

### 8.6 Ceny / Pit Stop — `app/ceny/page.tsx`

Viz `ceny.html`:
- "Pit Stop" + live dot + timestamp poslední aktualizace
- Stats: N slev, N retiring, N nových
- Sticky tabs: Aktuální / Slevy / Retiring / Retired / History
- Filtry: značka, stav, cenový range slider
- Price tabulka (viz níže)
- `<PriceAlertForm>` dole

**Price tabulka — PriceRow.tsx:**
```typescript
interface PriceRowProps {
  set: LegoSet
  prices: Record<Store, PriceSnapshot | null>
}
// Sloupce: foto | brand/název/číslo | dílků | Mall.cz | Alza | LEGO.com | BrickLink | stav badge | Alert btn
// Barevné levé bordy: zelená=sleva, oranžová=retiring, modrá=nový, červená=hot
```

**Data fetching pro ceny:**
Ceny jsou v Supabase tabulce `prices`. Scraping probíhá přes Vercel Cron (denně 6:00 UTC). Viz sekce 12.

---

### 8.7 Hall of Fame — `app/hof/page.tsx`

Viz `hall-of-fame.html`:
- Hero s tmavou fotkou v pozadí
- #1 speciální velký layout (rank + foto + score bary + verdict)
- #2–10 kompaktní řádky s photo reveal
- Honorable mentions 3-grid
- Sidebar: filtr (éra, značka) + metodika hodnocení (25/25/20/20/10%)

Data: `articles` tabulka kde `series='dna'` a `is_draft=false`, seřazeno dle `rating_overall DESC`.

---

### 8.8 Paddock Rumors — `app/paddock/page.tsx`

Viz `paddock-rumors.html`:
- Červený accent, "live" pulsing dot
- Rumor Meter legenda: Spekulace (fialová) / Pravděpodobné (oranžová) / Téměř jisté (zelená) / Potvrzeno (modrá)
- Stats počítadla per confidence level
- Featured rumor (nejvyšší confidence) — velká karta přes celou šířku
- Grid menších karet
- "Splněné rumors" sekce dole

---

### 8.9 Databáze Setů — `app/sety/page.tsx`

Viz `databaze.html`:
- Search hero s fulltextovým inputem
- Stats: N setů / N dostupných / N retired / N značek
- Sidebar filtry: éra toggle (6-wide/8-wide), stav checkboxy, značky checkboxy, range slidery (cena/dílky/rok)
- 4-sloupcový grid s photo reveal, set badge na hover, status badge, score badge
- Load more button (nebo infinite scroll)

**Server-side search:**
```typescript
// Fulltext přes Supabase
const query = supabase.from('sets').select('*')
if (q) query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,set_number.ilike.%${q}%`)
if (brand) query.eq('brand', brand)
if (status) query.eq('status', status)
if (era) query.eq('era', era)
query.gte('rrp_czk', priceMin).lte('rrp_czk', priceMax)
query.gte('pieces', piecesMin).lte('pieces', piecesMax)
query.order(sortCol, { ascending: sortAsc }).range(offset, offset + PAGE_SIZE - 1)
```

---

### 8.10 Komunita / Bazaar — `app/komunita/page.tsx`

Viz `komunita.html`:
- Coming soon se živým countdown timerem do 1. 9. 2026
- Email waitlist s fake counter (začíná na 847, uloženo v Supabase `waitlist` tabulce)
- Blurred marketplace mockup preview
- 6 feature karet

---

### 8.11 404 stránka — `app/not-found.tsx`

Viz `404.html`:
- Velký "404" jako background text (průhledný, obří)
- Grid tmavých aut v pozadí
- Blikající červená tečka + "Signal Lost" zpráva
- 3 suggested link karty (DNA / Hall of Fame / Paddock Rumors)

---

### 8.12 Loading Skeletons — `app/**/loading.tsx`

Každá stránka má loading.tsx s animovaným skeletonem. Skeleton dodržuje layout stránky — stejný grid, stejné proporce, jen placeholder bloky s pulse animací `bg-sur2 animate-pulse`.

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

---

## 9. MDX KOMPONENTY
