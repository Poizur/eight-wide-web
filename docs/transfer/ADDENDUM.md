# ADDENDUM.md — Novější learnings (20.-21.4.2026)
*Stav transferu: 2026-04-21 | Parent projekt {{PARENT}}*

> Rychlý přehled co přibylo po snapshot 19.4. Detaily → git log / LEARNINGS.md.

---

## Fáze 17 (dokončeno 20.4.)

### JSX → markdown migrace
**Problém:** `next-mdx-remote v6 RSC` strippuje array/object props → `<ComparisonTable tools={[...]} />`, `<FAQ items={[...]}>`, `<ToolCard>` v MDX body se nerenderovaly (`() => null`). **29 tabulek + 10 FAQ neviditelných.**

**Řešení:** Bulk Haiku rewrite JSX → markdown tabulky + `<details>`/H3 FAQ + delete redundant ToolCard v body (page.tsx renderuje z YAML frontmatter). 34 článků, 27 OK přes endpoint + 2 deterministic fallback, 5 commits v agent repo + 1 v web repo.

**Klíčová akce:** install `remark-gfm` + `MDXRemote options={{mdxOptions:{remarkPlugins:[remarkGfm]}}}` → jinak `| col | col |` zůstane jako plain text.

**Learning:** `b9dbb242` architecture_debt.

### Fabrication ban v promptu
**Problém:** Quality Reviewer pravidelně REJECTnul články s fake metrikami (`"utratil jsem 4800 Kč"`, `"otestoval 847 obrázků"`, `"Midjourney v9"`, `"73% uživatelů"`).

**Iterace promptu:**
1. Verbose 35-řádková sekce `ZAKÁZANÁ FABRIKOVANÁ ČÍSLA` (commit 151b150) — **neúčinné**
2. Zkrácená 19-řádková imperativní sekce (commit 879d47a) — **taky neúčinné**

**Diagnóza:** Claude Sonnet nemá z čeho stavět — research_agent vrací jen `{title, keyword, category}`, žádný web content / zdrojové fakty. Writer fills 2500w article → halucinuje fabrication default. **Prompt nepřepíše chybějící vstupní data.**

**Learning:** `185cce70` pipeline — potřeba fact-check layer nebo RAG.

### Authenticity backfill bulk
Rozšíření stávajícího `/admin/authenticity-backfill` endpointu o nové patterns (fabrikované metriky, fake versions, social proof). Bulk na 9 priority articles → 0 banned phrases remaining. Endpoint async (background task, Railway HTTP timeout nezhasne).

**Learning:** `f26279aa` pipeline — prose tolerance 1% moc striktní pro border articles 1500-2000w.

### Semantic duplicity audit
Nový `/admin/semantic-duplicity-audit` — pairwise Jaccard pre-filter (>0.3) + Haiku judge pro top-N → `{similarity, same_topic, merge_recommendation}`. Found 4 high-similarity pairs, 3 archivované přes nový `/admin/duplicate-archive` s 301 redirects.

**Learning:** `c6ce8d02` content_strategy — bakalárka vs diplomka (similarity 0.75) **keep_both** kvůli SEO rozdílné intence.

### Cover image blacklist + semantic cleanup
- Pexels blacklist IDs `{30530406..30530414}` ("DeepSeek photoshoot" dominoval 14/62 covers)
- Unsplash blacklist struktura připravena
- Per-slug deterministic pick: `idx = md5(slug).hexdigest() % len(photos)`

**Learning:** `f044a77d` content_quality — Pexels pool pro niche queries limitovaný, blacklist odhalí další dominantní cluster (whack-a-mole).

---

## 20.-21.4. (před RAG)

### Railway deploy lag
Commits `151b150`, `de92e89` deploy fungoval, ale **Python modul držený v APScheduler kontextu cacheoval starou verzi**. Night cycle běžel pod starým `_SYSTEM_CZ` i 4h po push. **Detekce:** článek vygenerovaný 00:34 UTC má old prompt behavior, commit z 04:22 UTC. **Řešení:** trivial nudge commit (touch main.py) → vynutí fresh process start.

### Haiku attention drift v dlouhém promptu
`_SYSTEM_CZ` má ~1922 tokens (7688 chars). Ban sekce zakopané v bullet listech jsou sémanticky slabší než imperativní blok nahoře. **Empirické:** verbose expansion ban list (35 řádků) nezafungovala, zkrácená varianta (19 řádků) taky nezafungovala — z čehož plyne, že problém není attention ale **missing source data** (model musí něčím vyplnit 2500w → halucinace je default).

### Breaking news frontmatter bug (opakuje se)
Breaking news Haiku občas emituje MDX bez leading `---`. Commit_mdx_article raisne. **Frekvence ~1 z 3 breaking articles.** Fix proposal: post-Haiku validator (regex `^---\s*\n`) s retry.

### Prose compression tolerance scaling (learning `f26279aa`)
Border articles 1500-2000 slov měly 1% tolerance — Editor consistently komprimuje prose o 1.2-1.4%. Fix proposal: `<500w=10%, 500-1500w=2%, 1500-2000w=1.5%, >=2000w=1%`. Odloženo.

---

## 21.4. — RAG architecture (in progress)

### Root cause identified
Writer (`content_agent.write_article`) dostával:
- `topic` dict (title, category — nic faktického)
- `scraped_data` (playwright screenshot_tool, často prázdné na Railway)
- `competitive_context` (Claude-on-Claude loop: jiné Claude volání *hallucinuje* "co říká PCMag") ← **halucinace halucinace feed**
- Žádný skutečný web search, žádné ověřené fakty.

Claude při psaní 2500w článku fills content z "knowledge" → fabricates metrics. Prompt bans říkají "nepiš čísla" ale Claude nemá čím nahradit.

### RAG plán (implementace probíhá)
- Commit 1/3 (`e14cd5d`): DELETE `_build_competitive_context` + `capture_tool_screenshot`
- Commit 2/3: `agents/rag_fetcher.py` — `fetch_sources(topic)`:
  - `web_search(query, 8)` DuckDuckGo (cz-cs → en-us fallback <3 results)
  - `_fetch_body(url, 500w)` requests + bs4 readability (top 3 URLs)
  - `price_history` DB query (schema: tool_id, tool_name, price_usd, checked_at)
  - `internal_articles` DB match na keywords (top 3)
  - Timeout 45s hard, soft fail → `{}` → write_article pokračuje bez RAG
  - Observability do `agent_decisions` (query count, fetch success rate, duration)
- Commit 3/3: wire `sources_block` do user prompt, system prompt require `[text](url)` citace pro všechna čísla

### Learnings TBD
- Cost impact: ~+$0.01 per article (input token nárůst)
- Latency: +10-20s per article (3 HTTP fetches parallel)
- Citation validation metric — % článků s ≥3 inline `[text](url)` citations

---

## Referenční commits (pro git log)

```
e14cd5d   refactor(content): remove Claude-on-Claude + playwright (RAG 1/3)
879d47a   refactor(prompt): shorten fabricated numbers rule
151b150   feat(prompt): expand ZAKÁZANÁ FABRIKOVANÁ ČÍSLA bans (failed)
de92e89   fix(authenticity-backfill): async background task
0fdcfc6   chore: nudge Railway deploy (cache bust)
b8d1f75   refactor(mdx): finalize JSX → markdown migration
8150795   feat(mdx): enable remark-gfm for markdown tables
34× jsx-to-md: <slug>  (bulk migration commits)
```

---

## Jak použít v novém projektu

Tento ADDENDUM NEMUSÍŠ copy-pastovat. Je to signál:

1. **Pokud Claude halucinuje** → řeš jako architektura (RAG), ne jako prompt
2. **Pokud JSX komponenty nerenderují v MDX** → check RSC prop stripping, fallback na markdown
3. **Pokud Railway deploy ignorován** → trivial nudge commit
4. **Pokud Quality Reviewer REJECTne 3/3** → vrať se k root cause (input data), ne tuning
5. **Pokud endpoint timeoutuje Railway proxy** → wrap v `asyncio.create_task` (background task)

Detail v LEARNINGS.md per kategorie + TROUBLESHOOTING.md per symptom.
