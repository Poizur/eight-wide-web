# 01 — Design Systém
## Eight Wide — speedchampions.cz

> Přečti tento soubor CELÝ před napsáním prvního řádku CSS nebo TSX.
> Design tokeny jsou autoritativní — nikdy nepoužívej hardcoded barvy.

---

## Fonty — Google Fonts

```html
<!-- Přidej do app/layout.tsx nebo <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

| Font | Použití | CSS var |
|---|---|---|
| **Barlow Condensed 700/900** | Headlinky, labely, čísla, nav, badges | `var(--cond)` |
| **Instrument Serif italic** | Velké titulky článků, serif akcenty | `var(--serif)` |
| **DM Sans 400/500/600** | Body text, nav, UI text | `var(--sans)` |

---

## CSS Custom Properties — styles/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ── Pozadí a povrchy ── */
  --bg:    #0A0C10;              /* hlavní pozadí stránky */
  --sur:   #111620;              /* karty, sidebary */
  --sur2:  #181F2E;              /* hover stav karet */
  --bdr:   rgba(255,255,255,0.07); /* border pro všechny elementy */

  /* ── Akcenty ── */
  --gold:  #C9A227;              /* primární akcent — zlatá */
  --gold2: #E8C547;              /* zlatá hover */
  --red:   #C8281E;              /* série accent, urgentní */
  --green: #27AE60;              /* sleva, dostupný */
  --orange: #E67E22;             /* retiring soon */
  --blue:  #3498DB;              /* nový set, confirmed */
  --purple: #9B59B6;             /* spekulace / rumors */

  /* ── Text ── */
  --text:  #EAE8E0;              /* primární text */
  --text2: #8B95A8;              /* sekundární text, popisy */
  --text3: #3E4A58;              /* tertiary, labely, disabled */

  /* ── Typografie ── */
  --cond:  'Barlow Condensed', Arial, sans-serif;
  --serif: 'Instrument Serif', Georgia, serif;
  --sans:  'DM Sans', -apple-system, sans-serif;

  /* ── Layout ── */
  --max-w: 1280px;               /* max-width pro všechny sekce */
  --px:    32px;                 /* horizontální padding */
  --nav-h: 58px;                 /* výška fixed navu */
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar — tmavá témata */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--text3); border-radius: 3px; }
```

---

## Tailwind Config — tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        bg:     '#0A0C10',
        sur:    '#111620',
        sur2:   '#181F2E',
        gold:   '#C9A227',
        gold2:  '#E8C547',
        red:    '#C8281E',
        green:  '#27AE60',
        orange: '#E67E22',
        blue:   '#3498DB',
      },
      fontFamily: {
        cond:  ['Barlow Condensed', 'Arial', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans:  ['DM Sans', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## UI Patterny — přesné CSS implementace

### Photo Reveal
Fotky startují tmavé a saturace 0, na hover se rozsvítí. Klíčový efekt na celém webu.

```css
.photo-reveal img {
  filter: brightness(0.15) saturate(0.2);
  transform: scale(1.04);
  transition: filter 0.7s cubic-bezier(0.16,1,0.3,1),
              transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.photo-reveal:hover img {
  filter: brightness(0.85) saturate(1);
  transform: scale(1);
}
```

**Jako Tailwind utility (přidej do globals.css):**
```css
@layer utilities {
  .photo-dark { filter: brightness(0.15) saturate(0.2); transform: scale(1.04); transition: filter 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .group:hover .photo-dark { filter: brightness(0.85) saturate(1); transform: scale(1); }
}
```

### Set Badge — frosted glass
Zobrazí se na hover v pravém horním rohu fotky. Číslo setu + "SET NO." label.

```css
.set-badge {
  background: rgba(10,12,16,0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 6px 10px;
  text-align: center;
  opacity: 0;
  transform: translateY(-3px);
  transition: opacity 0.3s, transform 0.3s;
}
.card:hover .set-badge {
  opacity: 1;
  transform: translateY(0);
}
.set-badge-number {
  font-family: var(--cond);
  font-size: 14px;
  font-weight: 900;
  color: rgba(255,255,255,0.9);
  line-height: 1;
}
.set-badge-label {
  font-family: var(--cond);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}
```

### Gold Bar Accent
3px zlatý proužek jako levý border. Používá se na featured karty, citáty, aktivní sekce.

```css
.gold-bar { border-left: 3px solid var(--gold); }
```

### Fixed Nav
```css
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  background: rgba(10,12,16,0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  height: var(--nav-h);
  border-bottom: 1px solid var(--bdr);
}
```

### Gold underline hover na nav linkách
```css
.nav-link {
  font-family: var(--cond);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 6px 12px;
  border-radius: 5px;
  transition: all 0.15s;
}
.nav-link:hover, .nav-link.active {
  color: var(--text);
  background: rgba(255,255,255,0.05);
}
```

---

## Logo — přesná specifikace

```tsx
// components/layout/Logo.tsx
// Zlatý proužek 24px nahoře + "Eight Wide" + "LEGO SPEED CHAMPIONS"

export function Logo() {
  return (
    <a href="/" style={{ display:'flex', flexDirection:'column', textDecoration:'none' }}>
      {/* Zlatý proužek */}
      <div style={{ width:24, height:2, background:'var(--gold)', marginBottom:4 }} />
      {/* Název */}
      <div style={{
        fontFamily:'var(--sans)', fontSize:18, fontWeight:600,
        color:'var(--text)', letterSpacing:'-0.02em', lineHeight:1
      }}>
        Eight <span style={{ color:'var(--gold)' }}>Wide</span>
      </div>
      {/* Subtext */}
      <div style={{
        fontFamily:'var(--cond)', fontSize:7, letterSpacing:'0.22em',
        textTransform:'uppercase', color:'var(--text3)', marginTop:2
      }}>
        Lego Speed Champions
      </div>
    </a>
  )
}
```

---

## Typografická hierarchie

| Element | Font | Velikost | Váha | Použití |
|---|---|---|---|---|
| Hero titulek | Instrument Serif italic | clamp(44px,5.5vw,72px) | regular | Hlavní titulky stránek |
| Article h2 | Instrument Serif italic | clamp(26px,2.8vw,36px) | regular | Nadpisy sekcí v článku |
| Card titulek | Barlow Condensed | 16–26px | 900 | Názvy setů a aut |
| Nav links | Barlow Condensed | 14px | 700 | uppercase, letter-spacing 0.08em |
| Labels | Barlow Condensed | 9–11px | 700 | uppercase, letter-spacing 0.16–0.22em |
| Body text | DM Sans | 15px | 400 | Články, popisy |
| Secondary text | DM Sans | 13–14px | 400 | Metadata, excerpty |
| Big numbers | Barlow Condensed | 24–72px | 900 | Stats, skóre, rank čísla |

---

## Adresářová struktura projektu

```
eight-wide-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── dna/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── generace/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── ceny/page.tsx
│   ├── hof/page.tsx
│   ├── paddock/page.tsx
│   ├── sety/page.tsx
│   ├── komunita/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── sety/[setNumber]/page.tsx
│   │   └── clanky/[slug]/page.tsx
│   └── api/
│       ├── subscribe/route.ts
│       ├── price-alert/route.ts
│       ├── og/[slug]/route.tsx
│       └── cron/
│           ├── sync-brickset/route.ts
│           └── check-alerts/route.ts
├── components/
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── Ticker.tsx
│   ├── ui/
│   │   ├── SetBadge.tsx
│   │   ├── PhotoReveal.tsx
│   │   ├── BuyButton.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── RumorMeter.tsx
│   │   ├── ScoreBar.tsx
│   │   ├── CountdownTimer.tsx
│   │   └── FilterBar.tsx
│   ├── cards/
│   │   ├── ArticleCard.tsx
│   │   ├── SetCard.tsx
│   │   ├── RumorCard.tsx
│   │   └── PriceRow.tsx
│   ├── article/
│   │   ├── ReadProgress.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── PriceSidebar.tsx
│   │   └── RelatedArticles.tsx
│   ├── mdx/
│   │   ├── Chapter.tsx
│   │   ├── PullQuote.tsx
│   │   ├── InlinePhoto.tsx
│   │   ├── SpecsTable.tsx
│   │   ├── RvbCompare.tsx
│   │   ├── ComparisonSlider.tsx
│   │   ├── LegoRating.tsx
│   │   ├── IconsReview.tsx
│   │   └── BuyDecision.tsx
│   ├── homepage/
│   │   ├── HeroCarousel.tsx
│   │   ├── LatestArticles.tsx
│   │   ├── PitStopPreview.tsx
│   │   ├── BrandsStrip.tsx
│   │   ├── HofPreview.tsx
│   │   └── SeriesTimeline.tsx
│   └── forms/
│       ├── NewsletterForm.tsx
│       └── PriceAlertForm.tsx
├── content/
│   ├── dna/
│   │   └── ferrari-f40.mdx
│   └── generace/
│       └── porsche-911-rsr-2016-vs-2023.mdx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── affiliate.ts
│   ├── og.ts
│   └── utils.ts
├── scripts/
│   ├── seed.ts
│   ├── import-brickset.ts
│   ├── crosscheck-rebrickable.ts
│   └── sync-bricklink.ts
├── types/index.ts
├── styles/globals.css
├── contentlayer.config.ts
├── next.config.mjs
├── tailwind.config.ts
└── next-sitemap.config.js
```

---

## next.config.mjs

```javascript
import { withContentlayer } from 'next-contentlayer'

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.brickset.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.lego.com' },
      { protocol: 'https', hostname: 'cdn.rebrickable.com' },
    ],
  },
  experimental: { mdxRs: true },
}

export default withContentlayer(nextConfig)
```
