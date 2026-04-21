# ARCHITECTURE.md — Technická architektura {{PROJECT}}-agent
*Stav: 2026-04-19 | Systém: {{PROJECT_DOMAIN}} (po Fázích 12–17)*

---

## 1. Tech Stack — přehled

| Vrstva | Technologie | Účel |
|---|---|---|
| **Agent runtime** | Python 3.12 + FastAPI + uvicorn | REST API + background tasks |
| **Scheduler** | APScheduler (AsyncIOScheduler) | Cron joby (noční cyklus, weekly joby) |
| **AI modely** | Anthropic Claude Sonnet 4.6 + Haiku 4.5 | Generování obsahu, recenze, SEO |
| **Databáze** | Supabase (PostgreSQL) | Články, decisions, learnings, errors |
| **Web hosting** | Vercel (Next.js 15.3) | Produkční web, auto-deploy z GitHub |
| **Agent hosting** | Railway | Trvalý Python proces, env vars, logy |
| **CMS / obsah** | GitHub API (MDX soubory) | Commitování článků do `content/cz/*.mdx` |
| **Notifikace** | Telegram Bot API (python-telegram-bot v21) | Ranní report, kritické chyby |
| **Email** | Resend API | Newsletter (`newsletter@{{PROJECT_DOMAIN}}`) |
| **Foto** | Pexels API + Unsplash API | Cover images pro články |
| **SEO data** | Google Search Console API | CTR, impressions, klíčová slova |
| **Monitoring** | Loguru → Railway logy + Supabase error_log | Strukturované logy, error tracking |

### Modely a kde se používají

| Agent | Model | Důvod |
|---|---|---|
| `content_agent` — psaní článku | `claude-sonnet-4-20250514` | Kvalita > rychlost, 16 000 tokenů |
| `editor_agent` — přepis sekcí | `claude-sonnet-4-20250514` | Kreativní přepis vyžaduje Sonnet |
| `quality_gate` — recenze článku | `claude-sonnet-4-20250514` | Strukturovaný output, reasoning |
| `research_agent` — refinement | `claude-haiku-4-5-20251001` | Rychlé Claude volání pro filtraci |
| `content_agent` — fact check | `claude-haiku-4-5-20251001` | Rychlé ověření faktů |

---

## 2. Repozitáře a infrastruktura

```
github.com/Poizur/{{PROJECT}}-agent   ← Python agent (tento repo)
github.com/Poizur/{{PROJECT}}-web     ← Next.js web
  └── content/cz/*.mdx           ← MDX články (auto-deploy → Vercel)

Railway: https://web-production-fc03c.up.railway.app
Vercel:  {{PROJECT_URL}}
Supabase: projekt "{{PROJECT}}"
```

**Kritické:** Credentials jsou POUZE na Railway env vars. Lokální `.env` neexistuje.
Pro přístup k DB z lokálu vždy přes Railway endpoints.

---

## 3. Struktura agentů

### Orchestrátor
```
agents/ceo_agent.py
```
Centrální orchestrátor. Řídí celý content pipeline:
- `propose_and_approve_topics()` — spustí research, auto-schválí témata
- `write_approved_drafts()` — paralelní psaní (semaphore=3) + pipeline
- `_write_single_topic()` — psaní jednoho článku + editorial pipeline
- `_run_editorial_pipeline()` — 5-fázový pipeline (QG → Editor → SEO → Learning)
- `_auto_publish_with_report()` — batch GitHub commit + DB update
- `send_daily_report()` — ranní Telegram zpráva (06:00)

### Agenti — obsah
| Agent | Soubor | Role |
|---|---|---|
| **Research** | `research_agent.py` | Navrhuje témata ze 6+ zdrojů, deduplikuje |
| **Content** | `content_agent.py` | Píše MDX článek (3000+ slov, šablona) |
| **Editor** | `editor_agent.py` | Přepisuje slabé sekce po Quality Gate |
| **Quality Gate** | `quality_gate.py` | Hodnotí článek 0–100, detekuje typ |
| **SEO** | `seo_agent.py` | Keyword v H1/H2, 3–5 interních odkazů |
| **Learning** | `learning_agent.py` | Extrahuje poučení z pipeline do DB |
| **Freshness** | `freshness_agent.py` | Sleduje changelogy AI nástrojů |
| **Newsletter** | `newsletter_agent.py` | Sestavuje a odesílá týdenní email digest |

### Agenti — data a analytics
| Agent | Soubor | Role |
|---|---|---|
| **Analytics** | `analytics_agent.py` | GSC data fetch, A/B testy, title feedback |
| **Monetization** | `monetization_agent.py` | Affiliate audit, coverage check |
| **Price Monitor** | `price_monitor_agent.py` | Týdenní ceny AI nástrojů |
| **Benchmark** | `benchmark_agent.py` | Měsíční AI benchmark |
| **AI Index** | `ai_index_agent.py` | AI Adoption Index update |
| **CSO** | `cso_agent.py` | Strategie (týdenní/měsíční) — neaktivní |
| **Annual Report** | `annual_report_agent.py` | Výroční report (1. 1.) |

### Tools (sdílené utility)
```
tools/
  anthropic_client.py   — call_claude() wrapper (retry, rate limit)
  telegram_tool.py      — send_alert(), send_message()
  github_tool.py        — commit_mdx_article(), commit_mdx_articles_batch(), delete_mdx_article()
  error_log.py          — log_error(), log_error_async(), get_weekly_error_stats()
  gsc_tool.py           — Google Search Console API
  pexels_tool.py        — Pexels cover images
  unsplash_tool.py      — Unsplash fallback images
  search_tool.py        — DuckDuckGo web search, exchange rates
  image_generator.py    — Hero image generování
  typeform_tool.py      — Survey data
  wordpress_api.py      — Legacy WP API (nepoužívá se na {{PROJECT_DOMAIN}})
```

---

## 4. Content Pipeline — flow od research po publikaci

### Noční automatický cyklus (Po–Pá)

```
02:00  propose_topics
         │
         ├── research_agent.propose_topics(count=3)
         │     ├── Zdroje: Product Hunt, HN, Reddit, Google Trends CZ,
         │     │           konkurent gap analysis, longtail opportunities
         │     ├── Gate 1: pillar slug protection (PILLAR_SLUGS frozenset)
         │     ├── Gate 2: Jaccard dedup vs published (threshold=0.50)
         │     ├── Gate 3: tool existence check (Product Hunt / HN zdroje)
         │     └── Claude Haiku: refinement + překlad do češtiny
         │
         ├── Intra-batch dedup (Jaccard ≥ 0.50)
         ├── Auto-approve všechna témata
         └── Uloží do agent_decisions (decision_type=topic_proposal)

02:30  write_drafts
         │
         ├── Načte topic_proposals z agent_decisions
         ├── asyncio.gather(*tasks) — paralelní psaní (semaphore=3)
         │
         └── _write_single_topic() per article:
               │
               ├── 1. content_agent.write_article()          timeout=600s
               │     ├── _build_competitive_context()
               │     ├── get_recent_learnings() → prompt
               │     ├── Claude Sonnet, max_tokens=16000
               │     ├── _detect_mdx_truncation() validace
               │     ├── _inject_affiliate_links()
               │     └── Uloží draft do DB (articles tabulka)
               │
               ├── 2. Word count check: pokud < MIN_WORDS → retry s instrukcí
               │
               └── 3. _run_editorial_pipeline()              timeout=2250s
                     │
                     ├── Fáze 2: Quality Gate review          timeout=120s
                     │     ├── detect_article_type() → recenze/srovnani/navod/profese/pilir
                     │     ├── review_article() → score 0-100
                     │     ├── score < 70 AND attempt < 2 → QG rewrite   timeout=900s
                     │     └── score == HARD_FAIL → _pipeline_rejected=True
                     │
                     ├── Fáze 3: Editor Agent                timeout=810s
                     │     ├── edit_article(article, missing_sections)
                     │     ├── Claude Sonnet, timeout=720s
                     │     └── Finální strukturální check      timeout=120s
                     │
                     ├── Fáze 4: SEO Agent                   timeout=90s
                     │     ├── _ensure_keyword_in_title/h2/description()
                     │     ├── _inject_internal_links() → 3-5 pillar links
                     │     └── Nastaví article["seo_score"]
                     │
                     └── Fáze 5: Learning Agent              timeout=90s
                           └── save_learnings() → article_learnings tabulka

         └── _auto_publish_with_report()
               ├── Slug dedup vs published (přeskočí duplicity)
               ├── commit_mdx_articles_batch() → 1 GitHub commit
               ├── DB update: status=published, github_url, published_at,
               │             seo_score, word_count
               └── Logy — žádný Telegram alert (report v 06:00)

04:00  publish_approved  (safety net — commitne zbývající approved drafty)

06:00  send_daily_report
         ├── Dotaz: articles WHERE status=published AND published_at>=today
         ├── Dotaz: agent_decisions topic_proposal (dedup by title)
         ├── Dotaz: agent_decisions breaking_news_processed
         ├── Dotaz: agent_decisions changelog_event_today
         └── Telegram: ✅ X článků | 📝 título+SEO | 🔴 Breaking | 📡 Changelog
```

### Timeout tabulka

| Krok | Timeout |
|---|---|
| Research (pytrends/DDG thread) | 300s |
| Write article | 600s |
| QG review | 120s |
| QG rewrite | 900s |
| Editor Agent (outer) | 810s |
| Editor Agent (Claude call) | 720s |
| Final review | 120s |
| SEO Agent | 90s |
| Learning Agent | 90s |
| **Pipeline outer (součet = 2130s)** | **2250s** |

⚠️ **Invariant:** outer timeout MUSÍ být > součtu inner timeoutů. Pokud přidáš krok, zvyš outer.

---

## 5. Scheduler joby

### Aktivní joby (21)

| Job ID | Kdy | Funkce |
|---|---|---|
| `propose_topics` | Po–Pá 02:00 | Research → auto-approve 3 témata |
| `write_drafts` | Po–Pá 02:30 | Pipeline → auto-publish |
| `publish_approved` | Po–Pá 04:00 | Safety net — zbývající drafty |
| `daily_report` | Po–Pá 06:00 | Jediná denní Telegram zpráva |
| `breaking_news` | Po–Pá 8:15,12:15,16:15,20:15 | Breaking AI news, max 2/den |
| `traffic_alerts` | Po–Pá 09:00 | GSC pokles >30% W/W |
| `changelog_monitor` | Po–Pá 09:05 | Changelogy AI nástrojů → DB |
| `gsc_fetch` | Po 07:30 | GSC data + topic feedback |
| `title_feedback` | Po 08:30 | Low-CTR title proposals |
| `price_monitor` | Po 08:00 | Týdenní ceny AI nástrojů |
| `affiliate_check` | St 14:00 | Platnost affiliate odkazů |
| `affiliate_coverage_audit` | Pá 10:00 | Články bez affiliate odkazu |
| `affiliate_report` | Pá 10:30 | Top-5 kliknutí za týden |
| `weekly_newsletter` | Pá 11:00 | AI digest odběratelům |
| `gsc_fetch_thu` | Čt 10:30 | Mid-week GSC check |
| `ab_evaluate` | 1. v měsíci 08:00 | A/B title testy |
| `ai_index_update` | 1. v měsíci 09:30 | AI Adoption Index |
| `affiliate_audit` | 1. v měsíci 10:00 | Měsíční affiliate audit |
| `freshness_check` | 1. v měsíci 10:30 | Zastaralé recenze |
| `benchmark` | 15. v měsíci 10:00 | AI benchmark v češtině |
| `annual_report` | 1. 1. 07:00 | Výroční report |

### Deaktivované joby (`DISABLED_JOBS`)

| Job ID | Proč |
|---|---|
| `send_drafts` | Nahrazen auto-publish pipeline |
| `seo_optimize` | Nahrazen inline SEO ve Fázi 4 |
| `weekly_report` | Nahrazen daily_report |
| `weekly_strategy` | CSO agent neaktivní |
| `monthly_strategy` | CSO agent neaktivní |
| `survey_article` | Nedostatek Typeform dat |

---

## 6. Databázové tabulky

### `articles`
```sql
id           UUID PK
title        TEXT
slug         TEXT UNIQUE
locale       TEXT          -- 'cz' | 'en'
keyword      TEXT
category     TEXT
content      TEXT          -- MDX obsah
word_count   INTEGER
seo_score    INTEGER       -- 0-100, nastavuje seo_agent
cover_image  TEXT
description  TEXT
status       TEXT          -- 'draft' | 'approved' | 'published' | 'rejected' | 'archived'
github_url   TEXT          -- commit URL po publikaci
published_at DATE
created_at   TIMESTAMPTZ
```

**Povolené statusy** (articles_status_check constraint):
`draft`, `approved`, `published`, `rejected`, `archived`
⚠️ `fact_check_failed` NENÍ povolen — způsobí 500.

### `agent_decisions`
```sql
id            UUID PK
agent_name    TEXT   -- 'research' | 'news' | 'freshness' | 'reprocess'
decision_type TEXT   -- 'topic_proposal' | 'breaking_news_processed'
                     -- 'changelog_event_today' | 'reprocess_progress'
approved      BOOLEAN
payload       JSONB
created_at    TIMESTAMPTZ
```

Hlavní event store — přežívá Railway restarty. Používá se pro:
- Topic proposals (research agent)
- Breaking news dedup
- Changelog events (freshness agent → daily report)
- Reprocess progress checkpoints

### `article_learnings` (project_learnings)
```sql
id          UUID PK
article_id  UUID FK → articles
locale      TEXT
issue_type  TEXT
description TEXT
suggestion  TEXT
applied     BOOLEAN
created_at  TIMESTAMPTZ
```

Extrahovaná poučení z pipeline — zpětně se injektují do prompt u dalšího psaní.

### `affiliate_clicks`
```sql
id          UUID PK
tool        TEXT
source_url  TEXT
clicked_at  TIMESTAMPTZ
ip_hash     TEXT
```

### `newsletter_subscribers`
```sql
id          UUID PK
email       TEXT UNIQUE
confirmed   BOOLEAN
created_at  TIMESTAMPTZ
```

### `push_subscriptions`
```sql
id          UUID PK
endpoint    TEXT UNIQUE
p256dh      TEXT
auth        TEXT
created_at  TIMESTAMPTZ
last_seen   TIMESTAMPTZ
```
⚠️ Supabase free plan nepodporuje `/pg/query` — tabulku nutno vytvořit ručně v SQL Editoru.

### `ab_tests`
```sql
id          UUID PK
article_id  UUID FK
title_a     TEXT
title_b     TEXT
winner      TEXT
clicks_a    INTEGER
clicks_b    INTEGER
evaluated_at DATE
```

### `affiliate_links`
```sql
id          UUID PK
tool        TEXT
url         TEXT
program     TEXT
commission  TEXT
active      BOOLEAN
```

### `survey_responses`
```sql
id          UUID PK
form_id     TEXT
response_id TEXT
answers     JSONB
submitted_at TIMESTAMPTZ
```

### `error_log`
```sql
id              UUID PK
agent_name      TEXT
error_type      TEXT   -- ERR_API_CALL | ERR_DB_SAVE | ERR_GITHUB | ERR_TELEGRAM | ERR_SCHEDULER
message         TEXT
context         JSONB
article_id      UUID nullable
resolved        BOOLEAN
consecutive_count INTEGER
created_at      TIMESTAMPTZ
```

---

## 7. Konfigurační proměnné (env vars)

### Povinné (Railway)
```bash
ANTHROPIC_API_KEY        # Claude API klíč
SUPABASE_URL             # https://[project].supabase.co
SUPABASE_KEY             # service role key (ne anon key!)
GITHUB_TOKEN             # PAT s repo write scope
GITHUB_REPO              # "Poizur/{{PROJECT}}-web"
TELEGRAM_BOT_TOKEN       # Bot token od @BotFather
TELEGRAM_CHAT_ID         # Chat ID vlastníka
```

### Volitelné ale doporučené
```bash
RESEND_API_KEY           # Newsletter odesílání
RESEND_FROM              # "newsletter@{{PROJECT_DOMAIN}}"
PEXELS_API_KEY           # Cover images
UNSPLASH_ACCESS_KEY      # Cover images fallback
GOOGLE_SERVICE_ACCOUNT_JSON  # GSC analytics (JSON jako string)
ADMIN_SECRET             # Chrání /push/send endpoint
VAPID_PUBLIC_KEY         # Web Push notifikace
VAPID_PRIVATE_KEY        # Web Push notifikace
SITE_URL_CZ              # "{{PROJECT_URL}}"
ENVIRONMENT              # "production" | "development"
PORT                     # Default 8080
```

### Vercel env vars (Next.js web)
```bash
NEXT_PUBLIC_RAILWAY_URL      # Railway agent URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY # Pro PushNotifButton komponentu
```

---

## 8. API endpoints (Railway)

### Content pipeline
```
POST /admin/full-cycle?count=2         Spustí kompletní A-Z cyklus
POST /trigger/{job_id}                 Manuální spuštění scheduleru
POST /debug/publish-drafts             Publikuje všechny draft články
POST /admin/reprocess-all-published    Editorial pipeline přes všechny články
```

### Správa článků
```
GET  /debug/articles                   Seznam článků (bez content pole)
POST /admin/cleanup-day?date_str=DATE  Smaže DB + GitHub pro daný den
POST /admin/github-delete-slugs        Smaže konkrétní MDX soubory z GitHub
```

### Newsletter
```
POST /newsletter/subscribe             Přihlášení odběratele
GET  /admin/newsletter/subscribers     Seznam odběratelů
DELETE /admin/newsletter/subscribers/{email}
POST /admin/newsletter/send-test       Test email {"email":"..."}
```

### Affiliate
```
POST /affiliate/track                  Zaznamenat kliknutí
GET  /admin/affiliate/stats            Statistiky kliknutí
```

### Push notifikace
```
POST /push/subscribe                   Uložit Web Push subscription
POST /push/send                        Odeslat push (vyžaduje Authorization)
GET  /push/stats                       Počet odběratelů
```

### Diagnostika
```
GET  /health                           Status + seznam aktivních jobů
POST /admin/resend/diagnose            Resend API diagnostika
```

---

## 9. Klíčové architektonické rozhodnutí

### Proč MDX + GitHub místo DB pro obsah
Vercel deployuje přímo z GitHub repo → zero-latency obsah bez API volání při každém page load. MDX umožňuje JSX komponenty (SponsoredBadge, ToolCard) přímo v článku.

### Proč agent_decisions místo in-memory state
Railway BackgroundTasks umírají při restartu. Všechna rozhodnutí (approved topics, breaking news dedup, changelog events) musí přežít restart → Supabase jako event store.

### Proč asyncio.to_thread pro blocking I/O
Python asyncio event loop blokuje při sync I/O. Všechny volání do Supabase, GitHub API, pytrends, DuckDuckGo musí běžet v thread poolu přes `asyncio.to_thread()`. SIGALRM nefunguje v thread poolech — timeouty výhradně přes `asyncio.wait_for()`.

### Proč jeden GitHub commit pro celý batch
Každý commit spouští Vercel rebuild (~2–3 min). Batch commit = 1 rebuild bez ohledu na počet článků.

### Proč Jaccard similarity pro dedup (ne embedding)
Embeddingy by vyžadovaly OpenAI API call pro každé téma. Jaccard na tokenizovaných titulcích (bez stopwords a roků) je dostatečně přesný (threshold=0.50) a nulový API cost.

---

## 10. Fáze 12–17 — rozšíření (2026-04-17 až 19)

### Fáze 12 — Intelligent Learning Extractor
Rule-based extractor (`extract_and_save_learnings`) neumí najít nové typy problémů mimo předdefinovaný katalog. Nový `agents/intelligent_learning_agent.py`:

**Two-stage pipeline:**
1. **Stage 1 — Haiku kandidát:** prochází `error_log` + `articles` za posledních N hodin, extrahuje kandidát se strukturou `{title, category, context, prevention, worth_learning}`. Pokud `worth_learning=false`, drop.
2. **Stage 2a — rapidfuzz prefilter:** porovná kandidát vs všechny existující learnings. Pokud fuzz score ≥ 95 → auto-reject duplicate bez LLM volání.
3. **Stage 2b — Haiku judge:** shortlist top 20 fuzz matches → Haiku rozhodne "duplicate vs unique". Rozhodnutí + reason uloženy do `learning_extractor_log`.

**Scheduler job:** `intelligent_learning_extractor` denně 07:00 (po daily_report).

**Cost:** ~$0.02/run (Haiku cheap).

### Fáze 13 — Vercel Webhook observability
Do té doby nebyl signál o Vercel build failure. Nový endpoint `/webhooks/vercel`:

**Flow:**
```
Vercel → POST /webhooks/vercel {deployment.id, state, url, meta.githubCommitSha, ...}
  ├── HMAC validation (VERCEL_WEBHOOK_SECRET)
  ├── State=ERROR → log_error_async(agent='vercel_deployment', error_type='vercel_build_failed')
  ├── State=READY → log info event
  └── Always 200 (Vercel retries otherwise)
```

Error_log rows pak zachycené v `intelligent_learning_extractor` → learning o build failures.

### Fáze 14 — Content gap ops: expand + breaking followup
Analytics ukázaly, že **breaking news pod 250 slov** nemají prostor pro affiliate CTA a mají krátké time-on-page.

**`content_agent.expand_article(article_id, target_words)`:**
- Fetchne stávající MDX, identifikuje "podrozpracované sekce" přes Claude analýzu, napíše rozšíření.
- Zachová frontmatter + první N slov (no truncation risk).
- Snapshot do `article_content_history` před UPDATE.

**Scheduler job:** `breaking_news_followup` denně 03:00 — fetch breaking articles posledních 48h s `word_count < 500`, enqueue do expand queue, target 1800+ slov.

### Fáze 15 — ToolLink architektura + DB/GitHub sync
Předtím byly affiliate linky injektované jako inline markdown `[text](url)`, bez UI enhancement a bez možnosti tracking dashboard.

**Web repo — `components/article/ToolLink.tsx`:**
- RSC-safe MDX komponenta (server-rendered)
- Props: `tool, variant ("inline" | "cta-box"), children?`
- Renderuje `<a>` přes `trackingUrl(tool)` → `/track/affiliate/[tool]`
- CTA-box variant: bordered box s "Vyzkoušet → "

**Agent — `add_tool_links` flow:**
- Endpoint `/admin/articles/add-tool-links` aplikuje ToolLink injekci na existující články
- **Dual validation:**
  1. `validate_mdx_syntax` — syntactic kontrola před commitem
  2. `validate_tool_links_preservation` — word-count delta proti originálu s **scaled tolerance**:
     - Breaking news (< 500w): 10 % prose delta povoleno
     - Standard articles (< 1500w): 2 %
     - Long articles (≥ 1500w): 1 %

**`article_content_history` tabulka:**
```sql
id          UUID PK
article_id  UUID FK
slug        TEXT
content     TEXT         -- snapshot BEFORE update
source      TEXT         -- 'cover_backfill' | 'reprocess' | 'add_tool_links'
                         -- 'orphan_register' | 'ghost_cleanup' | 'pre_archive_ghost'
                         -- 'duplicate_delete→<keep_slug>'
created_at  TIMESTAMPTZ
```

**Drift fix post-mortem:** 5 flow updatovalo GitHub MDX bez zpětného update `articles.content` → drift. Opraveno ve všech 5: `_auto_publish_with_report`, `_batch_publish_articles`, `_publish_article`, `reprocess_all_published`, `add_tool_links`. Každý nyní UPDATE článku v DB hned po úspěšném commitu.

### Fáze 16 — Quality Reviewer + STYL PSANÍ + Weekly Quality Report
Editorial pipeline před Fází 16 měla "happy path bias" — Quality Gate hodnotil jen strukturu, ne "čtenářský zážitek". Nový Quality Reviewer je **soft editorial gate** před SEO.

**`agents/quality_reviewer.py`:**
- Claude Sonnet, 6 dimenzí × 0–10 = max 60 bodů:
  - Hook (úvodní odstavec)
  - Originalita (není recyklace generik)
  - Autenticita (osobní úhel, konkrétní data)
  - Příklady (konkrétní čísla, scénáře)
  - Hodnota (čtenář odchází s čím)
  - Čeština (bez strojových frází)

- **Verdikty:**
  - `APPROVE` score ≥ 48 → pokračuje do SEO
  - `REVISE` score 36–47 → 1 retry přes Editor Agent s feedback (max 1 retry)
  - `REJECT` score < 36 → status='rejected' + Telegram alert

**DB columns (articles):** `quality_score`, `quality_verdict`, `quality_feedback`, `quality_retries`.

**STYL PSANÍ prompt upgrade (`_SYSTEM_CZ`):**
- **12 ZAKÁZANÝCH FRÁZÍ** (kategoricky): "v dnešní době", "představujeme vám", "Svět AI se...", atd.
- **7 POVINNÝCH PRVKŮ:** hook, osobní úhel, konkrétní příklady, kontroverzní úhel, analogie, krátké věty (≤20 slov), aktivní hlas.
- Quality Reviewer aktivně detekuje porušení a strhává body v dimenzi Čeština + Originalita.

**Pipeline změna:**
```
Write → Fact-check → QG → Editor → Final check →
  ↓ NEW:
  Quality Reviewer → (REVISE → Editor retry) → SEO → Learning → Publish
```

**Weekly Quality Report (`agents/weekly_quality_report.py`):**
- Scheduler: Pá 11:30
- Metriky: distribuce APPROVE/REVISE/REJECT, průměr score, WoW delta, top/bottom 3, retry success rate, Reviewer-Reviewer consistency check

**Cost:** ~$0.01/článek × 20 článků/den × 30 dní ≈ $6/měsíc.

### Fáze 17 — Cover images + Semantic duplicity audit

**Fáze 17a — Cover image determinism:**
Předtím: `fetch_pexels_image` volal `/photos/random` — nevětřitelný pick, 6 ChatGPT článků sdílelo identický první photo.

**Oprava:**
- `/v1/search` endpoint (Pexels) + `/search/photos` (Unsplash) s `per_page=10`
- Deterministic pick: `idx = int(md5(slug).hexdigest(), 16) % len(photos)`
- Stejný slug → stejný photo (idempotent retry), různé slugs → různé photos

**Fáze 17b — Pexels blacklist:**
Po 17a stále 14/62 článků sdílelo "DeepSeek photoshoot" (IDs 30530406–30530414) protože Pexels pro AI/chat queries vrací tento cluster jako top. Přidán blacklist:

```python
# tools/pexels_tool.py
PEXELS_BLACKLIST_IDS: set[int] = {30530406, ..., 30530414}

photos = [p for p in response_photos if p.get("id") not in PEXELS_BLACKLIST_IDS]
if not photos:
    return None  # caller falls through to Unsplash
```

**Výsledek:** 14 DeepSeek → 1. Nové dominantní clustery (16587315 7×, 16027824 5×) odhaleny, což potvrdilo project_learning: Pexels má pro AI/tech queries limitovaný pool dominantních photoshoots.

**Admin endpoint `/admin/backfill-cover-images`:**
- Body: `{"slugs": [...]}` | `{"only_duplicates": true}` | `{}`
- Sekvenční, 10s pauza (Pexels 200req/h limit)
- Snapshot → new URL → GitHub commit → DB update
- Progress checkpoint do `agent_decisions` po každém článku (přežije Railway restart)

**Fáze 17c — Semantic duplicity audit:**
Dva články se stejným tématem, jen jinými slovy (Jaccard na titulech ~0.3–0.7), nejsou zachyceny standardním 0.50 thresholdem.

**Endpoint `/admin/semantic-duplicity-audit`:**
1. Fetch all published články
2. Pairwise Jaccard na title tokens (diacritic-stripped, stopword-filtered, roky odstraněné)
3. Pairs s `jac > min_title_jaccard` (default 0.3) → sort desc
4. Top-N (default 20) → Haiku judge s title + first 500 words
5. Haiku vrací `{similarity, same_topic, merge_recommendation, reason}`
6. Report-only — žádná auto-action

**Výsledek prvního auditu:** 62 článků → 15 pair candidates → 4 high-similarity (≥ 0.85), 3 z nich byly EN+CZ duplikáty z breaking news pipeline.

**Endpoint `/admin/duplicate-archive`:**
Bezpečné smazání: snapshot (source='duplicate_delete→{keep_slug}') → delete MDX (volitelně `skip_github=true` pro batch commit) → DB status='archived'.

**301/308 redirects:** Next.js `redirects()` v `next.config.js` s `permanent: true` zachovává SEO juice na keep slug.

### Nové endpointy (Fáze 12–17)

| Endpoint | Účel |
|---|---|
| `POST /admin/intelligent-learning/extract` | Fáze 12 — LLM learning extractor |
| `POST /webhooks/vercel` | Fáze 13 — Vercel build events → error_log |
| `POST /admin/articles/{id}/expand` | Fáze 14 — rozšíření krátkého článku |
| `POST /admin/articles/add-tool-links` | Fáze 15 — ToolLink injection do existujících MDX |
| `POST /admin/semantic-duplicity-audit` | Fáze 17c — pairwise Haiku duplicity check |
| `POST /admin/duplicate-archive` | Fáze 17c — snapshot + delete + DB archive |
| `POST /admin/backfill-cover-images` | Fáze 17a — re-fetch cover images pro published |
| `GET /admin/learnings/list?full=true` | Export project_learnings s description |
| `POST /admin/learnings/manual-insert` | Manuální insert (post-mortems, TODO) |

### Aktuální scheduler (24 jobů, stav 2026-04-19)

K 21 jobům z Fáze 11 přibyly 3:
- `breaking_news_followup` — denně 03:00 (Fáze 14)
- `intelligent_learning_extractor` — denně 07:00 (Fáze 12)
- `weekly_quality_report` — Pá 11:30 (Fáze 16)

---

## 11. Aktualizované DB schema (po Fázích 12–17)

### Přidané sloupce `articles`
```sql
quality_score    INTEGER       -- Fáze 16, 0-60
quality_verdict  TEXT          -- 'APPROVE' | 'REVISE' | 'REJECT'
quality_feedback TEXT          -- JSON s per-dimenzí feedbackem
quality_retries  INTEGER       -- 0 | 1 (max 1 retry)
```

### Rozšířený `articles_status_check` constraint
Fáze 16 SQL migrace rozšířila na:
`draft`, `approved`, `published`, `rejected`, `archived`, `review`, `fact_check_failed`

### Nové tabulky
- **`article_content_history`** — snapshots před UPDATE content (Fáze 15)
- **`learning_extractor_log`** — audit log intelligent extractoru (Fáze 12)
  ```sql
  run_id       TEXT
  candidate    JSONB
  decision     TEXT    -- 'accepted' | 'rejected_fuzz' | 'rejected_haiku_duplicate'
  reason       TEXT
  ```

---

## 12. Env vars — novinky

```bash
VERCEL_WEBHOOK_SECRET    # Fáze 13 — HMAC validation pro /webhooks/vercel
```

Zbytek beze změn.
