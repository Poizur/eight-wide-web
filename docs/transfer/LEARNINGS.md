# LEARNINGS.md — Ponaučení z produkce parent projektu
*Live DB export | Stav: 2026-04-21 | 85 záznamů*

> Každý záznam je konkrétní incident z produkce **parent projektu**.
> Pro nový projekt ({{PROJECT}}): přečti před implementací příslušné oblasti.
> Ty označené '🟦 example from parent project' jsou doménově-specifické
> (např. AI tool review specifika) — nepřenáší se přímo, ale pattern platí.

## Souhrn podle kategorie

| Kategorie | Počet | Hlavní témata |
|---|---|---|
| `bug_fix` | 30 | async/timeout gotchas, DB constraints, HTTP clients, deploy silent fails |
| `content_quality` | 13 | Prompt tuning, MDX validace, cover images, fabrication bans |
| `pipeline` | 11 | Editorial flow, timeouts, retry logic, prose tolerance |
| `architecture_debt` | 6 | In-memory state, RSC props, DB/GitHub drift, fact-check gap |
| `deployment` | 7 | Vercel builds, Next.js 15, TypeScript strict, Railway deploy lag |
| `fact_check` | 4 | Prices/versions, category handling, pillar protection |
| `refactor` | 4 | Module splits, wrapper patterns, error constants |
| `observability` | 3 | Silent failures, webhook listeners, slow_fetch logs |
| `mdx_syntax` | 3 | YAML fences, frontmatter validation, max_tokens tuning |
| `content_strategy` | 2 | Keep-both vs merge rozhodnutí, SEO keywords |
| `agent_behavior` | 2 | Extractor edge cases, Haiku attention drift |

## 🔴 Top 10 most costly learnings (prevention value v novém projektu)

Tyto by ušetřily v novém projektu odhadem **40-80 hodin debugging + 2-3
site-down incidenty** při správné prevenci.

1. **MDX frontmatter YAML fences → Vercel build crash**
   _Cena v novém projektu bez prevence:_ 4+ hod web 404, retroaktivní commit debugging

2. **MDX truncation při max_tokens=8000**
   _Cena v novém projektu bez prevence:_ 20+ vadných článků publikováno, ruční cleanup

3. **asyncio.to_thread bez timeoutu (pytrends/DDG)**
   _Cena v novém projektu bez prevence:_ Pipeline zamrzne na hodiny, 2+ dny pro debug

4. **asyncio.Future umírá při Railway restartu**
   _Cena v novém projektu bez prevence:_ Týden vývoje do koše, všechny approval flows se ztrácí

5. **time.sleep() v async = deadlock**
   _Cena v novém projektu bez prevence:_ FastAPI stop-responding, hard restart, ztráta background tasks

6. **useSearchParams bez Suspense (Next.js 15)**
   _Cena v novém projektu bez prevence:_ Build failure tichý, Vercel FAIL but Railway dál dispatches → drift

7. **Python f-string backslash → silent Railway build fail**
   _Cena v novém projektu bez prevence:_ Stará verze běží, 1-2 dny pro detekci

8. **Unquoted YAML & v coverImage URL**
   _Cena v novém projektu bez prevence:_ Recurrent build failure, Pexels URLs obsahují `&`

9. **Jaccard threshold 75% → duplicate articles**
   _Cena v novém projektu bez prevence:_ Desítky duplicitních článků, cleanup job + SEO penalization

10. **articles_status_check constraint striktní**
   _Cena v novém projektu bez prevence:_ `fact_check_failed` throw 500, stale drafts hromadí


## 🐛 bug_fix (30)

### 🟦 [medium] Breaking news slug generovaný z feed title, ne z Claude MDX title — parent-guide prefix leaks

20.4.2026 homepage audit: 2 breaking news články měly slug ve tvaru jak-pouzivat-X-news-event (Gemini TTS) a jak-zacit-s-X-news-event (ChatGPT Slack). Root cause v agents/content_agent.py:2532 — write_breaking_news volá _make_slug(item.get(title)), kde item.title je RAW feed title (složený/verbose/Czech-translated aggregator title). Claude v MDX frontmatteru generuje čistý SEO title max 65 znaků, který se později stane DB title, ale slug zůstal z feed title.

Prevence: FIX (neprovedeno): Po Claude call extrahovat title z MDX frontmatteru (regex ^title:) a REGENEROVAT slug z něj před DB insertem. V write_breaking_news po raw_mdx = call_claude(...) přidat: extrahuj cleaned_title z frontmatteru, fallback na item.title pokud chybí, pak slug = _make_slug(cleaned_title, cz). DB insert použije cleaned_title. Také validate presence of title in frontmatter — fail fast pokud ne.

### [high] Validace full_delta: 3-30% warningem místo failem pro krátké články s CTA

Batch 2 validation selhalo na 6/16 článcích (krátké ~1000 slov) s chybou 'full_delta > 3%' přestože obsah byl nezměněn. Root cause: přidání CTA boxu (~40 slov) u krátkých článků legitimně zvyšuje full_delta na 3-4%, což byl zbytečný hard fail. Dopad: správný output byl zamítnut.

Prevence: Implementován tříúrovňový validation systém: (1) prose_delta > 1% = FAIL (jádro ochrany), (2) full_delta > 30% = FAIL (sanity guard proti runaway additions), (3) full_delta 3-30% = WARNING (non-blocking, vrací metrics dict s full_warning flag). Handlery nyní logují warning jako info bez incrementu safety-net counter. Nové testy pokrývají exact scenario z batch 2.

### [medium] Daily report chyběl quality_score → přidán do SELECT a Telegram output

send_daily_reportQuery vracela pouze word_count a seo_score. Quality_score, který od Fáze 16 persistuje _auto_publish_with_report, se v Telegramu neobjevoval. Vedlo to k neúplným daily reportům bez kvalitativního verdiktu článků.

Prevence: Přidán quality_score a quality_verdict do SELECT. Output teď renderuje emoji per článek (⭐ APPROVE / 🔄 REVISE / ❌ REJECT) a gracefully skočí null hodnoty pro starší články před Fází 16.

### [high] Silent failures v send_drafts_review → Telegram alerts + null guards

Funkce send_drafts_review měla tři skryté chyby: výjimky v _review_one se tichě ignorovaly bez upozornění, přístup k obsahu článku používal špatnou fallback syntaxi a DB select bez explicitních sloupců zvyšoval riziko na chybějící content. Incidenty nebyly viditelné, pipeline běžel dál s vadnými daty.

Prevence: Přidány Telegram alerts na výjimky, nahrazeny .get() s špatným defaultem na (or ""), DB select převeden na explicitní seznam sloupců včetně content. Stává se tak viditelným, co se v review procesu pokazí, a zabraňuje proslýchaným datům.

### [high] Chybějící import ask_approval_article - runtime NameError v ceo_agent

V ceo_agent modulu chyběl import funkce ask_approval_article z telegram_tool. Vedlo by to k NameError za runtime, když by agent pokusil schválit článek. Chyba nebyla zachycena compile-time, protože Python provádí lazy import resolution.

Prevence: Implementovat statickou analýzu importů v CI pipeline (pylint, pyflakes) nebo type checking (mypy). Pro runtime agenty přidat unit testy pokrývající approval flow. V code review checklist přidat: 'Všechny externální funkce jsou importovány?'

### [high] [error_log] vercel_build_failed v vercel_deployment

Vercel build FAILED
URL: https://only5l-web-test.vercel.app
Commit: test123abc45 — test: webhook smoke test
Reason: Test error: Cannot read properties of undefined (reading toLowerCase)

### [critical] asyncio.to_thread bez timeoutu → 300s timeout na propose_topics

pytrends a DuckDuckGo HTTP requesty v thread pool workers se mohly zaseknout na neurčitě. SIGALRM funguje jen v main threadu, takže 20s alarm v _fetch_google_trends_cz byl ignorován. Bez timeoutu se propose_topics cyklus visel hodiny.

Prevence: Přidán 300s timeout na asyncio.to_thread v propose_topics. 300s je dostatečně velký pro normální běh (3-4 min max), ale zabije patologické hangy. SIGALRM alone nestačí pro thread pool — vždy vyžaduj explicitní timeout.

### [high] httpx.delete() body forward failure → Client.request() s content= param

httpx.delete() a httpx.request() module-level funkce neforwardovaly body kwargs konzistentně mezi verzemi. Způsobilo selhání DELETE requestů s tělem (např. GitHub API). Fix: Client.request() + content= bytes parametr je stabilní across all versions.

Prevence: Pro DELETE/PATCH s body vždy používej httpx.Client().request(method, content=bytes) místo module-level httpx.delete(). Testuj body forwarding s více verzemi httpx. Pokud body chybí v requestu, check HTTP client API stability.

### [high] Admin endpoint bez autentizace − bezpečnostní nekonzistence v /admin/vercel/check-token

Endpoint /admin/vercel/check-token měl auth middleware, zatímco /admin/extract-learnings byl unauthenticated. Nekonzistentní bezpečnostní model mezi admin endpointy vytváří riziko chybné konfigurace v produkci.

Prevence: Standardizovat auth pattern pro všechny admin endpointy. Vytvořit linter/test že všechny /admin/* endpointy mají explicitní auth policy (auth required nebo explicit allowed list).

### [high] Intra-batch dedup + explicitní Czech-only prompt instructions

Při procesu deduplikace learning candidates v rámci jedné batch se candidates s dry_run=true (test mode) nepripsovaly do existing listu. Výsledkem bylo, že 3× identické httpx.delete learnings byly všechny přijaty jako unikátní. Zároveň se v LLM promptech neřídilo jazyk striktně, což vedlo k míchání ruských znaků (např. 'должен', 'застревали') do českého outputu.

Prevence: Kandidáti jsou nyní přidáváni do existing listu ihned po přijetí, bez ohledu na dry_run mód. Deduplikace v rámci batch tak funguje správně. V system promptech extraktoru a judgu přidány explicitní instrukce: 'JAZYK: Všechny texty vrať VÝHRADNĚ v češtině. Nikdy nepoužívej cyrilici, ruštinu ani jiné jazyky.'

### [medium] React.ReactNode typ vyžaduje explicitní import v strict mode

TypeScript strict mode v SrovnaniClient vyžadoval explicitní import React pro React.ReactNode type annotation. Nový JSX transform automaticky neposkyuje React do scope, což vedlo k build chybě.

Prevence: Při použití React.ReactNode nebo jiných React typů v TypeScript strict mode vždy přidej explicitní import React, i když se React nepoužívá v JSX. Alternativa: použij 'import type { ReactNode } from react' a pak jen 'ReactNode'.

### [high] Uint8Array typu v PushNotifButton → string conversion fix

TypeScript build selhal kvůli nekompatibilní typizaci Uint8Array<ArrayBufferLike> v PushNotifButton komponentě. Manifest.ts měl zbytečný @ts-expect-error directive. Build blokoval deployment.

Prevence: Použij string místo Uint8Array pro applicationServerKey v Push Notification API. Odstraň @ts-expect-error kdy TS nyní správně řeší typ (form_factor je dostupný). Validuj typy proti DOM API spec.

### [critical] Python f-string backslash escape → syntax error → silent Railway build fail

Backslash escape \" uvnitř f-string výrazu ("...") není v Pythonu povoleno. Railway zobrazilo FAILED deploy, ale spustilo starý kontejner → scheduler měl stále 18 jobů místo nových. Symptom zákeřný: /health i logy vypadaly v pořádku. Fix: extrahovat proměnné před f-stringem (slug = article.get('slug', '')) a použít {slug} bez escape.

### [medium] Research agent navrhoval neexistující AI nástroje bez ověření

LLM vymýšlel názvy nástrojů (Hiro, Aria AI, Nexus). Fix: (1) DDG existence check pro každý extrahovaný nástroj, (2) fuzzy dedup Jaccard ≥75% proti existujícím tématům v DB, (3) blacklist falešně populárních buzzword témat. Výsledek: agent navrhuje jen reálné ověřené nástroje.

### [high] Chybějící CORSMiddleware → Railway CDN (Fastly) blokuje OPTIONS preflight

FastAPI bez CORSMiddleware vrací 405 Method Not Allowed na OPTIONS request. Railway Fastly CDN nevkládá CORS hlavičky. Newsletter formulář na aikompass.cz hlásil 'Nepodařilo se připojit'. Fix: app.add_middleware(CORSMiddleware, allow_origins=[...], allow_methods=['GET','POST','OPTIONS']).

### [high] Supabase articles_status_check constraint nepovoluje 'fact_check_failed'

Supabase CHECK constraint na articles.status povoluje jen konkrétní hodnoty — 'fact_check_failed' mezi nimi není. INSERT failoval s 23514 check_violation. Fix: změnit na 'rejected' (povolená hodnota). Obecně: vždy ověřit CHECK constraints před přidáním nové status hodnoty.

### [medium] Background task exception spolkla chybu bez notifikace

FastAPI BackgroundTasks zachycují výjimky tiše. Fix: Telegram notifikace při selhání každého background tasku.

### [medium] python-telegram-bot v21 signal handlers crash na Railway

PTB v21 registruje UNIX signal handlers, conflict s Railway SIGTERM. Fix: install_signal_handlers=False.

### [medium] Telegram query.answer() volané vícekrát → BadRequest

DB polling loop volal answer() každých 10s. Telegram povolí answer() jen jednou per callback. Fix: boolean flag answered.

### [medium] Playwright scraping tiše failoval na Railway (chybí systémové knihovny)

Railway nemá libglib2/libnss3 pro Chromium. Fix: try/except kolem scraping, pipeline pokračuje bez dat.

### [medium] Duplicate slug → silent INSERT fail v Supabase

articles tabulka má UNIQUE na slug. Přepisování existujícího článku → 23505 duplicate key. Fix: upsert na slug.

### [high] APScheduler jobs nebyly async → tichý fail

AsyncIOScheduler očekává async def. Registrované sync def funkce způsobovaly crash bez chyby. Fix: všechny job wrappery musí být async def.

### 🟦 [high] Synchronní Claude API call blokoval server 3-5 min

call_claude() je synchronní blocking HTTP. Volán přímo z async handleru → blokoval event loop. Fix: obalit do asyncio.to_thread().

### [high] Rogue {placeholder} v LLM šabloně → KeyError při str.format()

JSX prop affiliateUrl="{affiliate_url_pro_tento_nastroj}" interpretován jako Python format arg → KeyError. Fix: použít POUZI_AFFILIATE_URL_Z_KONTEXTU jako plain text instrukci.

### 🟦 [critical] MDX truncation při max_tokens=8000 → Vercel build crash → web 404

Claude přerušen uprostřed JSX propu při max_tokens=8000. Fix: max_tokens=16000 + _detect_mdx_truncation() + retry s instrukcí uzavřít komponenty.

### [critical] asyncio.Future zemře při Railway restartu → přepis na DB polling

asyncio.Future je in-memory, umírá při každém Railway deployi. Fix: stav approvalů ukládat do agent_decisions tabulky, background task polluje DB. Olivator pravidlo: no in-memory state pro multi-step flows na kontejnerových platformách.

### [critical] time.sleep() v async funkci zmrazí celý server

Synchronní time.sleep() blokuje asyncio event loop. FastAPI přestal odpovídat na /health i Telegram callbacks. Fix: await asyncio.sleep().

### 🟦 [high] [error_log] db_save_failed v content_agent

{'message': 'new row for relation "articles" violates check constraint "articles_status_check"', 'code': '23514', 'hint': None, 'details': 'Failing row contains (4f960a20-f676-43d4-8e5a-c27092b31b2c, nejlepsi-ai-chat-v-cestine-2026-srovneni-chatgpt-claude-a-dalsic..., cz, Nejlepší AI chat v češtině 2026: Srovnění ChatGPT, Claude..., fact_check_failed, null, 2026-04-15 04:22:34.003666+00, 2026-04-1

### [low] GSC 'žádná data' nerozeznávala chybu oprávnění od nového webu

GSC API vrací prázdné výsledky jak pro permission error, tak pro nový web bez traffic. Fix: rozlišit oba případy v error handling.

### [medium] Cover images generické nebo sdílené mezi články

Unsplash dostával celý titulek → nenašel match → generický obrázek. Fix: IMAGE_QUERY_MAP mapuje klíčová slova na fokusované 2-4 slovné anglické query.

## 📝 content_quality (13)

### 🟦 [high] Deterministické hashing fotek per-slug → eliminace duplikátů v obsahu

6 ChatGPT článků sdílelo stejnou Pexels fotku (30530407) kvůli: (a) IMAGE_QUERY_MAP mapoval všechna témata chatbotů na jeden dotaz, (b) fetch_pexels_image vracela vždy photos[0]. Dopad: nízká diverzita vizuálního obsahu, chybějící relevance fotek k jednotlivým článkům.

Prevence: Implementován MD5 hash slug → deterministický výběr z pool fotosearch resultů (per_page 10). Unsplash přepnut z /random na /search/photos pro reprodukovatelnost. IMAGE_QUERY_MAP rozšířen z 1 na 20+ specifických dotazů (chatgpt/claude/midjourney/...) + 15 kategoriálních queries. Slug je nyní povinný argument fetchers - Same slug = same photo (idempotentní, survives retries).

### [high] Authenticity validator: OSOBNÍ ÚHEL → AUTENTICKÝ ÚHEL + claims dimension

Agent vyžadoval první osobu (OSOBNÍ ÚHEL) u všech článků, což vedlo k falešným tvrzením typu 'zkusil jsem'. Nový standard AUTENTICKÝ ÚHEL rozlišuje mezi kurátovaným porovnáním (na bázi dat/reviewů) a skutečným osobním testem. Přidána 7. dimenze Quality Revieweru: claims (autentičnost), max 70 bodů. Hard gate: claims < 4 → AUTO-REJECT (liability).

Prevence: Implemented v _SYSTEM_CZ explicitní pravidla: markdown tabulky only (bez JSX), SEO keywords (test, testování, srovnání) v neutrální formě povoleny. Quality Reviewer nyní detekuje falešné first-person hooks a penalizuje neautentická tvrzení. Thresholds: APPROVE ≥56, REVISE 42-55, REJECT <42. Testy a daily report updatovány.

### 🟦 [medium] Prose komprese překročila 1% toleranci (1729→1709 slov)

Agent add_tool_links vyvolal API validaci prose_compression pro článek o ChatGPT. Prose word count klesl o 20 slov (Δ 1.2%), což překročilo stanovenou 1% toleranci. CTA-adjustment znesnadnil validaci. Run ID: 5ce762dc.

Prevence: Zvýšit toleranci na 1.5% pro CTA-adjusted komprese nebo přidat logging důvodů komprese (odebrané věty, refaktorované pasáže). Před spuštěním add_tool_links ověřit, že prose delta nepřekročí limit.

### 🟦 [medium] Pexels pool pro AI/tech queries je limitovaný, dominují photoshooty 10-20 fotek

19.4.2026 cover image backfill: per_page=10 + hash stále vrátí dominantní photoshoot (DeepSeek 14×, policy cluster 16587315 7×, generic-ai 16027824 5×). Blacklist pomůže odstranit specifické photo IDs, ale odhalí další dominantní cluster.

Prevence: Dlouhodobé řešení: Unsplash API jako primární (větší AI-free pool) nebo per_page=80 s anti-cluster filtrováním (prefer photos z různých fotografů). TODO for later optimization.

### 🟦 [high] Cover images: DALL-E disabled, fallback pravděpodobně nefunguje, většina článků má default thumbnail

19.4.2026 homepage: 4 z 6 článků má stejnou DeepSeek ilustraci bez ohledu na téma. OPENAI_API_KEY odpojen, fallback na Pexels/Unsplash patrně selhává.

Prevence: Audit image_generator.py fallback chain. Přepnout na Pexels/Unsplash API jako primární zdroj (ne fallback).

### 🟦 [high] Jaccard 0.50 threshold nestačí pro semantic duplicity (Jak používat X vs Jak začít s X)

19.4.2026 homepage audit: 2 články o Jak začít s ChatGPT publikované jako separátní. Content cannibalization. Research agent Jaccard je na wording, ne na meaning.

Prevence: Rozšířit dedup o Haiku semantic check pro top 5 candidates z Jaccard, jako v intelligent_learning_extractor.

### [high] Homepage nepropaguje klíčové interactive features → 0 discovery, 0 conversion

Test úrovně AI + 3 kalkulačky jsou v nav jen jako ikony nebo v dropdown. Homepage je article list only. User (19.4.2026) flagl chybějící kontext k Test úrovně.

Prevence: Homepage potřebuje: (1) interactive hook sekci (Test za 2 min) viditelnou above-the-fold, (2) featured kalkulačka sekce, (3) článek list jako sekundární. Pattern: engagement first, content second.

### [medium] Breaking news pod 250 slov nemají prostor pro CTA box (20%+ podíl)

19.4.2026 cleanup batch: meta-raises-quest-3 a jeho duplikát selhali na add-tool-links i s 10% tolerancí. CTA box se 3-5 bullety je 30-50 slov, což je 15-25% celého článku pod 250 slov. Validace prose to odmítla.

Prevence: Pro breaking news < 250 slov navrhnout separate CTA pattern — 1-2 inline linky, bez CTA boxu. Nebo počkat na breaking_news_followup (48h rozšíření na 1500+ slov) a linky přidat až poté.

### [high] Type-based content validation → mandatory sections per article type

Pipeline lacked typ-specifické validace obsahu. Články různých typů (recenze, srovnání, návod, pilíř, profese, breaking) měly různé strukturální požadavky, ale neexistovala automatická kontrola. Vedlo to k nekompletním článkům, které prošly publikací.

Prevence: Implementován type-based completeness check v Quality Gate — agent detekuje typ článku a vynucuje povinné sekce + minimální počet slov. Editor Agent auto-injektuje chybějící sekce. Post-editor structural check s hard fail (score=0) zabraňuje publikaci nekompletních článků.

### [high] Chybějící kategorie v detekci MDX článků → přidány aliasy navody/srovnani

26 článků v GitHub MDX nebylo správně zařazeno do kategorií. Detekce typu článku ignorovala aliasy 'navody' a 'srovnani', což vedlo k desynchronizaci mezi GitHub zdrojem a Supabase DB. Chyba se objevila při vytváření sync-mdx-to-db endpointu.

Prevence: Přidány kategoriální aliasy do quality_gate/detect_article_type. Implementován /admin/sync-mdx-to-db endpoint s dry_run režimem pro kontrolu rozdílů (word_count, kategorie) před zápisem. Telegram report zobrazuje úplný diff, aby se změny daly ověřit před production.

### 🟦 [medium] ChatGPT bez registrace - obsah aktualizován

Agent freshness detekoval změnu: ChatGPT nyní dostupný bez registrace. Zdrojový obsah o 'jak používat chatgpt zdarma' vyžaduje aktualizaci, protože informace o povinné registraci jsou nyní zastaralé.

Prevence: Spustit fact-check na stránce chatgpt.com/cs-CZ/download/ a aktualizovat návod - odstranit pozn. o povinné registraci, přidat kroky pro přístup bez účtu.

### 🟦 [medium] Jaccard similarity threshold 75%→50% pro detekci blízkých duplikátů témat

Dva ChatGPT články pro začátečníky prošly kontrolou deduplikace s Jaccard similaritou ~70%, která byla pod původním limitem 75%. Články si byly velmi podobné (shodný obsah, jen různá slova). Zvedl by se počet falešně negativních duplikátů v produkci.

Prevence: Snížen prahový limit deduplikace z 75% na 50% v _is_duplicate_topic() a z 60% na 50% v intra-batch dedup. Limit 50% lépe detekuje párové duplikáty jako 'Jak začít s ChatGPT' a 'kompletní návod pro začátečníky'. Oba gateways synchronizovány.

### 🟦 [medium] Nová Slack integrace ChatGPT detekována, bez lokální aktualizace

Agent freshness detekoval 16.4.2026 novou Slack integraci pro ChatGPT z oficiálního release notes. Změna byla identifikována jako 'new_feature', ale neexistuje trigger pro synchronizaci detekované změny do lokálního guidace dokumentu 'jak začít s chatgpt'.

Prevence: Implementovat changelog_detected handler, který automaticky vytváří issue/task pro obsah správce. Přidat webhook na OpenAI release notes RSS feed s prioritizací feature-type změn. Zavést versioning tracking v MDX dokumentech pro mapování verzí externích služeb.

## ⚙️ pipeline (11)

### 🟦 [high] Quality Reviewer nepozná fabrikovaná čísla — potřebujeme fact-check layer

20.4.2026: Článek nejlepsi-ai-pro-obrazky-2026 dostal 52/60 APPROVE i přes 6 fabrikovaných metrik (847 obrázků, 4800 Kč za testování, Midjourney v9 neexistuje, 73 % uživatelů bez zdroje, Kolegové poznali osobu). Claude Sonnet v reviewer CELEBROVAL 'konkrétní čísla' jako znak autenticity v quality_feedback: 'Hook zaujme reálnými čísly (4800 Kč, 847 obrázků)'. Prompt enhancement FIX 3 (claims dimenze) to částečně chytí, ale ne systematicky — Sonnet fundamentálně nemá cross-reference proti faktům.

Prevence: Postavit fact_check_agent PŘED Quality Reviewer (nebo rozšířit existující): (1) known-tools registry s aktuálními verzemi (Midjourney v6, GPT-4, Claude 3.5 Sonnet, DALL-E 3, …) — REJECT při neexistujících verzích; (2) flag kulatých/přesných čísel bez metodiky ("Otestoval jsem N", "Utratil X Kč", "M % uživatelů") → REJECT; (3) cross-check cen proti price_monitor_agent data; (4) volitelně web search pro ověření externích claims. Implementovat jako pipeline step mezi fact_check a quality_gate, tj. před Quality Reviewer. Po bulk fixu existujících článků (AKCE 3, 20.4.2026).

### 🟦 [medium] Prose tolerance 1% moc striktní pro border articles 1500-2000w

20.4.2026 ÚKOL 2: jak-zacit-s-chatgpt (1783w) 3× selhal na prose_compression 1.2-1.4% > 1% tolerance. Editor přirozeně komprimuje filler text při add-tool-links.

Prevence: Rozšířit scaled tolerance: <500w=10%, 500-1500w=2%, 1500-2000w=1.5% (NEW tier), ≥2000w=1%. Implementovat až bude další border case.

### [high] Pipeline timeout 600→1500s: draft articles zůstávaly zaseknuté bez chyby

Vnější timeout (600s) byl kratší než součet inner stepů: QG review (60s) + QG rewrite (až 600s) + editor (540s) = 1200s. Články vyžadující rewrite tiše vrátily None a zůstaly drafty forever. Uživatelé neviděli chybu.

Prevence: Timeout prodloužen na 1500s (25 min). Na timeout se nyní vrátí článek s pipeline_stats={timeout:True} místo None, aby se publikoval bez QG/editor stats. Lepší mít článek live než trvale zaseknutý v draftu. Budoucí: per-step monitoring (asyncio.wait_for logs) pro viditelnost timeout chování.

### 🟦 [high] Pipeline timeouty → zvýšení o 50% kvůli stabilitě batch procesů

Post-testing batch zpracování vykazovalo nestabilitu: Claude editor a QG review překračovaly původní timeouty (480s → 720s, 60s → 120s). Vnější timeout zvýšen z 1500s na 2250s. Dopad: opakovatelné selhání publikace článků, nedokončené batche.

Prevence: Zvýšeny všechny kritické timeouty: outer 1500s→2250s, Claude editor 480s→720s, QG review 60s→120s, QG rewrite 600s→900s, SEO/learnings 60s→90s. Vnitřní součet 2130s < vnější 2250s. Monitoring: timeout články jsou v reportu flagované jako 'N/A (pipeline timeout)'.

### [high] SEO metriky a počty témat v reportu: chybějící DB persistence → opraveno

Ranní report zobrazoval 'N/A (pipeline timeout)' pro seo_score a word_count všech článků, protože se neukladaly do DB. Navíc send_daily_report počítala témata bez deduplikace, což vedlo k nadhodnocení když se pipeline spustila víckrát za den.

Prevence: Přidán DB update v _auto_publish_with_report s seo_score/word_count. Implementována deduplikace v send_daily_report (GROUP BY title) pro počítání unikátních témat za den. Ověřit v daily report, že se čísla shodují se skutečným počtem publikovaných článků.

### [low] Category inferred from title (Haiku kategorizace)

Při chybějící category v MDX frontmatter Haiku inferuje z titulku. Přidáno do content pipeline pro konzistenci.

### [medium] Články 1300-1700 slov místo cílových 2500+

Generický systémový prompt bez struktury a explicitních požadavků na délku. Fix: kompletní přepis promptů, competitive context step, word count retry.

### [medium] Fact-check: MDX frontmatter vstupoval do extrakce tvrzení

Haiku extrahoval tvrzení z frontmatter YAML hodnot (coverImage URL jako 'statistic'). Fix: _strip_frontmatter() před analýzou.

### [medium] Fact-check: Haiku vracel JSON s markdown code fences → parse fail

Haiku ignoroval instrukci 'raw JSON' a obaloval odpověď do ```json```. Fix: strip code fences + strict system prompt.

### [high] Fact-checker: pricing claims blokovaly → přesunuty do informational

CZK ceny jsou konvertovány z USD a DuckDuckGo je neověří. Fix: pricing typ = non-blocking informational.

### [high] Fact-checker blokoval statistiky o rate-limitech → příliš mnoho false positives

Tokeny/sekundu, limity zpráv, API kvóty se rychle mění a DuckDuckGo je nedohledá. Fix: statistic type = softer logika (DDG najde nástroj → SPORNÉ místo NEOVĚŘENO). Rate limity → informational typ.

## 🏗️ architecture_debt (6)

### [high] next-mdx-remote RSC strippuje array/object props — JSX komponenty s daty v MDX se nerenderují

20.4.2026 audit: ComparisonTable, ToolCard, FAQ v app/[slug]/page.tsx mappované na () => null protože next-mdx-remote v6 RSC dropuje array/object props při serializaci přes server component boundary. 19 tabulek + 10 FAQ invisible na produkci. ToolCard v MDX body redundantní — page.tsx ho už renderuje z frontmatter s proper YAML-parsed props. 3 články s ComparisonTable používaly i nesprávný prop name (items místo tools).

Prevence: Pro data-heavy komponenty v MDX body: (1) NEPOUŽÍVAT JSX s array/object props — RSC je vždy stripne, (2) preferovat markdown tabulky a definition lists (nativně renderuje, žádná serializace), (3) alternativně přesunout strukturovaná data do YAML frontmatter a render v page.tsx jako server component. Prompt content_agent už toto vynucuje (FIX 1 MARKDOWN TABULKY, duben 2026).

### [high] Scaled validation tolerance pro breaking news → eliminace false-positive prose_compression fails

Breaking news (200-400 slov) selhávaly při přidání CTA boxů kvůli pevné prose_compression toleranci 1%. Nový systém _tolerances_for_length() škáluje toleranci podle délky článku: krátké články dostávají 10% prose tolerance, dlouhé 1%. Tím se eliminují falešné alerty na validně zkomprimovaný obsah.

Prevence: Tolerance pro sanitizační validaci by měly být vždy škálované podle kontextu (délka obsahu, typ článku). Implementuj dynamic thresholds místo pevných konstant v validation layeru. Při přidání nových validation rulů vždy zvař relevantní kontextové parametry.

### [medium] LLM-judge dedup prompt tuning: procenta FP zkreslená na malých batches, absolutní počet je lepší indikátor

Dne 17.4.2026 první produkční run Intelligent Learning Extractor. Tuning promptu proběhl ve 3 iteracích. FP rate 13% při 15 rejectionech = absolutně 2 FP. Při daily runu 1-3 kandidátů je procento neinformativní.

Prevence: Při tuningu dedup promptů sleduj absolutní počet FP, ne procento. Pro produkci platí: pokud daily FP < 2, systém je zdravý.

### 🟦 [high] LLM-based learning extractor bez embeddings — single-vendor risk + DDL deployment gap

Nový intelligent learning extractor (Claude Haiku + fuzzy matching) nahrazuje rule-based job. Architektura: dvoustupňová deduplikace (fuzzy 40-95% range → Claude judge). Kritické: Supabase free plan blokuje DDL přes API, vyžaduje manuální SQL (migration 009) v editoru. Bez tohoto kroku learning_extractor_log zůstane neexistující tabulka, zápisy loga budou tiché (warnings, ne crash).

Prevence: 1) Přidat pre-flight check v app startu: SELECT to_regclass('learning_extractor_log') — pokud null, vrátit startup error s jasnou instrukcí (link na migration 009). 2) Redundance: embeddings (Voyage AI) jako fallback pro Stage 2b místo druhého Claude callů — snižuje Anthropic single-vendor závislost. 3) Audit trail: learning_extractor_log migration zautomatizovat přes Supabase JS client (create_table_if_not_exists pattern) nebo dokumentovat v onboarding checklistu.

### 🟦 [high] Duplicate slug prevention – slug collision při vytváření nového článku

Agent pokusil uložit nový článek s slugem 'jak-pouzivat-chatgpt-zdarma-kompletni-navod-pro-cesky-mluvici-2026', ale slug již existuje v DB. Článek zůstal v draftu, pipeline se zastavila.

Prevence: Implementuj slug collision detection před save operací: zjisti existující slugy pro dané téma, přidej timestamp či inkrementální suffix (slug-1, slug-2). Nebo uprav generátor slugů aby zahrnul datum/verzi.

### [medium] project_learnings extract-learnings job je rule-based, neumí automaticky přidat nové learnings z incidentů

Nové learnings vyžadují ruční commit do GIT_LEARNINGS list v main.py. Dedup je exact title match, žádná LLM analýza error_logu. TODO: buď přejmenovat na known_issues_reference, nebo implementovat LLM-based extractor s embedding dedup.

## 🚀 deployment (7)

### 🟦 [high] Claude API timeout z 600s → 120s/180s, retry loop + E2E failsafe

Retry loop na Claude API mohl viset 40+ minut při rate limitu, protože SDK default timeout byl 600s. Přidány explicitní timeouty: 120s standard (anthropic_client), 180s pro long-form psaní (content_agent), asyncio failsafe v E2E testu s Telegram alertem na Railway logy.

Prevence: Všechna volání na třetí strany (LLM, API) musí mít explicitní timeout < 10 minut. SDK defaults se nepředpokládají. Dlouhé operace (psaní, fact-check) dostanou delší timeout s jasným monitoringem. E2E testy mají hardcoded failsafe + notifikaci.

### 🟦 [high] Timeout threshold zvýšen pro dlouhé LLM callouts (120→300s E2E, 180→270s HTTP)

Claude Sonnet se 16k max_tokens vyžaduje 60-90s zpracování. Pokusy o retry (min 5s delay) překračovaly původní 120s limit E2E a 180s limit HTTP, což způsobovalo timeout failury i při úspěšném zpracování. Nové limity (300s E2E, 270s HTTP) poskytují prostor pro jednu retry sekvenci bez wall-clock překročení.

Prevence: Timeout hodnoty nyní reflektují realný čas potřebný pro max_tokens=16000 callouts + buffer na retry. Alert zprávy rozšířeny o status.anthropic.com pro diagnostiku. Při budoucích změlínách LLM timeoutu vždy ověřit p95/p99 latenci s plným tokenem + retry overhead.

### 🟦 [high] Editorial pipeline timeout → 240s asyncio.wait_for, editor agent 270s

Editorial pipeline a editor agent Claude volání časovaly bez explicitního timeout. Asymetrické timeout nastavení (E2E vs agent) způsobovalo nepředvídatelné timeout chování a incomplete pipeline executions.

Prevence: Implementován asyncio.wait_for(timeout=240s) kolem _run_editorial_pipeline. Editor agent dostal timeout=270s pro max_tokens=16000 volání (edit + full_rewrite operace). Telegram alert monitoruje pipeline timeout s diagnostikou pro debugging.

### [critical] useSearchParams bez Suspense → Next.js 15 build failure

Next.js 15 build selhával tiše při použití useSearchParams() bez Suspense boundary během statické generace. Chyba se projevila na srovnani-nastroju/page.tsx. Bez opravy by produkční build nebyl spustitelný.

Prevence: Všechny client componenty s useSearchParams() musí být zabaleny v <Suspense> boundary na server parent komponentě. Při migraci na Next.js 15+ okamžitě rozdělit page.tsx na server/client části a testovat build lokálně před commitem.

### [high] Next.js 15 routing conflict: static /zacatky vs [category] dynamic route

Next.js 15 neumožňuje koexistenci statické /zacatky/page.tsx a dynamické [category]/page.tsx v téže hierarchii. Agent vyřešil sloučením ZacatkyLayout do [category]/page.tsx a smazáním redundantního souboru app/kategorie/zacatky/page.tsx. Zároveň aktualizován obsah (hero, navigace, personalizace).

Prevence: Při dalších migrací routing architektur ověřit v Next.js 15 dokumentaci konflikt mezi static a dynamic routes ve stejném directoryy. Preferovat single route handler s parametry před dublikacemi. Automatizovat routing testy v build pipeline.

### [high] Unclosed FAQ JSX před ## Jak funguje → MDX parse error

<FAQ items={[...]}> bez uzavíracího /> způsobí acorn parse error v Next.js build. Fix: _sanitize_mdx_frontmatter + kontrola všech 27 souborů po batch commitu.

### [critical] Unquoted coverImage URL s & v YAML frontmatter → Vercel build fail

YAML parser interpretuje & jako anchor sigil. coverImage: https://...&cs=tinysrgb bere &cs= jako anchor. Fix: sanitize v github_tool.py před každým commitem.

## 🧪 fact_check (4)

### [critical] Fact-check ceny/kurzy → informational, auto-publish vypnut, pipeline timeout handling

Fact-checker blokoval články obsahující ceny produktů (429 Kč/měsíc, kurzy) jako 'financial'. Auto-publish systematicky publikoval články bez redakčního schválení. Pipeline timeout zanechával články v nekonzistentním stavu. Všechny tři problémy zastavovaly produkci.

Prevence: Ceny/kurzy přesuneme do 'informational' kategorie (blokují jen fundraising/revenue). Auto-publish odstraněn — články jdou do Telegramu na ruční schválení (PUBLISH/EDIT/REJECT). Timeout články dostávají _pipeline_timeout flag a varovný msg; Martin se rozhoduje ručně.

### [medium] Freshness agent zaznamenal cenovou změnu Meta Quest bez ověření novosti

Agent freshness zalogoval cenovou změnu Meta Quest 3/3S ze zdroje TechCrunch (16.4.2026) jako aktuální event. Článek však není z dne incidentu (17.4.), ale z předchozího dne. Freshness logika nerozlišila mezi 'článek vydaný včera' a 'event z dneška'.

Prevence: Přidat do freshness agenta check: porovnat publication_date artiklu s current_date; nur v changelog_event_today logovat pokud article_date == today. Přesunout novější články do backlog.

### [medium] Quest ceny detekované – RAM shortage vzorec přidán

Agent freshness detekoval změnu cen Meta Quest 3/3S z důvodu nedostatku RAM. Incident zaznamenán v changelog_detected, změna pocházela z TechCrunch. Vyžaduje ověření faktů a aktualizaci product Intelligence.

Prevence: Implementovat pattern pro hardware shortage scénáře a ověřit ceny přes oficiální Meta zdroje (store.meta.com) před publikací. Přidat monitoring na RAM availability analytics u hardwarových productů.

### [medium] Breaking news o InsightFinder procesován bez faktické verifikace

Agent zpracoval a publikoval article o InsightFinder fundraisingu za $15M (16.4.2026). Zpráva byla klasifikována jako breaking_news_processed bez prior fact-check procesu. Riziko publikace neověřené informace.

Prevence: Implementuj mandatory fact-check middleware pro breaking_news_processed events. Požaduj alespoň jednu nezávislou verifikaci zdroje (officialní PR, press release, SEC filing) před publikací. Přidej timeout/cooldown pro high-velocity news.

## 🔄 refactor (4)

### [medium] ToolCard props přes frontmatter (bypass RSC serialization bug)

RSC serializace zahazuje komplexní JSX props (rating=0.0 → undefined). Fix: props uložit do MDX frontmatter, ToolCard je čte přes useSearchParams().

### [medium] Batch GitHub commits → jeden Vercel build místo N buildů

Každý commit spouštěl Vercel build. Při 5 článcích = 5 buildů = 20 min. Fix: Git Tree API → jeden commit pro všechny soubory.

### [medium] CZ-only pipeline (EN odstraněna)

EN verze webu zrušena, agent přepsán na CZ-only. Scheduler job names přejmenovány. LOCALES = ['cz'].

### [high] Sekvenční psaní článků → 3 témata = 75 min čekání

for topic in approved_topics smyčka psala články sekvenčně. Fix: asyncio.gather() s _WRITE_SEMAPHORE(3) → 3 články paralelně = ~25 min.

## 🔍 observability (3)

### [high] TROUBLESHOOTING.md → systematizace 40+ pitfalls pro rychlejší incident triage

Agent trval na řešení fragmentovaných incidentů bez centralizované příručky. Commit zavedl TROUBLESHOOTING.md s 40+ symptom→fix mappings (Python agent, Next.js, MDX, deployment). Každý entry má diagnosis a prevention step. Přidán 6-krokový debug workflow pro triage. Snižuje MTTR (mean time to resolution) a edukuje tým.

Prevence: Udržuj TROUBLESHOOTING.md aktualizované po každém novém incidentu. Nové příspěvky musí následovat symptom→diagnosis→fix→prevention šablonu. Zaměřuj se na root cause, ne jen na workaround. Scheduler + deployment items měj v sync s Railway/Vercel CI/CD změnami.

### [high] Silent pipeline: Telegram alerts → logs only, daily summary místo flood

Editorial pipeline (QG rewrite, editor review, SEO, fact-check) posílal Telegram alert na každou chybu. Při timeoutech nebo retry-failures to spammovalo chat. Refactor: všechny send_alert() → log only, nový daily summary report (1× denně s počtem publikovaných článků, learnings, failed_count >= 3 trigger extra alert).

Prevence: Nastavit centrální observability pattern: timeouty a retry-failures nejsou kritické → log, jen user-facing chyby (hard-fail rejection, fact-check blokáda, SEO veto) → Telegram. Agregovat denní report místo real-time flood. Sledovat failed_count a alertovat jen pokud >= 3 failury za den.

### [high] Vercel build failures jsou invisible pro Railway agenta → žádný error_log → žádný learning

Agent vidí jen GitHub API response (201 OK), ne Vercel deployment result. Kritické build failures neprojdou do error_logu — incident 17.4.2026 zůstal 4h bez alertu. TODO: přidat Vercel deployment webhook listener nebo post-commit health check.

## 📄 mdx_syntax (3)

### [high] ToolLink komponenta chybí v MDX - GitHub validation selhala

Agent add_tool_links zpracovával článek o Meta Quest cenách (slug: meta-raises-quest-3...). GitHub validation detekovala, že v MDX chybí povinná <ToolLink> komponenta. Článek (193 slov) byl zpracován, ale validation blokovala commit.

Prevence: Přidat validaci MDX template před procesem add_tool_links - zkontrolovat, zda obsah obsahuje relevantní tool/product links podle guidelines. Případně přidat fallback ToolLink pro technické články. Aktualizovat error message pro jasnost, kterou ToolLink konkrétně chybí.

### [high] Dynamická color map blokovala Tailwind scanning → hardcoded třídy

3-úrovňové rozřazení mělo nefunkční layout: dynamická LEVEL_COLOR_MAP bránila Tailwindu scanovat CSS třídy (purge), navíc surface-300/400/500/600/700 nebyly v tailwind.config.ts. Výsledkem byly no-op třídy a rozbitý design.

Prevence: Vyhnout se dynamickým color mapám v produkčním kódu. Tailwind scanning vyžaduje staticko detekované třídy. Hardcoded třídy (green-*, violet-*, amber-*) se vždy scanují. Vždy rozšířit tailwind.config.ts o všechny potřebné color palety (300–700 rozsah). Při změnách design systému verifikovat config.

### [critical] MDX frontmatter wrapped in yaml code fences → Vercel build crash, category undefined → web 404

Breaking news job 16.4.2026 20:15 commitnul insightfinder.mdx s ```yaml fences wrapping frontmatteru. GitHub API přijal, Vercel build padl na generateStaticParams — .toLowerCase() on undefined category. Web 404 od 02:39 do 06:38. Fix: sanitizer _strip_code_fences() + validate_mdx_frontmatter() v github_tool.py před každým commitem. 12 unit testů v tests/test_mdx_validation.py.

## 📊 content_strategy (2)

### 🟦 [low] TODO: nejlepsi-prompty-pro-chatgpt vs nejlepsi-otazky-pro-chatgpt — manual review

Semantic audit 19.4.2026: similarity 0.72-0.75, same_topic=true. Haiku oscilluje mezi merge_into_B a keep_both napříč běhy. A (prompty) = širší srovnání AI nástrojů. B (otázky) = 50+ konkrétních příkladů.

Prevence: Posoudit manuálně zda tématický rozdíl (prompty framework vs hotové otázky) odůvodňuje dva články, nebo mergnout do jednoho pillar. Odloženo na review session.

### [low] TODO: bakalářská vs diplomová práce články — keep_both kvůli SEO

Semantic audit 19.4.2026: nejlepsi-ai-pro-psani-bakalarske-prace-2026 vs nejlepsi-ai-pro-psani-diplomove-prace-2026 mají similarity 0.75 (Haiku), same_topic=true — identický obsah (AI pro akademické práce). Haiku doporučil merge_into_A.

Prevence: NEMERGOVAT. Ponechat samostatné kvůli SEO keyword diferenciaci (bakalářka vs diplomka jsou samostatné search queries s různou intencí). Alternativa: vytvořit pillar /ai-pro-akademicke-prace a z obou udělat děti.

## 🤖 agent_behavior (2)

### [medium] add_tool_links: 1 chyba při zpracování 3 nástrojů, processed/errors mismatch

Agent add_tool_links zpracoval 2 z 3 nástrojů (progress 3/3), ale nahlásil 1 chybu. Mismatch mezi processed=2 a errors=1 naznačuje, že jeden nástroj selhal. Čas: 2026-04-19T06:38:25.

Prevence: Přidat do add_tool_links logovací detail: který konkrétní tool selhal a proč. Implementovat validation: jestliže progress == 3 a processed < 3, logovat warning se seznamem failovaných tools. Přidat retry mechanismus pro jednotlivé nástroje.

### [high] send_drafts_review: sekvenční čekání → asyncio.gather paralelní odesílání

Pipeline čekal 24h na schválení každého článku sekvenčně. Druhý a další články se nikdy neodeslaly do Telegramu, protože se čekalo na odpověď na první. Martin videl jen první draft, zbývající se ztratily v toku.

Prevence: Použij asyncio.gather() pro paralelní odesílání všech review zpráv najednou. Každá zpráva poluje DB nezávisle, Martin vidí všechny drafty současně a může schvalit v libovolném pořadí bez zablokování pipeline.

---

## Appendix — Jak použít v novém projektu

1. **Před implementací oblasti** — najdi kategorii + projdi relevantní záznamy
2. **Při debugování** — grep `description` podle symptomu
3. **Pre-flight před launchem** — projdi 'Top 10 most costly'
4. **Týdně první měsíc** — porovnej nové learnings z `intelligent_learning_extractor` s tímto katalogem. Opakující se learnings = systémový problém.

*Snímek k 2026-04-21, 85 záznamů. Nový projekt inheritne katalog, časem bude mít vlastní.*
