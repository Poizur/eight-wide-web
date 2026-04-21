# REUSE_GUIDE.md — Průvodce znovupoužití pro nový projekt
*Aktualizováno: 2026-04-19 | Zdroj: {{PROJECT_DOMAIN}} ({{PROJECT}}-agent, po Fázích 12–17)*

> Cílem je, aby nový projekt v jiné doméně (`{{TOPIC}}`, `{{DOMAIN}}`, `{{AFFILIATE_TYPE}}`)
> vyšel jen s úpravou promptů + env vars + taxonomie. Všechno pipeline, quality,
> observability, tooling je připravené.

---

## 1. Co lze přímo zkopírovat (~60 % kódu)

### Infrastruktura a kostra — 100% reusable

| Soubor / modul | Co obsahuje | Úpravy potřeba? |
|---|---|---|
| `database/supabase_client.py` | Singleton Supabase client | ❌ Žádné |
| `tools/anthropic_client.py` | `call_claude()` s retry + rate limit | ❌ Žádné |
| `tools/error_log.py` | `log_error()`, `log_error_async()`, weekly stats | ❌ Žádné |
| `tools/telegram_tool.py` | `send_alert()`, `send_message()` | ❌ Žádné |
| `tools/github_tool.py` | Commit / batch commit / delete MDX | Jen `GITHUB_REPO` env var |
| `tools/pexels_tool.py` | Cover images z Pexels | ❌ Žádné |
| `tools/unsplash_tool.py` | Cover images z Unsplash | ❌ Žádné |
| `tools/search_tool.py` | DuckDuckGo search, exchange rates | ❌ Žádné |
| `tools/gsc_tool.py` | Google Search Console API | ❌ Žádné |
| `scheduler/jobs.py` | APScheduler setup + všechny wrappery | Časy + DISABLED_JOBS |
| `agents/quality_gate.py` | QG review (0–100), article types | Přizpůsobit typy článků |
| `agents/learning_agent.py` | Extrakce + injektování learnings | ❌ Žádné |
| `agents/seo_agent.py` | Keyword injection, internal links | Pillar slugs |
| `agents/analytics_agent.py` | GSC fetch, A/B testy, title feedback | `GSC_SITE_URL` env var |
| `agents/monetization_agent.py` | Affiliate audit + coverage check | Affiliate programy |
| `agents/freshness_agent.py` | Changelog monitoring + DB save | Nástroje ke sledování |
| `agents/newsletter_agent.py` | Weekly digest + Resend odesílání | Šablona newsletteru |
| `main.py` (Admin endpointy) | `/admin/*`, `/trigger/*`, `/health` | Nové endpointy dle potřeby |

### Agenti — reusable s menšími úpravami (~30 min per agent)

| Agent | % reuse | Co přizpůsobit |
|---|---|---|
| `ceo_agent.py` | 90 % | `send_daily_report()` formát zprávy |
| `research_agent.py` | 80 % | `BASE_SEEDS`, `PILLAR_SLUGS`, téma filtry |
| `content_agent.py` | 70 % | `_SYSTEM_CZ` prompt, šablona článku, ceník |
| `editor_agent.py` | 85 % | `_TYPE_MIN_WORDS` hodnoty |

---

## 2. Co je potřeba přizpůsobit pro nový projekt

### A) Obsah a tonalita — povinné
```python
# agents/content_agent.py

_SYSTEM_CZ = """
Jsi hlavní redaktor [NAZEV_WEBU] — [POPIS_WEBU].
MISE: [CO_CHCEME_NAPSAT_LEPE_NEZ_KONKURENCE]
...
"""
```
Změnit: název webu, mise, zakázané fráze pro dané odvětví, požadované sekce.

### B) Research — zdroje a filtrování
```python
# agents/research_agent.py

BASE_SEEDS = [
    # Nahradit za seed klíčová slova pro vaše odvětví
    "AI nástroje",
    "chatgpt recenze",
    ...
]

PILLAR_SLUGS: frozenset[str] = frozenset({
    # Slug pilířových článků který nikdy nepřepisovat
    "jak-zacit-s-chatgpt",
    ...
})
```

### C) Quality Gate — typy článků
```python
# agents/quality_gate.py

_TYPE_REQUIRED_SECTIONS: dict[str, dict] = {
    "recenze": {
        "required": [...],   # Povinné sekce pro vaše recenze
        "min_words": 1800,
    },
    # Přidat nebo odebrat typy dle potřeby
}
```

### D) SEO — pillar linking
```python
# agents/seo_agent.py

_PILLAR_ARTICLES = [
    {"slug": "vas-pillar-1", "title": "...", "keywords": [...]},
    # Vaše pilířové články pro interní prolinkování
]
```

### E) Affiliate programy
```python
# agents/monetization_agent.py nebo lib/affiliate-links.ts (web)

AFFILIATE_PROGRAMS = {
    "tool_name": {
        "url": "https://...",
        "commission": "30% recurring",
        "active": True,
    }
}
```

### F) Config — env vars
```bash
# Povinně změnit:
GITHUB_REPO=VasUzivatel/vas-web-repo
SITE_URL_CZ=https://vas-web.cz
TELEGRAM_CHAT_ID=VaseChatId

# Doplnit vlastní klíče:
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
GITHUB_TOKEN=...
TELEGRAM_BOT_TOKEN=...
```

---

## 3. Checklist pro spuštění nového projektu od nuly

### Fáze 1 — Infrastruktura (den 1, ~4 hodiny)

- [ ] **GitHub** — fork `{{PROJECT}}-agent` repozitáře
- [ ] **Supabase** — vytvořit nový projekt, spustit SQL migrace:
  ```sql
  -- Tabulky: articles, agent_decisions, article_learnings,
  --          error_log, affiliate_clicks, newsletter_subscribers
  -- (SQL skripty v /migrations/ nebo main.py _run_startup_migrations())
  ```
- [ ] **Railway** — nový projekt, připojit GitHub repo, nastavit env vars
- [ ] **Telegram** — `@BotFather` → nový bot → `TELEGRAM_BOT_TOKEN` + zjistit `TELEGRAM_CHAT_ID`
- [ ] **Vercel** — fork `{{PROJECT}}-web`, připojit GitHub, nastavit `NEXT_PUBLIC_RAILWAY_URL`
- [ ] **Anthropic** — API klíč (minimálně Tier-1 pro začátek)
- [ ] **Pexels + Unsplash** — free API klíče pro cover images

### Fáze 2 — Přizpůsobení obsahu (den 1–2, ~6 hodin)

- [ ] Upravit `_SYSTEM_CZ` v `content_agent.py` (mise, tonalita, zakázané fráze)
- [ ] Definovat `BASE_SEEDS` a `PILLAR_SLUGS` v `research_agent.py`
- [ ] Nastavit `_TYPE_REQUIRED_SECTIONS` v `quality_gate.py`
- [ ] Připravit `_PILLAR_ARTICLES` v `seo_agent.py`
- [ ] Nastavit `DISABLED_JOBS` v `scheduler/jobs.py` (vypnout vše kromě noční čtveřice)

### Fáze 3 — Testování (den 2–3, ~4 hodiny)

- [ ] `POST /admin/full-cycle?count=1` — otestovat celý A-Z pipeline
- [ ] Zkontrolovat Railway logy — žádné neočekávané chyby
- [ ] Ověřit MDX na GitHubu (`content/cz/`)
- [ ] Ověřit Vercel deploy — web zobrazuje článek
- [ ] `POST /trigger/daily_report` — ověřit Telegram zprávu
- [ ] `POST /admin/full-cycle?count=2` — otestovat intra-batch dedup

### Fáze 4 — Noční cyklus (den 3, ~1 hodina)

- [ ] Ověřit časy jobů v `scheduler/jobs.py` (timezone Europe/Prague)
- [ ] Zkontrolovat noční cyklus ráno (byl report v 6:00?)
- [ ] Aktivovat breaking_news job pokud potřeba

### Fáze 5 — Monetizace a newsletter (týden 2)

- [ ] Doplnit affiliate programy pro dané odvětví
- [ ] Nakonfigurovat Resend doménu + DKIM/SPF
- [ ] Otestovat newsletter odeslání
- [ ] Aktivovat `affiliate_coverage_audit` job

---

## 4. Časté chyby a jak se jim vyhnout

### Z project_learnings — problémy které nastaly v praxi

**🔴 Kritické (zastavily pipeline)**

| Problém | Příčina | Řešení |
|---|---|---|
| Pipeline tichý timeout | `asyncio.to_thread()` bez `wait_for()` — SIGALRM nefunguje v thread pool | Vždy `asyncio.wait_for(asyncio.to_thread(...), timeout=N)` |
| Stuck drafts po Railway restartu | Git push mid-pipeline = restart = kill BackgroundTask | Po každém git push čekat 90s, pak triggerovat |
| DB constraint 500 | `fact_check_failed` status není v `articles_status_check` | Povolené statusy: draft/approved/published/rejected/archived ONLY |
| MDX truncation | `max_tokens` příliš nízký | Psaní článků: `max_tokens=16000` bez výjimky |
| Timeout stacking | Outer timeout < součet inner timeoutů | Outer musí být > součtu: 2250s > 2130s |

**🟡 Důležité (způsobily nesprávné výsledky)**

| Problém | Příčina | Řešení |
|---|---|---|
| Duplicitní články | Jaccard threshold 75% — "Průvodce" vs "návod" = 70%, pod prahem | Threshold ≤ 0.50 pro dedup |
| SEO N/A v reportu | `seo_score` nebyl persistován do DB při publish | `_auto_publish_with_report` musí UPDATE seo_score |
| "3 témata selhala" falešný alarm | Více full-cycle triggerů = víc topic_proposal řádků | Dedup při počítání: unikátní tituly, ne počet řádků |
| Breaking news alerty přes noc | `send_alert()` v breaking_news wrapperu | Log pouze, Telegram pouze přes ranní report |
| Inflated failed count | Multiple triggers v jeden den | Count unique topic titles, ne všechny DB řádky |

**🟢 Menší (zhoršily UX)**

| Problém | Příčina | Řešení |
|---|---|---|
| httpx DELETE bez body | `httpx.delete()` neakceptuje body kwargs | `httpx.Client().request("DELETE", ...)` s `content=` |
| Supabase push_subscriptions chyba | Free plan nepodporuje `/pg/query` | Vytvořit tabulku ručně v Supabase SQL Editoru |
| pytrends/DDG infinite hang | Sync blocking I/O v thread pool, SIGALRM neplatí | `asyncio.wait_for(..., timeout=300)` pro research |

### Obecné pasti při práci s tímto stackem

```python
# ❌ ŠPATNĚ — blokuje event loop
time.sleep(60)
result = supabase.table("articles").select("*").execute()  # v async funkci přímo

# ✅ SPRÁVNĚ
await asyncio.sleep(60)
result = await asyncio.to_thread(supabase.table("articles").select("*").execute)

# ❌ ŠPATNĚ — APScheduler wrapper musí být async
def _my_job():
    asyncio.run(my_async_function())  # vytváří nový event loop = deadlock

# ✅ SPRÁVNĚ
async def _my_job():
    await my_async_function()

# ❌ ŠPATNĚ — Railway restart zabije state
_published_today = []  # in-memory list

# ✅ SPRÁVNĚ — vždy DB jako source of truth
db.table("agent_decisions").insert({"decision_type": "processed", ...})

# ❌ ŠPATNĚ — hrozí MDX truncation
response = call_claude(..., max_tokens=4000)

# ✅ SPRÁVNĚ — pro 3000-slovné články
response = call_claude(..., max_tokens=16000)
```

---

## 5. Odhad času implementace pro nový projekt

### Varianta A: Copy-paste s minimálními úpravami
*Stejné odvětví (tech recenze), jiná doména a jazyk*

| Fáze | Čas |
|---|---|
| Infrastruktura (Supabase, Railway, Vercel, Telegram) | 4 h |
| Přizpůsobení promptů a research seeds | 3 h |
| První testovací cyklus + ladění | 4 h |
| Newsletter a affiliate setup | 3 h |
| **Celkem** | **~14 hodin (2 dny)** |

### Varianta B: Jiné odvětví (e-commerce, finanční poradenství, ...)
*Jiné typy článků, jiné affiliate programy, jiný tón*

| Fáze | Čas |
|---|---|
| Infrastruktura | 4 h |
| Redesign quality gate typů a šablony | 6 h |
| Přizpůsobení content agent prompts | 4 h |
| Research agent — nové zdroje a seeds | 3 h |
| Affiliate programy a monetizace | 3 h |
| Testování a ladění pipeline | 6 h |
| **Celkem** | **~26 hodin (3–4 dny)** |

### Varianta C: Nová jazyková mutace (EN, DE, PL...)
*Stejné odvětví, jiný jazyk*

| Fáze | Čas |
|---|---|
| `_SYSTEM_EN` prompt v content_agent | 2 h |
| Research seeds pro daný jazyk/trh | 2 h |
| Pillar slugs a locale routing | 2 h |
| Testování | 3 h |
| **Celkem** | **~9 hodin (1 den)** |

---

## 6. Doporučené pořadí aktivace jobů

Pro nový projekt aktivuj joby postupně — ne vše najednou.

```
Týden 1:   propose_topics, write_drafts, publish_approved, daily_report
           (noční čtveřice — základní pipeline)

Týden 2:   traffic_alerts, changelog_monitor, gsc_fetch
           (monitoring a data)

Týden 3:   affiliate_coverage_audit, affiliate_report, weekly_newsletter
           (monetizace a email)

Měsíc 2:   breaking_news (až máš ověřenou kvalitu a limity)
           ab_evaluate, freshness_check (maintenance)

Měsíc 3+:  price_monitor, benchmark, ai_index_update
           (datové projekty — vyžadují více scraperů)
```

---

## 7. Minimální life-cycle nového projektu

```
Den 1:   Railway up + DB migrace + env vars
Den 2:   První manuální full-cycle test (1 článek)
Den 3:   První automatický noční cyklus
Týden 1: Ladění kvality článků (prompt tuning)
Týden 2: Newsletter a affiliate
Měsíc 1: Breaking news + monitoring
Měsíc 2: Data agenti (GSC feedback loop, A/B testy)
Měsíc 3: Optimalizace, nové jazyky, nové formáty
```

**Signály že systém funguje správně:**
- Telegram report přichází každý pracovní den v 6:00
- Každý report obsahuje SEO score (ne "N/A")
- Počet "selhalo" = 0 nebo 1 (ne víc než počet témat)
- GitHub commits přicházejí mezi 02:30–04:00
- error_log tabulka je prázdná nebo má jen drobné warnings

---

## 8. Reuse tabulka — aktualizace pro Fáze 12–17

### 90 % reuse (beze změn nebo jen env var)

| Komponenta | Soubor | Co mění nový projekt |
|---|---|---|
| Intelligent Learning Extractor | `agents/intelligent_learning_agent.py` | ❌ nic — rapidfuzz + Haiku judge jsou doména-agnostic |
| Vercel Webhook listener | `main.py` endpoint `/webhooks/vercel` | Jen `VERCEL_WEBHOOK_SECRET` env var |
| article_content_history | `tools/content_history.py` + SQL | ❌ nic |
| ToolLink komponenta | `components/article/ToolLink.tsx` (web) | Jen mapování {{AFFILIATE_TYPE}} → URL slot |
| Quality Reviewer (kostra) | `agents/quality_reviewer.py` | 6 dimenzí zůstává; adjustovat vahování a thresholdy |
| Weekly Quality Report | `agents/weekly_quality_report.py` | ❌ nic — čte z `articles.quality_*` |
| Semantic duplicity audit | `main.py` endpoint `/admin/semantic-duplicity-audit` | ❌ nic |
| Cover image determinism | `tools/pexels_tool.py`, `tools/unsplash_tool.py` | Blacklist IDs specifické pro doménu |
| Duplicate archive flow | `main.py` endpoint `/admin/duplicate-archive` | ❌ nic |
| Expand article | `agents/content_agent.expand_article()` | Jen target_words per doménu |
| Breaking followup job | `scheduler/jobs.py` — `breaking_news_followup` | Čas + threshold |

### 60 % reuse — prompty a taxonomie (s placeholders)

| Komponenta | Co upravit | Jak |
|---|---|---|
| `_SYSTEM_CZ` (content_agent) | Mise, tonalita, STYL PSANÍ | 12 ZAKÁZANÝCH FRÁZÍ a 7 POVINNÝCH PRVKŮ zůstává jako struktura; obsah specifický pro {{TOPIC}} |
| Quality Reviewer prompt | 6 dimenzí | Hook/Originalita/Autenticita/Příklady/Hodnota/{{LANGUAGE}} — dimenze jsou univerzální |
| Intelligent Extractor prompt | Kategorie learnings | Rozšířit enum o doménově-specifické kategorie |
| Article types (quality_gate) | `recenze`, `srovnani`, `navod`, `profese`, `pilir` | Nahradit za typy v {{DOMAIN}} (např. pro e-commerce: `review`, `comparison`, `buyer-guide`) |
| Affiliate programy | `lib/affiliate-links.ts` + `agents/monetization_agent.py` | Přidat {{AFFILIATE_TYPE}} programy (recurring vs one-time, commission rates) |
| Pillar slugs | `research_agent.PILLAR_SLUGS`, `seo_agent._PILLAR_ARTICLES` | Definovat 5–10 pillar článků pro doménu |
| Blacklist IDs | `pexels_tool.PEXELS_BLACKLIST_IDS` | Doména-specifické dominantní photoshoots (objeví se postupně) |

### 0 % reuse — doména-specifické

- Brand (logo, barvy, domain name)
- Content (všechny MDX články)
- Partnerships (sponzorské smlouvy — fáze 6+)
- Language-specific mutace

---

## 9. Nové learnings z Fází 12–17 (ponaučení pro nový projekt)

1. **DB/GitHub sync drift je reálné riziko** — při jakémkoliv updatu MDX v GitHubu vždy UPDATE `articles.content` v DB hned po commitu. Bez toho `reprocess` / `add_tool_links` / `cover_backfill` pracují se zastaralou verzí.

2. **Scaled tolerance pro prose compression** — breaking news (< 500w) mají přirozeně větší relativní delta než 2000w články. Single tolerance threshold (1 %) strhne nespravedlivě ty krátké. Scaled: 10 % / 2 % / 1 %.

3. **Pexels pool pro niche queries je limitovaný** — 10–20 photos dominuje AI/tech queries. Blacklist pomůže, ale nikdy nevyřeší úplně. Dlouhodobě: per_page=80 + anti-cluster filtrování.

4. **Semantic duplicity ≠ lexical duplicity** — Jaccard 0.50 chytí ~70% synonym duplikátů. Zbylé 30% odhalí jen LLM-based pairwise check (drahé, spouštět měsíčně).

5. **Quality Reviewer s přísnými prahy = negativní retry loop** — nastav APPROVE práh (48/60) tak, aby 70%+ article šlo hladce. Příliš přísný = vše retry = cost + delays + Editor "nudging" začne článek kazit.

6. **Breaking news < 250w nemá prostor pro CTA** — separátní flow: 1–2 inline ToolLinky bez CTA box. Nebo čekat na `breaking_news_followup` expand na 1800+ slov, pak přidat CTA.

7. **Webhook signatures musí být validate-early** — HMAC check v prvním řádku handleru, před jakýmkoliv parse payloadu. Vercel/Resend/Telegram webhooks všechny používají HMAC.

8. **rapidfuzz + LLM judge je pareto-optimální** — rapidfuzz odfiltruje 90% kandidátů za 0.1s, Haiku judge rozhodne zbylých 10% za $0.01. Kombinace je 10× levnější než naivní "LLM na všech párech".

---

## 10. Odhad času pro nový projekt — aktualizace

### Varianta D: Nový projekt s **plným reuse Fází 12–17**
*Využije vše co tento systém umí: intelligent learning, quality reviewer, duplicity audit, ToolLink, webhook observability*

| Fáze | Čas |
|---|---|
| Infrastruktura (Railway + Supabase + Vercel + GitHub + Telegram) | 4 h |
| Přizpůsobení promptů + STYL PSANÍ pro {{DOMAIN}} | 4 h |
| Quality Reviewer dimenze + thresholdy per domain | 2 h |
| Article types taxonomie v quality_gate | 2 h |
| Affiliate programy + ToolLink mapping | 3 h |
| Pillar slugs + research seeds + blacklist IDs | 2 h |
| SQL migrace všech tabulek (včetně article_content_history, learning_extractor_log) | 1 h |
| Env vars (včetně VERCEL_WEBHOOK_SECRET) | 1 h |
| První full-cycle test + ladění | 4 h |
| **Celkem** | **~23 hodin (3 dny)** |

Rozdíl vs Varianta A (14h): +9h pro Quality Reviewer tuning, article types, a ToolLink mapping. Rozdíl bohatě vrácený v kvalitě článků od dne 1.

---

## 11. Launch signals — rozšíření

Kromě signálů v sekci 7 přidat monitoring z Fází 12–17:

**Denní:**
- Quality Reviewer score distribuce: ≥ 70% článků APPROVE, ≤ 10% REJECT
- `learning_extractor_log` má ≥ 1 accepted row za den (pokud 0, extractor neběží nebo all-duplicate)
- Vercel webhook signal za každý deploy (fail i success)

**Týdenní (Pá 11:30):**
- Weekly Quality Report dorazí s WoW delta ne < -5 bodů
- Retry success rate ≥ 40% (REVISE → APPROVE po retry)

**Měsíční:**
- Semantic duplicity audit: ≤ 2 high-similarity pairs. Víc = topic space je saturovaný, research agent recykluje.
