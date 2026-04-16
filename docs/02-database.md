# 02 — Databáze
## Eight Wide — Supabase Schema + TypeScript Types

> Spusť kompletní SQL v Supabase SQL Editoru před startem vývoje.
> Tabulky: sets, articles, prices, price_alerts, subscribers, rumors, waitlist, agent_decisions, article_learnings, error_log

---

## 6. DATABÁZE — KOMPLETNÍ SUPABASE SCHEMA

```sql
-- ══════════════════════════════════
-- EXTENSION
-- ══════════════════════════════════
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════
-- SETS
-- ══════════════════════════════════
create table sets (
  id              uuid primary key default gen_random_uuid(),
  set_number      text not null unique,          -- '76934'
  name            text not null,                  -- 'Ferrari F40'
  brand           text not null,                  -- 'Ferrari'
  year_released   int,
  pieces          int,
  rrp_czk         decimal(8,2),
  rrp_eur         decimal(8,2),
  status          text default 'available'
                  check (status in ('available','retiring','retired','upcoming')),
  era             text check (era in ('6wide','8wide')),
  brickset_img_url text,
  rebrickable_id  text,
  rebrickable_url text,
  bricklink_avg_czk decimal(8,2),  -- průměrná BrickLink cena, aktualizuje cron
  investment_roi  decimal(5,2),    -- % zhodnocení od vydání
  dna_article_slug text,           -- odkaz na DNA recenzi pokud existuje
  rating_overall  decimal(3,1),    -- zkopírováno z articles pro rychlé dotazy
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_sets_brand on sets(brand);
create index idx_sets_status on sets(status);
create index idx_sets_era on sets(era);
create index idx_sets_year on sets(year_released);

-- ══════════════════════════════════
-- ARTICLES
-- ══════════════════════════════════
create table articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  series          text not null
                  check (series in ('dna','generace','paddock','investment')),
  number          int,                            -- #047
  brand           text,
  set_number      text references sets(set_number) on delete set null,
  set_number_old  text,                           -- jen pro série 'generace'
  hero_photo_url  text,
  excerpt         text,
  read_time_min   int,
  rating_overall  decimal(3,1),
  rating_shape    decimal(3,1),
  rating_detail   decimal(3,1),
  rating_build    decimal(3,1),
  rating_value    decimal(3,1),
  rating_display  decimal(3,1),
  meta_title      text,
  meta_description text,
  published_at    timestamptz,
  is_draft        boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_articles_series on articles(series);
create index idx_articles_brand on articles(brand);
create index idx_articles_published on articles(published_at desc) where is_draft = false;

-- ══════════════════════════════════
-- PRICES — denní snapshoty
-- ══════════════════════════════════
create table prices (
  id          uuid primary key default gen_random_uuid(),
  set_number  text not null references sets(set_number) on delete cascade,
  store       text not null check (store in ('mall','alza','lego','bricklink')),
  price_czk   decimal(8,2) not null,
  url         text,
  in_stock    boolean default true,
  discount_pct decimal(5,2),          -- % sleva oproti RRP
  scraped_at  timestamptz default now()
);

create index idx_prices_set on prices(set_number);
create index idx_prices_scraped on prices(scraped_at desc);

-- View: nejnižší aktuální cena pro každý set
create or replace view current_prices as
  select distinct on (set_number, store)
    set_number, store, price_czk, url, in_stock, discount_pct, scraped_at
  from prices
  order by set_number, store, scraped_at desc;

-- ══════════════════════════════════
-- PRICE ALERTS
-- ══════════════════════════════════
create table price_alerts (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  set_number       text not null references sets(set_number),
  target_price_czk decimal(8,2) not null,
  store            text check (store in ('any','mall','alza','lego')),
  triggered        boolean default false,
  triggered_at     timestamptz,
  confirmed        boolean default false,  -- double opt-in
  created_at       timestamptz default now()
);

create index idx_alerts_active on price_alerts(set_number)
  where triggered = false and confirmed = true;

-- ══════════════════════════════════
-- NEWSLETTER SUBSCRIBERS
-- ══════════════════════════════════
create table subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  source          text,               -- 'homepage' | 'dna' | 'ceny' | 'komunita'
  confirmed       boolean default false,
  confirm_token   text unique default encode(gen_random_bytes(32), 'hex'),
  unsubscribed    boolean default false,
  created_at      timestamptz default now()
);

-- ══════════════════════════════════
-- RUMORS
-- ══════════════════════════════════
create table rumors (
  id           uuid primary key default gen_random_uuid(),
  car_name     text not null,
  brand        text,
  confidence   text not null
               check (confidence in ('speculation','probable','likely','confirmed')),
  source       text,
  description  text,
  fulfilled    boolean default false,
  fulfilled_at timestamptz,
  set_number   text,                  -- vyplní se po vydání setu
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- ══════════════════════════════════
-- KOMUNITA WAITLIST
-- ══════════════════════════════════
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  created_at timestamptz default now()
);

-- ══════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════
alter table sets            enable row level security;
alter table articles        enable row level security;
alter table prices          enable row level security;
alter table price_alerts    enable row level security;
alter table subscribers     enable row level security;
alter table rumors          enable row level security;
alter table waitlist        enable row level security;

-- Veřejné čtení pro publikovaný obsah
create policy "Public read sets" on sets for select using (true);
create policy "Public read articles" on articles for select
  using (is_draft = false and published_at <= now());
create policy "Public read prices" on prices for select using (true);
create policy "Public read rumors" on rumors for select
  using (published_at <= now());

-- Zápis jen přes service role (API routes)
create policy "Service write" on price_alerts for insert
  with check (true);
create policy "Service write subscribers" on subscribers for insert
  with check (true);
create policy "Service write waitlist" on waitlist for insert
  with check (true);
```

---

## 7. SUPABASE TYPESCRIPT TYPES — lib/supabase/types.ts
## 7. SUPABASE TYPESCRIPT TYPES — lib/supabase/types.ts

```typescript
export type SetStatus = 'available' | 'retiring' | 'retired' | 'upcoming'
export type SetEra = '6wide' | '8wide'
export type ArticleSeries = 'dna' | 'generace' | 'paddock' | 'investment'
export type Store = 'mall' | 'alza' | 'lego' | 'bricklink'
export type Confidence = 'speculation' | 'probable' | 'likely' | 'confirmed'

export interface LegoSet {
  id: string
  set_number: string
  name: string
  brand: string
  year_released: number | null
  pieces: number | null
  rrp_czk: number | null
  status: SetStatus
  era: SetEra | null
  brickset_img_url: string | null
  bricklink_avg_czk: number | null
  investment_roi: number | null
  dna_article_slug: string | null
  rating_overall: number | null
  created_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  series: ArticleSeries
  number: number | null
  brand: string | null
  set_number: string | null
  set_number_old: string | null
  hero_photo_url: string | null
  excerpt: string | null
  read_time_min: number | null
  rating_overall: number | null
  rating_shape: number | null
  rating_detail: number | null
  rating_build: number | null
  rating_value: number | null
  rating_display: number | null
  published_at: string | null
  is_draft: boolean
}

export interface PriceSnapshot {
  set_number: string
  store: Store
  price_czk: number
  url: string | null
  in_stock: boolean
  discount_pct: number | null
  scraped_at: string
}

export interface Rumor {
  id: string
  car_name: string
  brand: string | null
  confidence: Confidence
  source: string | null
  description: string | null
  fulfilled: boolean
  published_at: string | null
}
```

---

## 8. STRÁNKY — DETAILNÍ SPECIFIKACE

---

### 13.5 Supabase tabulky pro agenty

Přidej do schématu z sekce 6:

```sql
-- ══════════════════════════════════
-- AGENT DECISIONS — event store
-- Přežívá Railway restarty — NIKDY in-memory state
-- ══════════════════════════════════
create table agent_decisions (
  id            uuid primary key default gen_random_uuid(),
  agent_name    text,           -- 'research' | 'content' | 'price' | 'photo'
  decision_type text,           -- 'topic_proposal' | 'article_written'
                                -- 'price_alert_sent' | 'photo_fetched'
  approved      boolean default false,
  payload       jsonb,          -- libovolná data specifická pro typ
  created_at    timestamptz default now()
);
create index idx_decisions_type on agent_decisions(decision_type, created_at desc);

-- ══════════════════════════════════
-- ARTICLE LEARNINGS — zpětná vazba do promptů
-- Learning agent extrahuje poučení, content agent je injektuje do promptu
-- ══════════════════════════════════
create table article_learnings (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references articles(id),
  issue_type  text,         -- 'too_short' | 'missing_section' | 'weak_verdict'
  description text,
  suggestion  text,         -- konkrétní instrukce pro příští článek
  applied     boolean default false,
  created_at  timestamptz default now()
);

-- ══════════════════════════════════
-- ERROR LOG — strukturované chyby agentů
-- ══════════════════════════════════
create table error_log (
  id                uuid primary key default gen_random_uuid(),
  agent_name        text,
  error_type        text,   -- 'ERR_API_CALL' | 'ERR_DB_SAVE' | 'ERR_GITHUB'
                            -- 'ERR_PLAYWRIGHT' | 'ERR_TELEGRAM' | 'ERR_TIMEOUT'
  message           text,
  context           jsonb,
  article_id        uuid nullable,
  resolved          boolean default false,
  consecutive_count int default 1,
  created_at        timestamptz default now()
);
create index idx_errors_unresolved on error_log(agent_name, created_at desc)
  where resolved = false;
```

## 14. SEED DATA — scripts/seed.ts

```typescript
// Dev seed: naplní databázi testovacími daty
// Spustit: npm run db:seed

const SEED_SETS: Partial<LegoSet>[] = [
  { set_number: '76934', name: 'Ferrari F40', brand: 'Ferrari', year_released: 2023,
    pieces: 318, rrp_czk: 629, status: 'available', era: '8wide' },
  { set_number: '75912', name: 'Porsche 911 RSR', brand: 'Porsche', year_released: 2023,
    pieces: 434, rrp_czk: 699, status: 'retiring', era: '8wide' },
  { set_number: '76907', name: 'Lotus Evija', brand: 'Lotus', year_released: 2022,
    pieces: 247, rrp_czk: 549, status: 'available', era: '8wide', rating_overall: 9.8 },
  { set_number: '76908', name: 'Lamborghini Countach LP400', brand: 'Lamborghini',
    year_released: 2022, pieces: 262, rrp_czk: 629, status: 'retired', era: '8wide' },
  { set_number: '76910', name: 'Aston Martin Valkyrie AMR Pro', brand: 'Aston Martin',
    year_released: 2022, pieces: 286, rrp_czk: 699, status: 'available', era: '8wide' },
  // ... dalších 20+ setů
]

const SEED_RUMORS: Partial<Rumor>[] = [
  { car_name: 'Nissan Skyline GT-R R34', brand: 'Nissan', confidence: 'likely',
    source: 'Patent databáze DK · November 2024',
    description: 'Patent na "japonské kupé s bočními výduchy" zaregistrován Q4 2024.',
    published_at: new Date().toISOString() },
  { car_name: 'BMW M3 E30 DTM', brand: 'BMW', confidence: 'probable',
    source: 'Analýza licence', description: 'BMW licence vyprší Q3 2025.',
    published_at: new Date().toISOString() },
]
```


