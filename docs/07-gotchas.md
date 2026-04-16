# 07 — Gotchas & Known Issues
## Eight Wide — přečti před deploymentem

> Toto jsou bugy a pasti které zastavily nebo poškodily produkci na aikompass.cz.
> Každý bod je z reálné zkušenosti. Přečti celý soubor před prvním deploymentem.

---


## 23. POZNÁMKY & GOTCHAS

**Brickset CDN:** `https://images.brickset.com/sets/images/[SETNUMBER]-1.jpg` — přidej do `next.config.mjs` remotePatterns.

**Railway vs Vercel pro agenty:** Agenti MUSÍ běžet na Railway — ne na Vercelu. Vercel Serverless Functions mají timeout 10s (hobby) nebo 300s (pro). Psaní DNA článku trvá 600s+. Railway = trvalý Python proces bez timeout limitu.

**Railway restart window:** Po git push do agent repozitáře Railway restartuje proces (~15–30s). Pokud pipeline právě běží = zabitý BackgroundTask = stuck draft v DB se statusem 'draft'. Fix: po commitu čekat 90s před dalším triggerem.

**Supabase service role key:** VŽDY `SUPABASE_SERVICE_ROLE_KEY` pro agenty na Railway — nikdy anon key. Anon key má RLS omezení, service role má plný přístup.

**Supabase free plan limit:** Free plan nepodporuje `/pg/query` endpoint — některé tabulky musíš vytvořit ručně v Supabase SQL Editoru, ne přes API.

**GitHub batch commit:** Každý commit spouští Vercel rebuild (~2–3 min). Vždy commituj celý batch najednou — `commit_mdx_articles_batch()` — ne per-článek. 3 články = 1 rebuild místo 3.

**Brickset API:** Zdarma, 200 requestů/den na free key. Pro initial import (12 let × 2 themes = ~24 requestů) stačí. Dokumentace: `https://brickset.com/article/52664/api-version-3-documentation`

**BrickLink API:** OAuth 1.0 — složitější setup. Registrace: `https://www.bricklink.com/v3/api.page`. Rate limit 5 000 req/den.

**Playwright na Railway:** Funguje, ale potřebuje Chromium — přidej do requirements a nastav `PLAYWRIGHT_BROWSERS_PATH`. Railway to zvládne na základním plánu.

**EUR → CZK kurz:** Hardcode přibližný kurz (25.2) nebo fetchni live z ČNB API (`https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt`).

**MDX truncation:** Vždy `max_tokens=16000` pro psaní článků. Nikdy méně. Truncated MDX způsobí broken render na webu bez žádné chybové hlášky.

**Rebrickable CSV:** Záloha zdroj. Stáhni z `https://rebrickable.com/downloads/` → `sets.csv`. Speed Champions theme ID: 736.

**Playwright na Vercelu:** Vercel Serverless Functions mají limit 50MB — Playwright je velký. Řešení: scraping běží na Railway agentovi, ne na Vercelu.

**LEGO affiliate:** Registrace na `https://www.partnerize.com/en` jako LEGO partner. Schválení trvá 2-4 týdny. Mezitím používej přímé linky.

**Mall.cz affiliate:** `https://www.mall.cz/affiliate` — CJ Affiliate network. Instant approval.

**Alza affiliate:** `https://www.alza.cz/affiliate` — vlastní program. Approval 1-3 dny.

**MDX s App Router:** Použij `@next/mdx` + `contentlayer` kombinaci. Contentlayer řeší type safety a frontmatter parsing. `@next/mdx` řeší rendering.

**Supabase RLS:** Všechny public SELECT policies jsou nastaveny. Pro INSERT vždy `SUPABASE_SERVICE_ROLE_KEY` na serveru, nikdy `ANON_KEY`.

**Supabase Storage:** Nepoužíváme — jen PostgreSQL. Fotky ukládej jako URL stringy do DB (Brickset CDN, LEGO.com CDN, Unsplash URL). Žádný Storage bucket není potřeba.

**Image optimization:** Brickset CDN obrázky jsou malé (PNG, 800×600 max). Unsplash obrázky fetchuj s `?auto=format&fit=crop&w=1200&q=85`.

**CZ locale:** Čísla formátovat jako `1 234,56 Kč` — použij `Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' })`.

---

## 24. KNOWN EXTERNAL SERVICE GOTCHAS — z produkce
## 24. KNOWN EXTERNAL SERVICE GOTCHAS — z produkce

### Resend — email

**API key typ:** Resend má dva typy klíčů — `Full access` a `Sending only`. Sending-only klíč blokuje volání na `/domains` endpoint (diagnostika domény selže s 403). Pro newsletter stačí Sending-only, ale pro diagnostické endpointy potřebuješ Full access klíč — nebo volej `/domains` diagnostiku přímo v Resend dashboardu, ne přes API.

**DKIM/SPF/MX setup:** Před prvním odesláním ověř všechny DNS záznamy v Resend dashboardu. Bez DKIM/SPF skončí emaily v spamu. Postup:
```
Resend Dashboard → Domains → speedchampions.cz → DNS Records
Přidej všechny zobrazené TXT záznamy do DNS u WEDOS
Počkej 10–30 min na propagaci → Status: Verified ✓
```

**seznam.cz warming:** První emaily na seznam.cz mohou mít nízkou doručitelnost kvůli IP warming. Symptom: `send-test` vrátí `sent: 1` ale email nedorazí. Řešení: začni s malým objemem (< 50 emailů/den), postupně zvyšuj. Gmail a Outlook fungují okamžitě.

**`send-test` vrací `sent: 0`:** Pokud diagnostický endpoint vrátí `sent: 0`, zkontroluj v tomto pořadí:
1. Je API klíč Sending-only nebo Full access? (viz výše)
2. Je doména verified v Resend dashboardu?
3. Je `RESEND_FROM_EMAIL` přesně ve formátu `newsletter@speedchampions.cz` (ne jen doména)?
4. Je recipient email validní a ne na suppress listu?

---

### Vercel / Next.js — build failures

**`useSearchParams()` bez `<Suspense>` → build failure (Next.js 14+):**
```tsx
// ❌ ŠPATNĚ — build selže bez jasné error hlášky
export default function Page() {
  const params = useSearchParams() // crash!
  ...
}

// ✅ SPRÁVNĚ — vždy obalit Suspense
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
function PageContent() {
  const params = useSearchParams() // OK
  ...
}
```

**`React.ReactNode` bez importu → TypeScript strict error:**
```tsx
// ❌ ŠPATNĚ
interface Props { children: React.ReactNode }

// ✅ SPRÁVNĚ — explicitní import
import type { ReactNode } from 'react'
interface Props { children: ReactNode }
```

**MDX props přes RSC boundary — array/number nefungují:**
```tsx
// ❌ ŠPATNĚ — array ani number nejdou přes RSC → Client Component boundary
<SpecsTable data={[["Motor", "V8"]]} />  // selže pokud SpecsTable je Client Component
<LegoRating overall={9.2} />            // number selže

// ✅ SPRÁVNĚ — stringify přes boundary, parse uvnitř
<SpecsTable dataJson={JSON.stringify([["Motor", "V8"]])} />
// uvnitř SpecsTable.tsx: const data = JSON.parse(props.dataJson)
```

**`@ts-expect-error` → error pokud suppressed chyba neexistuje:**
```tsx
// ❌ ŠPATNĚ — pokud TS chyba zmizí (upgrade, fix), direktiva způsobí novou chybu
// @ts-expect-error
const x: string = 42

// ✅ SPRÁVNĚ — použij @ts-ignore pokud si nejsi jistý trvalostí
// nebo odstraň direktiva jakmile je chyba vyřešena
```

**Build failure je tichý — vždy ověř:**
Po každém `git push` (nebo merge do main) **čekej 3 minuty** a zkontroluj Vercel dashboard. Build failure se neprojeví okamžitě a Vercel někdy zobrazí starou úspěšnou verzi. Nespoléhej na to že "deploy proběhl" — explicitně zkontroluj status v dashboardu nebo přes Vercel CLI: `vercel ls`.

**Vercel build timeout:** Výchozí limit je 45 minut. `contentlayer` s velkým počtem MDX souborů může být pomalý. Pokud build trvá déle → přidej do `vercel.json`:
```json
{ "buildCommand": "next build", "framework": "nextjs" }
```

---

*Eight Wide — speedchampions.cz — Blueprint v2.0*
*Vygenerováno: 2025 — interní dokument*


---

## Railway Agent — kritické bugy z produkce


### 13.4 Kritické pasti z produkce

Toto jsou bugy které zastavily nebo poškodily pipeline na aikompass.cz. Zabudovat prevenci od začátku.

**🔴 Pipeline-killing bugy:**

```python
# BUG 1: Stuck drafts po Railway restartu
# Příčina: git push mid-pipeline → Railway restart → kill BackgroundTask
# Fix: po každém git push čekat 90s, pak triggerovat další krok
await github_tool.commit_batch(articles)
await asyncio.sleep(90)  # Railway restart window
await next_step()

# BUG 2: DB constraint 500 error
# Příčina: nepovolený status v articles tabulce
# Fix: POUZE tyto statusy: draft | approved | published | rejected | archived
# ⚠️ 'fact_check_failed' NENÍ povolen → způsobí 500

# BUG 3: MDX truncation
# Příčina: max_tokens příliš nízký → článek se uprostřed utne
# Fix: vždy max_tokens=16000 pro psaní článků, nikdy méně
response = call_claude(prompt, max_tokens=16000)  # bez výjimky

# BUG 4: Timeout stacking
# Příčina: outer timeout < součet inner timeoutů
# Fix: outer musí být > součtu všech inner timeoutů + buffer
assert OUTER_TIMEOUT > sum(INNER_TIMEOUTS) + 120

# BUG 5: In-memory state po restartu
# Příčina: Railway restarty zabijí in-memory listy
# Fix: VŽDY Supabase jako source of truth, nikdy in-memory
# ❌ ŠPATNĚ:
_processed_today = []
# ✅ SPRÁVNĚ:
await supabase.table("agent_decisions").insert({"decision_type": "processed", ...})
```

**🟡 Výsledkové bugy:**

```python
# BUG 6: Duplicitní články
# Příčina: Jaccard threshold 0.75 příliš vysoký
# Fix: threshold=0.50 — "průvodce" vs "návod" = 70%, musí být zachyceno
DEDUP_THRESHOLD = 0.50  # ne 0.75

# BUG 7: SEO score "N/A" v reportu
# Příčina: seo_score nebyl persistován do DB při publish
# Fix: _auto_publish musí UPDATE seo_score do DB

# BUG 8: Inflated error count
# Příčina: více triggerů = více topic_proposal řádků v DB
# Fix: count unique titles, ne count všech řádků
unique_topics = len(set(d["payload"]["title"] for d in decisions))
```

**🟢 Blocking I/O pasti:**

```python
# ❌ ŠPATNĚ — blokuje event loop
time.sleep(60)
result = supabase.table("articles").select("*").execute()  # v async funkci

# ✅ SPRÁVNĚ
await asyncio.sleep(60)
result = await asyncio.to_thread(
    supabase.table("articles").select("*").execute
)

# ❌ ŠPATNĚ — APScheduler job musí být async
def _my_job():
    asyncio.run(my_async_function())  # deadlock!

# ✅ SPRÁVNĚ
async def _my_job():
    await my_async_function()

# ❌ ŠPATNĚ — httpx DELETE bez body
httpx.delete(url, json=data)  # nefunguje

# ✅ SPRÁVNĚ
httpx.Client().request("DELETE", url, content=json.dumps(data))
```

