# Eight Wide — START HERE
## Instrukce pro Claude Code

> Přečti tento soubor celý před prvním příkazem. Pak přečti ostatní docs v pořadí 01→07.

---

## Co stavíme

**Eight Wide** — automotive magazín o LEGO Speed Champions (+ Icons/Technic).
Doména: `speedchampions.cz`
Stack: Next.js 14, TypeScript, Tailwind CSS, MDX, Supabase, Vercel

Unikátní pozice: píšeme o historii reálného auta a hodnotíme jak moc to LEGO zachytilo.
Čtenář staví Porsche 911 RSR a chce vědět proč RSR a ne GT3 RS.

---

## Jak číst dokumentaci

```
docs/
├── START-HERE.md        ← tento soubor — přečti první
├── 01-design-system.md  ← barvy, fonty, CSS tokeny, UI patterny — přečti před JAKÝMKOLIV kódem
├── 02-database.md       ← Supabase schema, typy, RLS policies
├── 03-pages.md          ← specifikace všech 11 stránek
├── 04-components.md     ← všechny React + MDX komponenty
├── 05-data-pipeline.md  ← Brickset API, scraping, BrickLink, foto agenti
├── 06-admin.md          ← admin panel + photo agent
└── 07-gotchas.md        ← KRITICKÉ — přečti před deploymentem

reference/               ← HTML prototypy — AUTORITATIVNÍ vizuální vzor
├── eight-wide-photos.html     → Homepage
├── dna-archive.html           → DNA Archiv
├── dna-ferrari-f40.html       → DNA Článek
├── generace-archive.html      → Generace Archiv
├── generace-article.html      → Generace Článek (comparison slider)
├── ceny.html                  → Ceny / Pit Stop
├── hall-of-fame.html          → Hall of Fame
├── paddock-rumors.html        → Paddock Rumors
├── databaze.html              → Databáze setů
├── komunita.html              → Komunita / Bazaar
└── 404.html                   → 404 stránka
```

**Pravidlo:** Před implementací každé stránky vždy nejprve `view` příslušný HTML prototyp.
Design z HTML souborů je autoritativní — fonty, barvy, spacing, hover efekty, komponenty.

---

## Pořadí implementace — dodržuj přesně

### Fáze 1 — Základ (začni zde)
1. `next.config.mjs` + `tailwind.config.ts` + `styles/globals.css`
   → přečti `01-design-system.md` před tímto krokem
2. Supabase schema — spusť kompletní SQL z `02-database.md`
3. `lib/supabase/client.ts` + `lib/supabase/server.ts` + `types/index.ts`
4. `components/layout/Nav.tsx` + `components/layout/Footer.tsx` + `components/layout/Ticker.tsx`
5. UI atomy: `SetBadge.tsx`, `PhotoReveal.tsx`, `StatusBadge.tsx`, `BuyButton.tsx`
6. `scripts/seed.ts` → `npm run db:seed`

### Fáze 2 — Hlavní stránky
7. Homepage `app/page.tsx` → reference: `eight-wide-photos.html`
8. DNA Archiv `app/dna/page.tsx` → reference: `dna-archive.html`
9. DNA Článek `app/dna/[slug]/page.tsx` → reference: `dna-ferrari-f40.html`
10. MDX komponenty: `Chapter`, `PullQuote`, `SpecsTable`, `RvbCompare`, `LegoRating`
11. MDX komponenty: `IconsReview`, `BuyDecision`
12. Contentlayer setup + první 2 MDX články
13. 404 `app/not-found.tsx` → reference: `404.html`
14. Loading skeletony pro každou stránku

### Fáze 3 — Databáze a ceny
15. Databáze setů `app/sety/page.tsx` → reference: `databaze.html`
16. `scripts/import-brickset.ts` → `npm run db:import-brickset`
17. Ceny `app/ceny/page.tsx` → reference: `ceny.html`
18. Price Alert API `app/api/price-alert/route.ts`

### Fáze 4 — Obsah stránky
19. Generace Archiv `app/generace/page.tsx` → reference: `generace-archive.html`
20. Generace Článek `app/generace/[slug]/page.tsx` → reference: `generace-article.html`
21. MDX komponenta `ComparisonSlider.tsx`
22. Hall of Fame `app/hof/page.tsx` → reference: `hall-of-fame.html`
23. Paddock Rumors `app/paddock/page.tsx` → reference: `paddock-rumors.html`
24. Komunita `app/komunita/page.tsx` → reference: `komunita.html`

### Fáze 5 — Newsletter + SEO
25. Resend setup + Newsletter API + double opt-in
26. Dynamické OG obrázky `app/api/og/[slug]/route.tsx`
27. Structured data (Article + Product JSON-LD)
28. `next-sitemap` config

### Fáze 6 — Admin panel
29. Admin auth `app/admin/layout.tsx` + `app/admin/login/page.tsx`
30. Admin dashboard `app/admin/page.tsx`
31. Karta setu `app/admin/sety/[setNumber]/page.tsx`
32. Editor článku `app/admin/clanky/[slug]/page.tsx`
→ detail v `06-admin.md`

### Fáze 7 — Polish
33. Mobile nav + breakpointy
34. Cookie banner
35. Vercel deployment + custom domain `speedchampions.cz`

---

## Absolutní pravidla — nikdy neporušuj

```
✓ Design tokeny: VŽDY CSS custom properties (--gold, --bg, --sur...)
  NIKDY hardcoded barvy v komponentách

✓ Supabase: VŽDY service role key na serveru
  NIKDY anon key v server-side kódu

✓ useSearchParams(): VŽDY obalit <Suspense>
  Bez Suspense = build failure bez jasné chybové hlášky

✓ MDX array/number props přes RSC boundary: VŽDY JSON.stringify
  NIKDY předávat array nebo number přímo jako prop přes RSC boundary

✓ max_tokens pro AI psaní: VŽDY 16000
  Méně = MDX truncation = broken render bez chybové hlášky

✓ GitHub commits pro MDX: VŽDY batch commit (1 commit pro více článků)
  NIKDY per-článek commit — každý commit = Vercel rebuild

✓ Po každém git push: VŽDY počkej 3 min a ověř Vercel build status
  Build failure může být tichý
```

---

## Env vars — co potřebuješ před startem

Vytvoř `.env.local` s těmito hodnotami (vyplň skutečné klíče):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=newsletter@speedchampions.cz
RESEND_FROM_NAME=Eight Wide
ANTHROPIC_API_KEY=sk-ant-...
BRICKSET_API_KEY=...
UNSPLASH_ACCESS_KEY=...
BRICKLINK_CONSUMER_KEY=...
BRICKLINK_CONSUMER_SECRET=...
BRICKLINK_TOKEN=...
BRICKLINK_TOKEN_SECRET=...
CRON_SECRET=...nahodny_string_32_znaku...
NEXT_PUBLIC_BASE_URL=https://speedchampions.cz
```

---

## Hotový projekt vypadá takto

```
speedchampions.cz          ← Next.js na Vercel
  /dna                     ← DNA archiv
  /dna/ferrari-f40         ← DNA článek s MDX komponentami
  /generace                ← Generace srovnání
  /ceny                    ← Pit Stop price tracker
  /hof                     ← Hall of Fame
  /paddock                 ← Paddock Rumors
  /sety                    ← Databáze setů
  /komunita                ← Bazaar coming soon
  /admin                   ← Admin panel (chráněný)

eight-wide-agent           ← Python na Railway (SEPARÁTNÍ repo)
  → generuje MDX články
  → commituje do eight-wide-web
  → scrape ceny
  → Telegram schválení
```

Agent repo se buduje separátně — viz docs agenta v `eight-wide-agent/docs/`.
