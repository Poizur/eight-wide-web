# TROUBLESHOOTING.md — Kritické pasti a jejich fixy
*Stav: 2026-04-19 | Zdroj: project_learnings + incidenty z Fází 0–17*

> Každá past: **symptom → diagnóza → fix → prevence**. Pro nový projekt:
> projít před launchem; během provozu: grep podle symptomu.

---

## A. Python agent (FastAPI + APScheduler)

### A1. `asyncio.Future` zemře při Railway restartu
**Symptom:** Po push nový deploy restartuje kontejner. Všechny approval flows "visí", Telegram callbacks nic nedělají. Před restartem fungovalo.

**Diagnóza:** `asyncio.Future` je in-memory. Kontejner umře → Future zmizí → pending `.set_result()` callbacks jsou ztracené.

**Fix:** Multi-step flows **musí** mít persistentní state. Ukládej do `agent_decisions` tabulky (Supabase). Background task pollí DB místo čekání na Future:
```python
# ❌ SPATNE
future = asyncio.Future()
_pending[message_id] = future
result = await future

# ✅ SPRÁVNĚ
db.table("agent_decisions").insert({"decision_type": "pending_approval", ...}).execute()
# v pollovacím loopu:
while True:
    row = db.table("agent_decisions").select("*").eq("id", id).eq("approved", True).execute()
    if row.data: break
    await asyncio.sleep(5)
```

**Prevence:** Olovinové pravidlo: **no in-memory state pro multi-step flows na kontejnerových platformách** (Railway, Fly.io, Heroku, …).

---

### A2. `time.sleep()` v async funkci zmrazí celý server
**Symptom:** FastAPI přestane odpovídat na `/health`, Telegram callbacks se akumulují.

**Diagnóza:** `time.sleep()` je blocking. Zablokuje celý event loop.

**Fix:**
```python
# ❌
time.sleep(60)
# ✅
await asyncio.sleep(60)
```

**Prevence:** Grep repo: `grep -rn "time.sleep" .` před každým releasem.

---

### A3. Blocking I/O v async = freeze
**Symptom:** Requesty náhle pomalé (> 30s), ale CPU idle.

**Diagnóza:** Supabase python client, `requests`, `httpx.Client`, pytrends, DuckDuckGo — všechny jsou **synchronní**. Volání v async funkci blokuje event loop.

**Fix:**
```python
# ❌
result = supabase.table("articles").select("*").execute()
# ✅
result = await asyncio.to_thread(lambda: supabase.table("articles").select("*").execute())
```

**Prevence:** Audit všech agent modulů — každé external I/O volání musí být v `to_thread`.

---

### A4. `asyncio.to_thread()` bez `wait_for()` visí donekonečna
**Symptom:** `propose_topics` job běží hodiny, žádná chybová hláška.

**Diagnóza:** pytrends a DDG HTTP requesty v thread pool workers se zaseknou, SIGALRM nefunguje v threadu (jen main), `@timeout(N)` dekorátor je no-op.

**Fix:**
```python
# ❌
result = await asyncio.to_thread(fetch_trends)
# ✅
result = await asyncio.wait_for(
    asyncio.to_thread(fetch_trends),
    timeout=300,
)
```

**Prevence:** **Každé** `asyncio.to_thread()` zabalit do `asyncio.wait_for`.

---

### A5. APScheduler vyžaduje `async def` wrappery
**Symptom:** Job ID zobrazen v `/health`, ale nic se nespouští. Žádné logy.

**Diagnóza:** `def _job()` (sync) registrovaný v `AsyncIOScheduler` = tichý fail. APScheduler neumí spustit sync funkci v async scheduleru.

**Fix:**
```python
# ❌
def _my_job():
    asyncio.run(my_async_fn())   # nová event loop = deadlock

# ✅
async def _my_job():
    await my_async_fn()

scheduler.add_job(_my_job, ...)
```

**Prevence:** Všechny wrappery v `scheduler/jobs.py` pojmenuj `_job_name_job` a musí začínat `async def`.

---

### A6. `str.format()` + JSX/šablona s `{}`
**Symptom:** Python `KeyError` při psaní článku.

**Diagnóza:** `template.format(**data)` interpretuje `{` v JSX jako placeholder.

**Fix:**
```python
# ❌
template = "<ToolLink tool='{tool}' />".format(tool=slug)
# ✅ (double-braces pro literální)
template = "<ToolLink tool='{{tool}}' />"  # v šabloně
# nebo
template = f"<ToolLink tool='{slug}' />"   # f-string místo .format()
```

**Prevence:** Vždy testovat lokálně před commitem. F-string je bezpečnější pro generované MDX.

---

### A7. Railway restart zabíjí BackgroundTasks
**Symptom:** `POST /admin/full-cycle` vrátí 200, ale článek se v DB neobjeví. Po git push uprostřed běhu.

**Diagnóza:** Git push → Railway restart → běžící FastAPI `BackgroundTasks` zabity mid-flow. Žádný error log.

**Fix:**
1. Po každém push **počkat 90s** před triggerem endpointu.
2. Progress checkpointovat do DB (`agent_decisions`), ne jen in-memory.

```python
# ✅ každý krok pipeline uloží progress
db.table("agent_decisions").upsert({
    "decision_type": "pipeline_progress",
    "payload": {"slug": slug, "step": "seo_done"},
}).execute()
```

**Prevence:** Dokumentovat v CLAUDE.md a automation scriptech: "Po git push vždy čekat 90s".

---

### A8. Supabase singleton — nepoužívat nový client
**Symptom:** Connection pool exhausted, DB queries pomalé.

**Fix:** Vždy `get_client()` z `database/supabase_client.py`. Nikdy nový `create_client()` v každé funkci.

---

### A9. `articles_status_check` constraint striktní
**Symptom:** `DB error 23514: articles_status_check violation` při pokusu nastavit `fact_check_failed` status.

**Fix:** SQL migrace:
```sql
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check
    CHECK (status IN (
        'draft', 'approved', 'published', 'rejected',
        'archived', 'review', 'fact_check_failed'
    ));
```

**Prevence:** Seznam povolených statusů v CLAUDE.md. Každý nový status = SQL migrace.

---

### A10. Python f-string backslash escape → Railway silent fail
**Symptom:** Git push → Railway dashboard ukazuje FAILED, ale `/health` funguje. Nový kód se neaktivoval.

**Diagnóza:** `\"` uvnitř f-string výrazu (`{"..."}`) není povoleno. Python syntax error, ale Railway runtime pokračuje se starou verzí.

**Fix:**
```python
# ❌
log = f"Found {len([a for a in articles if a[\"status\"] == 'published'])}"
# ✅
pub = [a for a in articles if a["status"] == "published"]
log = f"Found {len(pub)}"
```

**Prevence:** Pre-commit hook: `python -c "import ast; ast.parse(open('main.py').read())"`.

---

## B. Next.js web (Vercel)

### B1. `useSearchParams()` bez `<Suspense>` → build failure
**Symptom:** Vercel build padá s error: "useSearchParams should be wrapped in a suspense boundary".

**Fix:**
```tsx
// app/page.tsx (server)
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
```

**Prevence:** Každý client component s `useSearchParams` MUSÍ být v `<Suspense>`. `tsc --noEmit` tuto chybu nechytí — zachytí ji až Vercel build.

---

### B2. `React.ReactNode` bez `import React`
**Symptom:** TypeScript build error: "Cannot find namespace 'React'".

**Fix:**
```tsx
// ❌
function Comp({ children }: { children: React.ReactNode }) { ... }
// ✅
import { ReactNode } from "react";
function Comp({ children }: { children: ReactNode }) { ... }
```

**Prevence:** `tsc --noEmit` před každým commitem.

---

### B3. next-mdx-remote RSC — `array`/`number` props nezaserializují
**Symptom:** MDX komponenta dostane `undefined` místo čísla nebo pole v props.

**Fix:** Data patří do YAML frontmatter, ne do JSX props:
```mdx
// ❌
<Component items={[1,2,3]} count={5} />

// ✅ ve frontmatter:
---
items: [1, 2, 3]
count: 5
---
// pak přes props z page:
<Component {...frontmatter} />
```

---

### B4. MDX truncation při nízkém `max_tokens`
**Symptom:** Vercel build padá, log ukazuje JSX parse error "Unexpected end of input".

**Fix:** `max_tokens=16000` pro psaní článků + post-generation validace:
```python
def _detect_mdx_truncation(mdx: str) -> bool:
    # Unclosed JSX tags
    opens = len(re.findall(r"<(?!\/)[\w]+", mdx))
    closes = len(re.findall(r"</[\w]+>|<[\w]+[^>]*\/>", mdx))
    return abs(opens - closes) > 2
```

---

### B5. Vercel build failure je tichý (před Fází 13)
**Symptom:** Web ukazuje staré verze, commit je v GitHub, ale Vercel neaktualizuje.

**Fix:** Observability přes webhook:
```python
@app.post("/webhooks/vercel")
async def vercel_webhook(request: Request):
    # ... HMAC check
    if payload.get("type") == "deployment.error":
        await log_error_async(agent_name="vercel_deployment", ...)
```

**Prevence:** Po push: curl `https://<domain>` za 3 min, nebo check webhook error_log.

---

### B6. `@ts-expect-error` v strict TS
**Symptom:** TS build: "Unused '@ts-expect-error' directive".

**Fix:** Odstraň komentář — chyba byla opravena jinde.

---

### B7. `Uint8Array<ArrayBufferLike>` incompatibility
**Symptom:** TypeScript `PushSubscriptionOptionsInit.applicationServerKey` neakceptuje `Uint8Array` output z `urlBase64ToUint8Array()`.

**Fix:** Použij string přímo:
```tsx
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,  // string
});
```

---

## C. MDX a GitHub commit flow

### C1. MDX YAML code fences → Vercel build crash
**Symptom:** Web 404 na nově publikovaném článku. Vercel build log: `Cannot read properties of undefined (reading 'toLowerCase')`.

**Diagnóza:** LLM někdy wrapuje frontmatter do ` ```yaml fences`. MDX parser ignoruje frontmatter → `category` undefined v `generateStaticParams`.

**Fix:** Sanitizer před commit:
```python
def _strip_code_fences(mdx: str) -> str:
    """Remove ```yaml fences around frontmatter."""
    return re.sub(r"^```(?:yaml)?\s*(---.*?---)\s*```", r"\1", mdx, flags=re.DOTALL)

def validate_mdx_frontmatter(mdx: str) -> None:
    if not mdx.startswith("---"):
        raise ValueError("MDX has no frontmatter (missing leading ---)")
    # YAML parse check
    yaml.safe_load(mdx.split("---", 2)[1])
```

**Prevence:** Unit test `tests/test_mdx_validation.py` s 12+ edge cases. Volat validator před každým `commit_mdx_article`.

---

### C2. Unquoted `coverImage` URL s `&` → YAML parser crash
**Symptom:** Vercel build: "expected sequence item but got anchor".

**Diagnóza:** YAML parser interpretuje `&` jako anchor sigil. `coverImage: https://...&cs=tinysrgb` = broken.

**Fix:** Vždy quote URL:
```yaml
coverImage: "https://images.pexels.com/photos/123/pexels-photo-123.jpeg?auto=compress&cs=tinysrgb"
```

**Prevence:** Sanitize v `github_tool.py` před commitem — escape URLs.

---

### C3. DB/GitHub content drift
**Symptom:** `reprocess_all_published` používá staré MDX; změny z `add_tool_links` se "vrátí".

**Diagnóza:** 5 flow updatovalo GitHub bez DB update. `articles.content` zůstalo staré.

**Fix:** Každý flow který updatuje GitHub MUSÍ updatovat DB:
```python
# 1. Snapshot old
await save_content_snapshot(aid, slug, old_content, source="my_flow")
# 2. Commit to GitHub
commit_mdx_article(slug, new_content, "cz")
# 3. UPDATE DB
db.table("articles").update({"content": new_content, ...}).eq("id", aid).execute()
```

**Prevence:** Code review checklist: "Update-flow touches GitHub? Then UPDATE articles.content + snapshot."

---

### C4. 5 % full delta tolerance maskuje prose compression
**Symptom:** Full MDX delta < 5 %, ale text článku má kompresi 10 % (protože CTA-box přidal slova navíc → offset prose drop).

**Fix:** Separátní prose word count (bez CTA boxes):
```python
def _prose_word_count(mdx: str) -> int:
    # Strip CTA boxes + MDX components
    stripped = re.sub(r"<\w+[\s\S]*?</\w+>", "", mdx)
    return len(stripped.split())

def validate_tool_links_preservation(old: str, new: str, slug: str) -> None:
    old_prose = _prose_word_count(old)
    new_prose = _prose_word_count(new)
    delta = abs(old_prose - new_prose) / old_prose
    tolerance = 0.10 if old_prose < 500 else 0.02 if old_prose < 1500 else 0.01
    if delta > tolerance:
        raise ValueError(f"prose_compression: {old_prose}→{new_prose} (Δ {delta:.1%})")
```

---

### C5. Pexels photoshoot cluster dominance
**Symptom:** 14+ článků sdílí identický photoshoot (DeepSeek 30530406–30530414) přes 6 různých queries.

**Diagnóza:** Pexels pro "ai/chatbot/technology" queries vrací 10–20 fotek z jednoho photoshoot jako top.

**Fix:** Blacklist + fallback:
```python
PEXELS_BLACKLIST_IDS: set[int] = {30530406, ..., 30530414}

photos = [p for p in response_photos if p["id"] not in PEXELS_BLACKLIST_IDS]
if not photos:
    return None  # caller falls to Unsplash
```

**Prevence:** `/admin/backfill-cover-images?only_duplicates=true` měsíčně. Rozšiřovat blacklist podle dominantních clusterů.

---

### C6. Orphan MDX bez DB row
**Symptom:** Článek existuje v GitHub repo, ale chybí v `articles` tabulce. `reprocess_all_published` ho přeskočí.

**Fix:** Registrace endpoint:
```python
@app.post("/admin/articles/register-orphan")
async def register_orphan(slug: str):
    mdx = get_file_content(f"content/cz/{slug}.mdx")
    fm = parse_frontmatter(mdx)
    db.table("articles").insert({
        "slug": slug, "title": fm["title"], "content": mdx,
        "status": "published", "locale": "cz",
    }).execute()
    await save_content_snapshot(row_id, slug, mdx, source="orphan_register")
```

---

### C7. Ghost DB rows (DB-only articles)
**Symptom:** `articles` row s `status='published'`, ale MDX v GitHubu neexistuje. Web vrací 404.

**Fix:** Sweeper:
```python
for a in db_rows:
    if not github_file_exists(f"content/cz/{a['slug']}.mdx"):
        await save_content_snapshot(a["id"], a["slug"], a["content"], "pre_archive_ghost")
        db.table("articles").update({"status": "archived"}).eq("id", a["id"]).execute()
```

---

### C8. Breaking news pod 250w nemá prostor pro CTA
**Symptom:** ToolLink CTA-box injection breakne layout nebo selže tolerance check.

**Fix:** Separátní flow:
1. < 250w: pouze 1–2 inline `<ToolLink>` bez CTA-box
2. `breaking_news_followup` 48h pozdě: `expand_article()` na 1800+ slov, pak přidat CTA-box

---

## D. Dedup a content strategy

### D1. Jaccard 0.50 nestačí pro semantic duplicity
**Symptom:** "Jak začít s ChatGPT" vs "Jak začít používat ChatGPT" — Jaccard 0.66 projde, ale articles jsou 92 % identické.

**Fix:** Dvoufázový check:
```python
# 1. Jaccard prefiltr (levný)
pairs = [(i, j, jac) for ... if jac > 0.3]
# 2. Haiku judge na top-20 (přesný)
for i, j, _ in pairs[:20]:
    verdict = await haiku_judge(articles[i], articles[j])
    if verdict["same_topic"] and verdict["similarity"] > 0.85:
        flag_for_merge(i, j)
```

**Prevence:** `/admin/semantic-duplicity-audit` měsíčně.

---

### D2. Overfitting na malém batchi (Haiku judge)
**Symptom:** Intelligent extractor odmítá 100 % kandidátů z prvních 5 dnů jako "duplicate".

**Diagnóza:** Haiku porovnává s prázdným/malým existing listem — vše vypadá unikátní nebo vše vypadá duplicitní podle prompt framingu.

**Fix:** Grace period — první 7 dní `fuzz_threshold=98` (jen near-identical), potom 95.

---

## E. Scheduler a deploy

### E1. Po-Pá vs denní joby
**Symptom:** Víkendové články se negenerují.

**Fix:** Explicit `day_of_week="mon-fri"` vs `*`:
```python
# Pracovní dny:
CronTrigger(hour=2, minute=30, day_of_week="mon-fri")
# Každý den:
CronTrigger(hour=3, minute=0)
```

---

### E2. Supabase free plan DDL limitations
**Symptom:** `POST /admin/run-migration` vrátí 403 Forbidden pro `CREATE TABLE`.

**Fix:** Spustit SQL ručně v Supabase SQL Editor (viz STARTER_KIT.md sekce 7). Automatický DDL jde jen na Pro plánu.

---

### E3. Multi-file commit vs N commitů (Vercel billing)
**Symptom:** 62 cover-backfill commitů = 62 Vercel builds = 62× billable build minutes.

**Fix:** Batch commits přes local git clone:
```bash
cd /tmp/web-clone
# ... make all file changes
git commit -m "batch: backfill N items"
git push
# Jeden Vercel build
```

Alternativně: endpoint s `skip_github=true` flag, caller dělá batch commit sám.

---

## F. Pracovní flow

### F1. Nikdy nepushovat do obou repozitářů zároveň bez TS check
```bash
cd /tmp/web-clone && node_modules/.bin/tsc --noEmit
```
Pokud projde → push oba.

### F2. Railway credentials nejsou lokálně
Pro DB queries z lokálu: volat Railway endpointy. Žádný lokální `.env` soubor neexistuje.

### F3. Vercel + Railway deploy times
- Vercel: ~2–3 min
- Railway: ~60–90s

Po push čekat delší z nich před voláním.

---

## G. Fáze 16 — Quality Reviewer

### G1. Příliš přísný APPROVE threshold → retry loop
**Symptom:** 80% článků jde na REVISE, pipeline 2–4× delší.

**Fix:** Benevolentní threshold v prvních 3 měsících (APPROVE ≥ 42), strict later (≥ 48).

### G2. Editor retry zhorší článek
**Symptom:** Po REVISE retry score klesne.

**Diagnóza:** Editor "překombinuje" podle reviewer feedback a naruší tok.

**Fix:** Max 1 retry. Pokud po retry < threshold → accept anyway (better shipped than perfect).

---

## H. Fáze 17 — Covers & Duplicity

### H1. Backfill bez snapshot = nevratné
**Symptom:** Po failed cover backfill nelze vrátit původní cover.

**Fix:** Snapshot **před** UPDATE v `article_content_history`.

### H2. 301 vs 308 redirect
**Symptom:** Google SEO team říká "use 301"; Next.js vrací 308.

**Diagnóza:** Next.js `permanent: true` = HTTP 308. 308 je sémanticky ekvivalent 301 (permanent). Google respektuje 308.

**Fix:** Ponech 308. Pro explicit 301: `statusCode: 301`.

---

## Appendix — Debug workflow

Když se "něco" rozbije:

1. **`GET /health`** — scheduler jobs present?
2. **`GET /debug/articles`** — last 20 articles status OK?
3. **`GET /admin/error-log?hours=2`** — error spikes?
4. **Git log web repo** — last 10 commits, Vercel status?
5. **`curl -sI https://<domain>/<slug>`** — HTTP status OK?
6. **Vercel build logs** — pokud bod 5 fails.

90 % incidentů spadne do jedné z pastí výše.
