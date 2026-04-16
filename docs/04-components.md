# 04 — Komponenty
## Eight Wide — React + MDX komponenty

---


## 9. MDX KOMPONENTY

### contentlayer.config.ts

```typescript
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const DnaArticle = defineDocumentType(() => ({
  name: 'DnaArticle',
  filePathPattern: 'dna/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    series: { type: 'string', required: true },
    number: { type: 'number', required: true },
    brand: { type: 'string', required: true },
    year_real: { type: 'number' },
    set_number: { type: 'string', required: true },
    set_pieces: { type: 'number' },
    set_price_czk: { type: 'number' },
    set_status: { type: 'string', default: 'available' },
    hero_photo: { type: 'string', required: true },
    rating_shape: { type: 'number' },
    rating_detail: { type: 'number' },
    rating_build: { type: 'number' },
    rating_value: { type: 'number' },
    rating_display: { type: 'number' },
    read_time: { type: 'number' },
    excerpt: { type: 'string' },
    published: { type: 'date', required: true },
    draft: { type: 'boolean', default: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/dna/${doc.slug}`,
    },
    rating_overall: {
      type: 'number',
      resolve: (doc) => {
        const { rating_shape=0, rating_detail=0, rating_build=0,
                rating_value=0, rating_display=0 } = doc
        return +((rating_shape*0.25 + rating_detail*0.25 + rating_build*0.20
                  + rating_value*0.20 + rating_display*0.10)).toFixed(1)
      },
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [DnaArticle],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
```

### Přehled MDX komponent

**`<Chapter title="...">` body text** — nadpis h2 serif italic + paragrafy

**`<PullQuote author="...">` text** — zlatý border-left, serif italic, jméno autora

**`<InlinePhoto src="..." caption="..." side="left|right">`** — foto s caption, plovoucí nebo fullwidth

**`<SpecsTable data={[["Motor","V8 biturbo"],...]}/>`** — tabulka technických dat, kondenzovaný font

**`<RvbCompare realPhoto="..." legoSetNumber="..." realLabel="..." legoLabel="..."/>`**
— Side-by-side: reálné auto vlevo / LEGO vpravo, fotky s photo reveal, tagy

**`<ComparisonSlider before="..." after="..." />`** — Generace slider: drag odkrývá starý/nový set. Pure JS, bez dependencí.
```typescript
// Implementace v ComparisonSlider.tsx
// Použít useRef + onMouseDown/onTouchStart event handlers
// CSS clip-path: inset(0 calc(100% - {pct}%) 0 0) pro overlay
```

**`<LegoRating setNumber="..." overall={9.2} shape={9.2} detail={8.8} build={8.5} value={9.4} display={9.6} verdict="..."/>`**
— Scoring widget: velké číslo /10, 5 progress barů (zlaté), verdikt text, buy CTA

---

## 10. BUY BUTTON — AFFILIATE LINKY
## 10. BUY BUTTON — AFFILIATE LINKY

```typescript
// lib/affiliate.ts
type StoreKey = 'mall' | 'alza' | 'lego' | 'bricklink'

const AFFILIATE_PARAMS: Record<StoreKey, (url: string) => string> = {
  mall:      (url) => `${url}?utm_source=eightwide&utm_medium=affiliate&utm_campaign=sc`,
  alza:      (url) => `${url}?ref=eightwide`,
  lego:      (url) => `${url}?CMP=AFC-AFF-eightwide_CZ`,
  bricklink: (url) => url, // BrickLink nemá affiliate
}

export function affiliateUrl(store: StoreKey, baseUrl: string): string {
  return AFFILIATE_PARAMS[store](baseUrl)
}

// Brickset CDN pro obrázky setů
export function setImageUrl(setNumber: string): string {
  return `https://images.brickset.com/sets/images/${setNumber}-1.jpg`
}
```

**`<BuyButton>` komponenta:**
```typescript
interface BuyButtonProps {
  store: StoreKey
  baseUrl: string
  price: number
  label?: string
}
// Renderuje zlaté tlačítko s automaticky přidanými affiliate parametry
// Loguje click do Supabase analytics tabulky
```

---

## 11. PRICE SCRAPING — agents/prices.ts
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
### contentlayer.config.ts

```typescript
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const DnaArticle = defineDocumentType(() => ({
  name: 'DnaArticle',
  filePathPattern: 'dna/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    series: { type: 'string', required: true },
    number: { type: 'number', required: true },
    brand: { type: 'string', required: true },
    year_real: { type: 'number' },
    set_number: { type: 'string', required: true },
    set_pieces: { type: 'number' },
    set_price_czk: { type: 'number' },
    set_status: { type: 'string', default: 'available' },
    hero_photo: { type: 'string', required: true },
    rating_shape: { type: 'number' },
    rating_detail: { type: 'number' },
    rating_build: { type: 'number' },
    rating_value: { type: 'number' },
    rating_display: { type: 'number' },
    read_time: { type: 'number' },
    excerpt: { type: 'string' },
    published: { type: 'date', required: true },
    draft: { type: 'boolean', default: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/dna/${doc.slug}`,
    },
    rating_overall: {
      type: 'number',
      resolve: (doc) => {
        const { rating_shape=0, rating_detail=0, rating_build=0,
                rating_value=0, rating_display=0 } = doc
        return +((rating_shape*0.25 + rating_detail*0.25 + rating_build*0.20
                  + rating_value*0.20 + rating_display*0.10)).toFixed(1)
      },
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [DnaArticle],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
```

### Přehled MDX komponent

**`<Chapter title="...">` body text** — nadpis h2 serif italic + paragrafy

**`<PullQuote author="...">` text** — zlatý border-left, serif italic, jméno autora

**`<InlinePhoto src="..." caption="..." side="left|right">`** — foto s caption, plovoucí nebo fullwidth

**`<SpecsTable data={[["Motor","V8 biturbo"],...]}/>`** — tabulka technických dat, kondenzovaný font

**`<RvbCompare realPhoto="..." legoSetNumber="..." realLabel="..." legoLabel="..."/>`**
— Side-by-side: reálné auto vlevo / LEGO vpravo, fotky s photo reveal, tagy

**`<ComparisonSlider before="..." after="..." />`** — Generace slider: drag odkrývá starý/nový set. Pure JS, bez dependencí.
```typescript
// Implementace v ComparisonSlider.tsx
// Použít useRef + onMouseDown/onTouchStart event handlers
// CSS clip-path: inset(0 calc(100% - {pct}%) 0 0) pro overlay
```

**`<LegoRating setNumber="..." overall={9.2} shape={9.2} detail={8.8} build={8.5} value={9.4} display={9.6} verdict="..."/>`**
— Scoring widget: velké číslo /10, 5 progress barů (zlaté), verdikt text, buy CTA

