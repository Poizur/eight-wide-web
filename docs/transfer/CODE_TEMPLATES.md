# CODE_TEMPLATES.md — Copy-paste snippety pro nový projekt
*Všechny doména-agnostic, s `{{placeholders}}` | Testováno na {{PROJECT_DOMAIN}}*

> Každý snippet je kompletní (včetně imports). Po zkopírování nahraď
> `{{TOPIC}}`, `{{DOMAIN}}`, `{{AFFILIATE_TYPE}}` a další placeholders za
> konkrétní hodnoty pro svůj projekt.

---

## Obsah

- [1. Python — Anthropic client wrapper](#1-python--anthropic-client-wrapper)
- [2. Python — Agent template (Sonnet + Haiku pattern)](#2-python--agent-template-sonnet--haiku-pattern)
- [3. Python — APScheduler async job template](#3-python--apscheduler-async-job-template)
- [4. Python — Quality Reviewer pattern (JSON output)](#4-python--quality-reviewer-pattern-json-output)
- [5. Python — Webhook listener s HMAC validation](#5-python--webhook-listener-s-hmac-validation)
- [6. Python — DB/GitHub sync helper](#6-python--dbgithub-sync-helper)
- [7. Python — Safety net pattern (error rate threshold)](#7-python--safety-net-pattern-error-rate-threshold)
- [8. Python — Intelligent extractor (rapidfuzz + Haiku judge)](#8-python--intelligent-extractor-rapidfuzz--haiku-judge)
- [9. Python — Content pipeline step template](#9-python--content-pipeline-step-template)
- [10. TypeScript — ToolLink MDX komponenta](#10-typescript--toollink-mdx-komponenta)
- [11. TypeScript — Affiliate tracking route handler](#11-typescript--affiliate-tracking-route-handler)
- [12. TypeScript — Sitemap dynamic generator](#12-typescript--sitemap-dynamic-generator)
- [13. TypeScript — Push notification subscription](#13-typescript--push-notification-subscription)

---

## 1. Python — Anthropic client wrapper

```python
# tools/anthropic_client.py
"""
Anthropic API wrapper with exponential backoff and rate limiting.
Use this instead of calling anthropic.Anthropic() directly.
"""
import time
import anthropic
from loguru import logger
from config import config

_RETRY_DELAYS = [5, 15, 30, 60]  # seconds between retries


def call_claude(
    messages: list[dict],
    system: str = "",
    model: str | None = None,
    max_tokens: int = 4096,
    timeout: float = 120.0,
) -> str:
    """
    Call Claude API with automatic retry on rate limits and transient errors.
    Returns the text response string. Raises after all retries exhausted.
    """
    client = anthropic.Anthropic(
        api_key=config.ANTHROPIC_API_KEY,
        timeout=timeout,
    )
    used_model = model or config.CLAUDE_SONNET

    for attempt, delay in enumerate([0] + _RETRY_DELAYS):
        if delay:
            logger.warning(f"Claude retry {attempt}/{len(_RETRY_DELAYS)}, waiting {delay}s")
            time.sleep(delay)
        try:
            kwargs: dict = {"model": used_model, "max_tokens": max_tokens, "messages": messages}
            if system:
                kwargs["system"] = system
            response = client.messages.create(**kwargs)
            return response.content[0].text
        except anthropic.RateLimitError as e:
            logger.warning(f"Rate limit: {e}")
            if attempt == len(_RETRY_DELAYS):
                raise
            time.sleep(_RETRY_DELAYS[min(attempt, len(_RETRY_DELAYS) - 1)] * 2)
        except anthropic.APIStatusError as e:
            if e.status_code in {500, 502, 503, 529}:
                if attempt == len(_RETRY_DELAYS):
                    raise
            else:
                raise  # 400/401/403 = non-retryable
        except anthropic.APIConnectionError as e:
            if attempt == len(_RETRY_DELAYS):
                raise

    raise RuntimeError("Claude API failed after all retries")


def call_claude_haiku(messages: list[dict], system: str = "", max_tokens: int = 1024) -> str:
    """Convenience wrapper using Haiku for fast/cheap tasks (judges, extractors)."""
    return call_claude(messages, system=system, model=config.CLAUDE_HAIKU, max_tokens=max_tokens)
```

**Co upravit:** `config.CLAUDE_SONNET` a `config.CLAUDE_HAIKU` v `config.py` na aktuální model IDs.

---

## 2. Python — Agent template (Sonnet + Haiku pattern)

```python
# agents/my_agent.py
"""
Example agent: combines Sonnet (heavy work) + Haiku (judge/filter).
Pattern: Haiku filters candidates cheaply, Sonnet generates expensive output.
"""
import asyncio
from loguru import logger
from tools.anthropic_client import call_claude, call_claude_haiku
from database.supabase_client import get_client


_SYSTEM_AGENT = """
Jsi {{ROLE}} pro {{TOPIC}}.

PRAVIDLA:
- {{RULE_1}}
- {{RULE_2}}

VÝSTUP: {{OUTPUT_FORMAT}}
"""


async def generate_content(topic: str) -> str:
    """Main generation (Sonnet)."""
    messages = [{"role": "user", "content": f"Téma: {topic}"}]
    return await asyncio.to_thread(
        call_claude, messages, system=_SYSTEM_AGENT, max_tokens=16000
    )


async def filter_candidates(items: list[dict]) -> list[dict]:
    """Cheap pre-filter (Haiku)."""
    if not items:
        return []
    prompt = f"Z následujících {len(items)} kandidátů vyber relevantní:\n\n"
    for i, it in enumerate(items):
        prompt += f"{i}. {it.get('title')}\n"
    prompt += "\nVrať čárkami oddělená čísla kandidátů."

    raw = await asyncio.to_thread(
        call_claude_haiku,
        [{"role": "user", "content": prompt}],
        system="Jsi rychlý filter. Vrať jen čísla oddělená čárkami.",
        max_tokens=256,
    )
    try:
        indices = {int(x.strip()) for x in raw.split(",") if x.strip().isdigit()}
    except Exception:
        return items  # fail-open
    return [it for i, it in enumerate(items) if i in indices]


async def run_agent(topic: str) -> dict:
    """Orchestrace: load → filter → generate → save."""
    db = get_client()
    candidates = db.table("items").select("*").limit(20).execute().data or []
    filtered = await filter_candidates(candidates)
    content = await generate_content(topic)
    db.table("outputs").insert({"topic": topic, "content": content}).execute()
    return {"ok": True, "content_length": len(content)}
```

**Co upravit:** `_SYSTEM_AGENT` prompt, tabulky v DB, filter logic.

---

## 3. Python — APScheduler async job template

```python
# scheduler/jobs.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from loguru import logger

DISABLED_JOBS = {
    # Job IDs, které se nebudou registrovat
    "legacy_job_1",
}


async def _write_drafts_job():
    """APScheduler CAN ONLY CALL async wrappers. Never mix sync/async!"""
    try:
        from agents.ceo_agent import write_approved_drafts
        await write_approved_drafts()
    except Exception as e:
        logger.exception(f"write_drafts_job failed: {e}")
        # Telegram alert for critical jobs only
        from tools.telegram_tool import send_alert
        await send_alert(f"❌ write_drafts crashed: {e}")


def build_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="Europe/Prague")

    # Daily job Monday-Friday at 02:30
    if "write_drafts" not in DISABLED_JOBS:
        scheduler.add_job(
            _write_drafts_job,
            CronTrigger(hour=2, minute=30, day_of_week="mon-fri"),
            id="write_drafts",
            name="Content: write drafts (02:30)",
            max_instances=1,              # prevent double-run
            coalesce=True,                # skip missed if still running
            misfire_grace_time=3600,      # 1h grace period after system wake
        )

    # Every 4 hours, 8:15–20:15 (working hours)
    # if "breaking_news" not in DISABLED_JOBS:
    #     scheduler.add_job(
    #         _breaking_news_job,
    #         CronTrigger(hour="8,12,16,20", minute=15, day_of_week="mon-fri"),
    #         id="breaking_news", max_instances=1, coalesce=True,
    #     )

    logger.info(f"Scheduler: {len(scheduler.get_jobs())} jobs registered")
    return scheduler
```

**Co upravit:** časy, jmenné ID, mapování na agent funkce.

**Kritické:** `max_instances=1` a `coalesce=True` pro všechny joby které nesmí překryvat.

---

## 4. Python — Quality Reviewer pattern (JSON output)

```python
# agents/quality_reviewer.py
"""
Soft editorial gate — Claude Sonnet, 6 dimenzí × 0-10 = max 60.
APPROVE ≥48, REVISE 36-47 (1 retry), REJECT <36.
"""
import json
import re
from dataclasses import dataclass, field
from loguru import logger
from tools.anthropic_client import call_claude


@dataclass
class QualityResult:
    total: int
    verdict: str               # 'APPROVE' | 'REVISE' | 'REJECT'
    dimensions: dict = field(default_factory=dict)
    feedback: str = ""
    raw: str = ""


_DIMENSIONS = ["hook", "originalita", "autenticita", "priklady", "hodnota", "{{LANGUAGE}}"]


_SYSTEM_REVIEWER = """
Jsi editorial reviewer pro {{TOPIC}} magazín.

Hodnotíš článek v 6 dimenzích (každá 0-10):
1. Hook — úvodní věta překvapí nebo zneklidní
2. Originalita — není recyklace generik
3. Autenticita — osobní úhel, konkrétní data
4. Příklady — konkrétní scénáře, čísla
5. Hodnota — čtenář odchází s čím
6. {{LANGUAGE}} — bez strojových frází, 12 zakázaných frází

VÝSTUP (striktní JSON):
{
  "dimensions": {"hook": N, "originalita": N, ...},
  "feedback": "stručně proč",
  "total": SUM
}
"""


def _strip_json_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.MULTILINE).strip()
    return t


def _derive_verdict(total: int) -> str:
    if total >= 48:
        return "APPROVE"
    if total >= 36:
        return "REVISE"
    return "REJECT"


async def review_article(mdx_content: str, title: str = "") -> QualityResult:
    import asyncio
    user_msg = f"Title: {title}\n\nČlánek:\n{mdx_content[:15000]}"

    raw = await asyncio.to_thread(
        call_claude,
        [{"role": "user", "content": user_msg}],
        system=_SYSTEM_REVIEWER,
        max_tokens=1500,
    )

    try:
        parsed = json.loads(_strip_json_fences(raw))
        total = int(parsed.get("total", 0))
        return QualityResult(
            total=total,
            verdict=_derive_verdict(total),
            dimensions=parsed.get("dimensions", {}),
            feedback=parsed.get("feedback", ""),
            raw=raw,
        )
    except Exception as e:
        logger.error(f"Reviewer JSON parse failed: {e}, raw={raw[:200]}")
        return QualityResult(total=0, verdict="REVISE", raw=raw)
```

**Co upravit:** `_DIMENSIONS`, `_SYSTEM_REVIEWER` pro svůj jazyk/doménu, thresholdy verdiktu.

---

## 5. Python — Webhook listener s HMAC validation

```python
# main.py (FastAPI endpoint)
"""
Validate webhook signature BEFORE parsing payload (timing attack defense).
"""
import hmac
import hashlib
import os
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from loguru import logger


@app.post("/webhooks/{{provider}}")
async def webhook_handler(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("x-{{provider}}-signature", "")
    secret = os.getenv("{{PROVIDER}}_WEBHOOK_SECRET", "")

    if not secret:
        logger.error("Webhook secret not configured")
        raise HTTPException(503, "Webhook not configured")

    # Constant-time HMAC comparison
    expected = hmac.new(
        secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        logger.warning("Invalid webhook signature")
        raise HTTPException(401, "Invalid signature")

    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Webhook invalid JSON: {e}")
        return JSONResponse(200, {"ok": False})  # Always 200 (retry avoidance)

    # Process event
    event_type = payload.get("type")
    if event_type == "deployment.error":
        from tools.error_log import log_error_async, ERR_API_CALL
        await log_error_async(
            agent_name="{{provider}}_deployment",
            error_type=ERR_API_CALL,
            error_message=f"{payload.get('meta', {}).get('reason', 'unknown')}",
            context=payload,
        )

    return {"ok": True}
```

**Co upravit:** `{{provider}}` (vercel, resend, …), header name, secret env var.

---

## 6. Python — DB/GitHub sync helper

```python
# tools/content_history.py
"""
Snapshot DB article content before any UPDATE. Lets you revert if
generation/edit breaks content.
"""
from loguru import logger
from database.supabase_client import get_client


async def save_content_snapshot(
    article_id: str,
    slug: str,
    content: str,
    source: str,
) -> bool:
    """
    Save pre-update snapshot. Returns True on success.
    source examples: 'cover_backfill' | 'reprocess' | 'add_tool_links'
                     'duplicate_delete→<keep_slug>'
    """
    if not content or not article_id:
        return False

    try:
        db = get_client()
        import asyncio
        await asyncio.to_thread(
            lambda: db.table("article_content_history").insert({
                "article_id": article_id,
                "slug": slug,
                "content": content,
                "source": source,
            }).execute()
        )
        return True
    except Exception as e:
        logger.error(f"snapshot failed for {slug}: {e}")
        return False
```

**Use pattern:**
```python
# Before any content UPDATE:
await save_content_snapshot(art["id"], slug, old_content, source="my_flow")
db.table("articles").update({"content": new_content}).eq("id", art["id"]).execute()
```

---

## 7. Python — Safety net pattern (error rate threshold)

```python
# scheduler/jobs.py — safety net wrapper
from datetime import datetime, timedelta, timezone


async def _safety_net_job():
    """
    Runs 90 min after main pipeline. If error rate > threshold, send alert.
    Also re-tries any drafts stuck in 'approved' status.
    """
    from database.supabase_client import get_client
    from tools.telegram_tool import send_alert

    db = get_client()
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()

    # Error rate check
    errors = db.table("error_log").select("id", count="exact").gte(
        "created_at", one_hour_ago
    ).execute()
    error_count = errors.count or 0

    if error_count > 20:
        await send_alert(f"⚠️ Error rate HIGH: {error_count} errors in last hour")

    # Stuck drafts
    stuck = db.table("articles").select("id,slug").eq("status", "approved").lt(
        "created_at", one_hour_ago
    ).execute().data or []
    if stuck:
        logger.warning(f"Safety net: retrying {len(stuck)} stuck approved drafts")
        # Invoke publish flow on each...
```

---

## 8. Python — Intelligent extractor (rapidfuzz + Haiku judge)

```python
# agents/intelligent_learning_agent.py (zkrácená kostra)
"""
Two-stage dedup:
  Stage 1: rapidfuzz pre-filter (fuzz ≥ 95 → auto-reject)
  Stage 2: Haiku judge on top-20 fuzz matches
Pattern applicable to any "semantic dedup" task.
"""
import asyncio
from rapidfuzz import fuzz, process
from tools.anthropic_client import call_claude_haiku


async def haiku_judge(candidate: dict, shortlist: list[dict]) -> dict:
    """
    Ask Haiku to decide if candidate duplicates any shortlist entry.
    Returns {"is_duplicate": bool, "matched_title": str, "reason": str}.
    """
    prompt = f"""
Nový kandidát:
  Title: {candidate['title']}
  Context: {candidate.get('context', '')[:500]}

Shortlist existujících záznamů (top 20 nejpodobnějších):
{chr(10).join(f"- {s['title']}" for s in shortlist)}

Je kandidát duplikát některého z nich? VRAŤ JSON:
{{"is_duplicate": bool, "matched_title": "" | "...", "reason": "stručně"}}
"""
    raw = await asyncio.to_thread(
        call_claude_haiku,
        [{"role": "user", "content": prompt}],
        system="Jsi dedup judge. Odpovídej striktně JSON.",
        max_tokens=256,
    )
    import json, re
    try:
        txt = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE).strip()
        return json.loads(txt)
    except Exception:
        return {"is_duplicate": False, "matched_title": "", "reason": "parse failed"}


async def dedup_candidate(candidate: dict, existing: list[dict], fuzz_threshold: int = 95) -> dict:
    """Returns {"decision": 'accepted'|'rejected_fuzz'|'rejected_haiku_duplicate', ...}"""
    titles = [e["title"] for e in existing]

    # Stage 2a: rapidfuzz
    matches = process.extract(
        candidate["title"], titles, scorer=fuzz.token_sort_ratio, limit=20
    )
    top_score = matches[0][1] if matches else 0

    if top_score >= fuzz_threshold:
        return {"decision": "rejected_fuzz", "reason": f"fuzz {top_score}"}

    # Stage 2b: Haiku judge on shortlist
    shortlist = [existing[i] for (_, _, i) in matches[:20]]
    verdict = await haiku_judge(candidate, shortlist)
    if verdict["is_duplicate"]:
        return {"decision": "rejected_haiku_duplicate", "reason": verdict["reason"]}

    return {"decision": "accepted"}
```

---

## 9. Python — Content pipeline step template

```python
# agents/ceo_agent.py (zkrácená kostra)
"""
Editorial pipeline step: input=article dict, output=updated article dict.
Each step has its own timeout, logs to error_log on fail.
"""
import asyncio
from loguru import logger
from tools.error_log import log_error_async, ERR_API_CALL


async def _pipeline_step(
    name: str,
    article: dict,
    step_fn,           # callable returning coroutine
    timeout: int,
    required: bool = True,
) -> dict:
    """
    Wrap any pipeline step with timeout + error log.
    If required=False, step failure doesn't stop pipeline.
    """
    try:
        return await asyncio.wait_for(step_fn(article), timeout=timeout)
    except asyncio.TimeoutError:
        await log_error_async(
            agent_name=f"pipeline:{name}",
            error_type=ERR_API_CALL,
            error_message=f"timeout {timeout}s",
            context={"slug": article.get("slug")},
        )
        if required:
            article["_pipeline_timeout"] = True
        return article
    except Exception as e:
        logger.exception(f"{name} failed: {e}")
        await log_error_async(
            agent_name=f"pipeline:{name}",
            error_type=ERR_API_CALL,
            error_message=str(e)[:500],
            context={"slug": article.get("slug")},
        )
        if required:
            article["_pipeline_failed"] = True
        return article


# Usage:
async def run_pipeline(article: dict) -> dict:
    article = await _pipeline_step("fact_check",  article, fact_check,       timeout=120)
    article = await _pipeline_step("quality_gate",article, quality_gate_review, timeout=120)
    article = await _pipeline_step("editor",      article, edit_article,     timeout=810)
    article = await _pipeline_step("reviewer",    article, quality_review,   timeout=90)
    article = await _pipeline_step("seo",         article, seo_optimize,     timeout=90,  required=False)
    article = await _pipeline_step("learnings",   article, save_learnings,   timeout=90,  required=False)
    return article
```

---

## 10. TypeScript — ToolLink MDX komponenta

```tsx
// components/article/ToolLink.tsx
import { trackingUrl } from "@/lib/affiliate-links";
import { ReactNode } from "react";

type Variant = "inline" | "cta-box";

interface ToolLinkProps {
  tool: string;                // affiliate-links.ts key
  variant?: Variant;
  children?: ReactNode;
}

export function ToolLink({ tool, variant = "inline", children }: ToolLinkProps) {
  const href = trackingUrl(tool);

  if (variant === "cta-box") {
    return (
      <div className="my-6 rounded-lg border border-brand-200 bg-surface-50 p-5">
        <p className="mb-3 text-sm text-gray-600">
          {children ?? `Vyzkoušej ${tool}`}
        </p>
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-white"
        >
          Vyzkoušet → {tool}
        </a>
      </div>
    );
  }

  // inline
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="font-medium text-brand-600 underline hover:text-brand-700"
    >
      {children ?? tool}
    </a>
  );
}
```

```mdx
{/* In MDX: */}
Recommendation: use <ToolLink tool="{{tool_slug}}">{{display_name}}</ToolLink>.

<ToolLink tool="{{tool_slug}}" variant="cta-box">
  Nejlepší volba pro {{use_case}}.
</ToolLink>
```

---

## 11. TypeScript — Affiliate tracking route handler

```ts
// app/track/affiliate/[tool]/route.ts
import { NextResponse } from "next/server";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tool: string }> },
) {
  const { tool } = await params;
  const link = AFFILIATE_LINKS[tool];
  if (!link?.affiliateUrl) {
    return NextResponse.redirect(new URL("/nastroje", request.url), 302);
  }

  // Fire-and-forget click tracking (don't block redirect)
  const railwayUrl = process.env.NEXT_PUBLIC_RAILWAY_URL;
  if (railwayUrl) {
    fetch(`${railwayUrl}/affiliate/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool,
        source_url: request.headers.get("referer") || "",
        user_agent: request.headers.get("user-agent") || "",
      }),
      // no await — don't block
    }).catch(() => {});
  }

  return NextResponse.redirect(link.affiliateUrl, 302);
}

export const dynamic = "force-dynamic";
```

---

## 12. TypeScript — Sitemap dynamic generator

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { AI_TOOLS } from "@/lib/tools";
import { PROMPTS } from "@/lib/prompts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://{{DOMAIN}}";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/nastroje`, changeFrequency: "weekly", priority: 0.9 },
    // ... další static stránky
  ];

  const articles = await getAllArticles();
  const articlePages = articles.map((a) => ({
    url: `${base}/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const toolPages = AI_TOOLS.map((t) => ({
    url: `${base}/nastroje/${t.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...toolPages];
}
```

---

## 13. TypeScript — Push notification subscription

```tsx
// components/ui/PushNotifButton.tsx
"use client";

import { useEffect, useState } from "react";

export function PushNotifButton() {
  const [status, setStatus] = useState<"idle" | "subscribed" | "denied">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    Notification.permission === "granted" && setStatus("subscribed");
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,      // string, NOT Uint8Array (TS compat)
      });
      await fetch(
        `${process.env.NEXT_PUBLIC_RAILWAY_URL}/push/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        },
      );
      setStatus("subscribed");
    } catch (e) {
      console.error(e);
      setStatus("denied");
    }
  }

  if (status === "subscribed") return <span>🔔 Odebíráš push</span>;

  return (
    <button onClick={subscribe} className="rounded-md bg-brand-600 px-4 py-2 text-white">
      Zapnout push notifikace
    </button>
  );
}
```

---

## Jak tyto snippety použít

1. **Nová doména** — nahraď `{{TOPIC}}`, `{{DOMAIN}}`, `{{LANGUAGE}}` prostřednictvím find-replace v celém souboru.
2. **Jiný jazyk** — uprav system prompty (čeština → angličtina); strukturální pattern zůstane.
3. **Jiný LLM provider** — změn `tools/anthropic_client.py` za wrapper kolem OpenAI/Gemini SDK; zbytek agent templates zůstane (parametry jsou `messages` + `system` + `max_tokens`).

**Co udělat po copy:**
1. `python -c "import ast; ast.parse(open('my_agent.py').read())"` — syntax check.
2. `tsc --noEmit` — TypeScript strict check pro web snippety.
3. Unit test pro každý agent (mock Claude call, assert shape of output).

---

*Pro kompletní architekturu viz [ARCHITECTURE.md](ARCHITECTURE.md).*
