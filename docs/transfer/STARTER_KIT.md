# STARTER_KIT.md — Launch guide pro nový autonomní content projekt
*Generic, doména-agnostic | Založeno na {{PROJECT_DOMAIN}} stack*

> Cíl: postavit autonomní AI content systém v libovolné doméně (`{{TOPIC}}` =
> tech recenze, finance, e-commerce, medicína, sport, …) za **2–4 dny**
> od clone po první publikovaný článek.

---

## 1. Executive Summary

**Co systém dělá bez zásahu:**
1. Každou noc 02:00 navrhne N témat z veřejných zdrojů pro `{{DOMAIN}}`
2. Deduplikuje vs již publikované (Jaccard ≥ 0.50)
3. Napíše MDX články (≥ 1800 slov, LLM-generated, konzistentní tón)
4. Projede 5-fázový editorial pipeline (fact-check → QG → Editor → Quality Reviewer → SEO)
5. Commitne do GitHub → Vercel auto-deploy
6. V 06:00 pošle Telegram report
7. Sleduje affiliate kliknutí, error logs, Vercel builds
8. Týdně extrahuje learnings, odesílá newsletter, auditije affiliate coverage

**Kolik to stojí:**
- **Infra** (Railway Hobby + Supabase free + Vercel Hobby): **$5–20/měsíc**
- **Claude API** (20 článků/den, Sonnet 4.6 + Haiku 4.5 mix): **$80–150/měsíc**
- **Pexels + Unsplash**: zdarma do 200 req/h + 50 req/h
- **Resend** (newsletter do 3000 subs): zdarma
- **Suma**: **~$100–170/měsíc** pro 600 článků/měsíc

**Kolik to vydělá:**
- Affiliate provize 20–45 % recurring — break-even při ~30 paid subs/měsíc z affiliate
- ROI obvykle 3–6 měsíců po launch (SEO ramp-up)

---

## 2. Stack decisions + rationale

| Vrstva | Volba | Proč (vs alternativy) |
|---|---|---|
| Backend agent | **Python 3.12 + FastAPI + uvicorn** | FastAPI má nejlepší async support v Pythonu; uvicorn je production-ready. Alternativa Node.js má slabší Anthropic SDK. |
| Scheduler | **APScheduler (AsyncIOScheduler)** | Jednoduchá persistentní setup, cron syntax, async-native. Alternativa Celery je over-engineered pro single-node agent. |
| LLM | **Anthropic Claude Sonnet 4.6 + Haiku 4.5** | Sonnet = best long-form CZ/EN, Haiku = cheap judge/extractor. Neprošetřovat na GPT-4o — Claude má 16k output bez truncation. |
| DB | **Supabase (Postgres)** | Free tier stačí pro ~10k článků, integrovaný auth, REST API. Self-hosted Postgres by vyžadoval DevOps. |
| Web | **Next.js 15.3 + MDX (next-mdx-remote RSC)** | RSC = zero JS pro static obsah, MDX umožňuje JSX komponenty uvnitř článku (ToolLink, SponsoredBadge). Alternativa Astro je rychlejší build ale chudší component ekosystém. |
| Obsah | **MDX soubory v GitHub repo** | Vercel deployuje přímo z repo → zero-latency, git history je versioning. DB-stored content by vyžadoval separátní API layer. |
| Agent host | **Railway** | Zero-config Python deploy, env vars GUI, persistent process. Heroku má horší DX a dražší než Railway. |
| Web host | **Vercel** | Next.js native, auto-preview deploys, free tier pro hobby. Netlify je prakticky ekvivalent, Vercel má lepší Next.js integraci. |
| Notifikace | **Telegram Bot** | Free, instant, žádná email friction. Alternativa Slack je enterprise-overhead. |
| Email | **Resend** | Čistý API, dobrý freemium, modern DKIM setup. Alternativa Postmark je dražší, Mailgun má horší API. |
| Fotky | **Pexels + Unsplash** (oboje free API) | Kombinace dává diverzní pool; jen jeden se rychle vyčerpá pro niche queries. |
| Tracking | **Fire-and-forget route** `/track/affiliate/[tool]` | Redirect bez blocking API call; tracking zápis asynchronní do Supabase. |

---

## 3. Launch Checklist krok-za-krokem

### Krok 1 — Setup infrastruktury (2–3 hodiny)

#### 1a. GitHub repa (~10 min)
- [ ] Fork `{{PROJECT}}-agent` (Python agent) do `<your-org>/<project>-agent`
- [ ] Fork `{{PROJECT}}-web` (Next.js web) do `<your-org>/<project>-web`
- [ ] Vytvořit `GITHUB_TOKEN` (PAT, scope `repo`, expiry 1 rok)

#### 1b. Supabase (~20 min)
- [ ] Založit projekt na [supabase.com](https://supabase.com)
- [ ] Zkopírovat `SUPABASE_URL` a **service role key** (ne anon!)
- [ ] Tabulky se vytvoří automaticky při startu agenta přes `_run_startup_migrations()`
- [ ] Výjimka: `push_subscriptions` — free plan nepodporuje `/pg/query`; spustit ručně v SQL Editoru (viz sekce 7)

#### 1c. Railway (~15 min)
- [ ] Připojit agent repo
- [ ] Nastavit env vars (viz sekce 4)
- [ ] Deploy — první boot trvá ~90s
- [ ] Ověřit `GET /health` vrací status=ok + seznam jobů

#### 1d. Vercel (~10 min)
- [ ] Připojit web repo
- [ ] Framework: Next.js (auto-detect)
- [ ] Env vars: `NEXT_PUBLIC_RAILWAY_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (pokud push)
- [ ] Přidat custom doménu

#### 1e. Telegram bot (~15 min)
- [ ] `@BotFather` → `/newbot` → získat `TELEGRAM_BOT_TOKEN`
- [ ] Poslat botovi zprávu z vlastního telefonu
- [ ] `https://api.telegram.org/bot<TOKEN>/getUpdates` → vytáhnout `chat.id` → `TELEGRAM_CHAT_ID`

#### 1f. API klíče (~20 min)
- [ ] [Anthropic Console](https://console.anthropic.com/) → API key (tier 1 stačí)
- [ ] [Pexels](https://www.pexels.com/api/) → zdarma
- [ ] [Unsplash](https://unsplash.com/developers) → zdarma (schválení 24h)
- [ ] [Resend](https://resend.com) — doménu + DKIM + SPF (nejvíc friction, ~30 min s DNS)

### Krok 2 — Clone + first deploy (30 min)

```bash
git clone https://github.com/<your-org>/<project>-agent
cd <project>-agent
# Úprava config.py, scheduler/jobs.py se dělá později
git push origin main
# Railway automaticky deployne
```

### Krok 3 — Adaptace promptů (3–5 hodin)

Všechny placeholdery jsou v agentech. **Povinné úpravy:**

#### `agents/content_agent.py` — hlavní prompt
```python
_SYSTEM_CZ = """
Jsi hlavní redaktor {{NAZEV_WEBU}}.
MISE: {{CO_SI_VYBUDUJETE_ZA_POZICI}}

STYL PSANÍ:

12 ZAKÁZANÝCH FRÁZÍ (kategoricky):
- "v dnešní době"
- "představujeme vám"
- "svět {{DOMAIN}} se..."
- [upravit seznam podle {{LANGUAGE}} a {{DOMAIN}}]

7 POVINNÝCH PRVKŮ v každém článku:
- Hook (první věta překvapí nebo zneklidní)
- Osobní úhel (autor zmíní vlastní zkušenost)
- Konkrétní příklady s čísly
- Kontroverzní úhel (ne bulvární, ale odlišný od konkurence)
- Analogie k něčemu, co čtenář zná
- Krátké věty (≤20 slov většinou)
- Aktivní hlas ≥ 80%
...
"""
```

#### `agents/research_agent.py` — zdroje témat
```python
BASE_SEEDS = [
    "{{SEED_KEYWORD_1}}",   # např. pro e-commerce: "nejlepší robotický vysavač 2026"
    "{{SEED_KEYWORD_2}}",
    # ... 10–20 seed keywords pro {{DOMAIN}}
]

PILLAR_SLUGS: frozenset[str] = frozenset({
    "{{pillar-slug-1}}",
    # 5–10 pillar článků které research nikdy nepřepisuje
})
```

#### `agents/quality_gate.py` — typy článků
```python
_TYPE_REQUIRED_SECTIONS: dict[str, dict] = {
    "{{type_1}}": {
        # např. pro e-commerce "review": ["Specifikace", "Cena", "Zkušenosti", "Pro a proti"]
        "required": [...],
        "min_words": 1800,
    },
    # ...
}
```

#### `agents/quality_reviewer.py` — 6 dimenzí
Dimenze samy jsou univerzální (Hook, Originalita, Autenticita, Příklady, Hodnota, `{{LANGUAGE}}`). Ale **thresholdy** přizpůsob podle kolik časově náročných retries si můžeš dovolit:
- Striktní: APPROVE ≥ 50, REVISE 40–49, REJECT < 40 (spíš pro mature projekty)
- Benevolentní: APPROVE ≥ 45, REVISE 35–44, REJECT < 35 (první 3 měsíce)

### Krok 4 — Env vars checklist

Viz sekce 4 — cca 15 povinných + 10 volitelných.

### Krok 5 — Categories taxonomy (1 hodina)

Nastavit v těchto souborech konzistentní kategorie:
- `lib/site.ts` (web) — navigace
- `agents/research_agent.py` — mapping téma → kategorie
- `agents/content_agent.py` — frontmatter template

Doporučené kategorie pro `{{DOMAIN}}`:
- e-commerce: `recenze`, `srovnani`, `navod`, `trendy`, `akce`
- finance: `kalkulacka`, `srovnani`, `navod`, `legislativa`, `analyza`
- zdraví: `symptomy`, `lecba`, `prevence`, `vyzkum`, `rozhovor`

### Krok 6 — Affiliate programy (2 hodiny)

#### Web: `lib/affiliate-links.ts`
```typescript
export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  "{{tool_slug}}": {
    name: "{{display_name}}",
    affiliateUrl: "https://partner-site.com/?ref=you",
    commission: "{{X}}% recurring" | "{{X}}% one-time",
    active: true,
  },
  // ...
};
```

#### Agent: `agents/monetization_agent.py`
Jen `AFFILIATE_PROGRAMS` constant — audit funguje automaticky.

### Krok 7 — Deploy + smoke test (1 hodina)

```bash
# 1. Manuální test celé pipeline
curl -X POST https://<railway-url>/admin/full-cycle?count=1

# 2. Po 5–10 minutách: ověřit stav
curl https://<railway-url>/health | jq
curl https://<railway-url>/debug/articles | jq '.articles[0]'

# 3. Ověřit GitHub commit
# 4. Ověřit Vercel build
# 5. Otevřít článek v prohlížeči
```

### Krok 8 — Aktivace scheduled jobs (postupně)

**Týden 1:** `propose_topics`, `write_drafts`, `publish_approved`, `daily_report`, `intelligent_learning_extractor`

**Týden 2:** `traffic_alerts`, `changelog_monitor`, `gsc_fetch`

**Týden 3:** `affiliate_coverage_audit`, `affiliate_report`, `weekly_newsletter`

**Měsíc 2:** `breaking_news`, `breaking_news_followup`, `ab_evaluate`, `weekly_quality_report`

**Měsíc 3+:** `price_monitor`, `benchmark`, `ai_index_update`, `freshness_check`

### Krok 9 — Monitor first 48h

- [ ] Den 1 ráno 6:00 — přišel Telegram report?
- [ ] Den 1 — obsahuje SEO score pro každý článek (ne N/A)?
- [ ] Den 2 — web publikoval všechny z reportu?
- [ ] Den 2 — Vercel build failures = 0?
- [ ] Den 2 — error_log má jen drobné warnings, ne critical?

---

## 4. Env vars checklist

### Railway — agent povinné
```bash
ANTHROPIC_API_KEY              # Claude API key
SUPABASE_URL                   # https://<project>.supabase.co
SUPABASE_KEY                   # service role key
GITHUB_TOKEN                   # PAT s repo scope
GITHUB_REPO                    # "org/project-web"
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

### Railway — agent doporučené
```bash
RESEND_API_KEY
RESEND_FROM                    # "newsletter@<domain>"
PEXELS_API_KEY
UNSPLASH_ACCESS_KEY
GOOGLE_SERVICE_ACCOUNT_JSON    # GSC data
ADMIN_SECRET                   # chrání /push/send
VAPID_PUBLIC_KEY               # push notifications
VAPID_PRIVATE_KEY
VERCEL_WEBHOOK_SECRET          # HMAC validation /webhooks/vercel
SITE_URL_CZ                    # "https://<domain>"
ENVIRONMENT                    # "production"
PORT                           # Default 8080
```

### Vercel — web
```bash
NEXT_PUBLIC_RAILWAY_URL        # Railway agent URL (pro PushNotif, affiliate track)
NEXT_PUBLIC_VAPID_PUBLIC_KEY   # pokud push povolen
```

---

## 5. Cost estimate — breakdown pro 20 článků/den

| Položka | Měsíční cost | Poznámka |
|---|---|---|
| Railway Hobby | $5 | 512MB RAM, 1vCPU stačí |
| Supabase Free | $0 | 500MB DB, 2GB transfer — stačí do ~50k článků |
| Vercel Hobby | $0 | 100GB bandwidth, nelimitované deploys |
| Claude Sonnet 4.6 (pro obsah) | ~$60–100 | 600 článků × 16k tokens input, 4k output |
| Claude Haiku 4.5 (QG, extractor, judge) | ~$15–25 | ~15k Haiku volání/měs |
| Pexels + Unsplash | $0 | Free tier 200/h + 50/h stačí |
| Resend (< 3000 subs) | $0 | Free 100 emails/den |
| Resend (> 3000 subs) | $20 | Pro plan |
| Anthropic input/output split | 60/40 | Dále: cache input savings ~20% |
| **Celkem (do 3k subs)** | **~$100/měs** | |
| **Celkem (3k–10k subs)** | **~$140/měs** | |

**Scaling signals:**
- Supabase 500MB limit: ~10k článků s MDX obsahem
- Railway Hobby 512MB RAM: dostatečné do 40 článků/den
- Anthropic tier 1 (50 req/min): stačí; tier 2 potřeba až ~50 článků/den paralelně

---

## 6. Timeline — první live článek

| Den | Milestone |
|---|---|
| **Den 0** | Infra setup (Railway, Supabase, Vercel, Telegram, API klíče) |
| **Den 1 AM** | Clone + first deploy, smoke test `/health` |
| **Den 1 PM** | Prompt adaptace (`_SYSTEM_CZ`), seed keywords, pillar slugs |
| **Den 2 AM** | Článek typy v quality_gate, affiliate programy, categories |
| **Den 2 PM** | `POST /admin/full-cycle?count=1` — **první live článek** |
| **Den 3** | Ladění kvality, 2. a 3. článek, aktivace `daily_report` |
| **Týden 1** | Noční cyklus ve 3 dnech, ~15 článků |
| **Týden 2** | Newsletter setup, traffic alerts |
| **Měsíc 1** | ~100 článků, SEO první pozice, affiliate kliknutí |
| **Měsíc 3** | ~600 článků, první příjmy pokrývají Claude API |

---

## 7. Bonus — SQL migrace které nelze auto-run

Supabase free plan nepodporuje `/pg/query` pro `CREATE TABLE`. Pokud startup migrations selžou, spustit ručně v SQL Editoru:

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint    TEXT        NOT NULL UNIQUE,
    p256dh      TEXT        NOT NULL,
    auth        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    last_seen   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_subs_created
    ON push_subscriptions(created_at DESC);

CREATE TABLE IF NOT EXISTS article_content_history (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id  UUID,
    slug        TEXT,
    content     TEXT,
    source      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_history_article
    ON article_content_history(article_id, created_at DESC);
```

Pokud `articles_status_check` constraint chybí nebo je příliš striktní:
```sql
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check
    CHECK (status IN (
        'draft', 'approved', 'published', 'rejected',
        'archived', 'review', 'fact_check_failed'
    ));
```

---

## 8. Kdy potřebuješ human-in-the-loop

Systém běží **bez schvalování**, ale některé akce stále vyžadují člověka:

1. **Nové affiliate programy** — podpis smlouvy, získání tracking URL
2. **Doménové registrace** — Resend DKIM setup (~30 min s DNS)
3. **Legal/compliance** — GDPR, cookie consent, disclaimers
4. **Tone adjustments** — po prvních 10–20 článcích zjistíš, co znít špatně
5. **Pillar strategy** — jaké 5–10 kornerstone článků budovat
6. **Incident response** — error alert v Telegramu

Obvykle **30 minut týdně** (kontrola reportu + občasný fix).

---

## 9. Co zachovat vs přepsat

**Zachovat beze změny:**
- Celá vrstva tooling (`tools/`), scheduler, database client, error_log
- Intelligent learning extractor, Quality Reviewer kostra, webhook listeners
- ToolLink komponenta struktura, article_content_history schema

**Přepsat pro nový projekt:**
- Všechny prompty (systém, QG types, QR dimensions' expected output)
- Research seeds, pillar slugs, blacklist photo IDs
- Affiliate programs, tool metadata, categories taxonomy
- Brand (logo, barvy, copy)

**Neduplicate from scratch:**
Do **not** rebuild pipeline steps, scheduler wrappers, DB schema, asyncio patterns. Vše je doména-agnostic a osvědčené.

---

*Pro troubleshooting viz [TROUBLESHOOTING.md](TROUBLESHOOTING.md).*
*Pro code snippety viz [CODE_TEMPLATES.md](CODE_TEMPLATES.md).*
*Pro seznam všech learnings viz [LEARNINGS.md](LEARNINGS.md).*
