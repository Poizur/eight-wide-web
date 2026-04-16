// Setup database schema via Supabase Management API
// Run: npx tsx scripts/setup-db.ts

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const SQL = `
-- Extension
create extension if not exists "uuid-ossp";

-- SETS
create table if not exists sets (
  id              uuid primary key default gen_random_uuid(),
  set_number      text not null unique,
  name            text not null,
  brand           text not null,
  year_released   int,
  pieces          int,
  rrp_czk         decimal(8,2),
  rrp_eur         decimal(8,2),
  status          text default 'available'
                  check (status in ('available','retiring','retired','upcoming')),
  era             text check (era in ('6wide','8wide')),
  lego_line       text default 'speed_champions'
                  check (lego_line in ('speed_champions','icons','technic')),
  brickset_img_url text,
  hero_photo_url  text,
  lego_photos     jsonb default '[]',
  real_photos     jsonb default '[]',
  rebrickable_id  text,
  rebrickable_url text,
  bricklink_avg_czk decimal(8,2),
  investment_roi  decimal(5,2),
  dna_article_slug text,
  sibling_set_number text,
  rating_overall  decimal(3,1),
  brickset_id     int,
  brickset_rating decimal(3,1),
  brickset_review_count int default 0,
  date_last_available timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_sets_brand on sets(brand);
create index if not exists idx_sets_status on sets(status);
create index if not exists idx_sets_era on sets(era);
create index if not exists idx_sets_year on sets(year_released);

-- ARTICLES
create table if not exists articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  series          text not null
                  check (series in ('dna','generace','paddock','investment')),
  number          int,
  brand           text,
  set_number      text references sets(set_number) on delete set null,
  set_number_old  text,
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

create index if not exists idx_articles_series on articles(series);
create index if not exists idx_articles_brand on articles(brand);

-- PRICES
create table if not exists prices (
  id          uuid primary key default gen_random_uuid(),
  set_number  text not null references sets(set_number) on delete cascade,
  store       text not null check (store in ('mall','alza','lego','bricklink')),
  price_czk   decimal(8,2) not null,
  url         text,
  in_stock    boolean default true,
  discount_pct decimal(5,2),
  scraped_at  timestamptz default now()
);

create index if not exists idx_prices_set on prices(set_number);
create index if not exists idx_prices_scraped on prices(scraped_at desc);

-- PRICE ALERTS
create table if not exists price_alerts (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  set_number       text not null references sets(set_number),
  target_price_czk decimal(8,2) not null,
  store            text check (store in ('any','mall','alza','lego')),
  triggered        boolean default false,
  triggered_at     timestamptz,
  confirmed        boolean default false,
  created_at       timestamptz default now()
);

-- SUBSCRIBERS
create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  source          text,
  confirmed       boolean default false,
  confirm_token   text unique default encode(gen_random_bytes(32), 'hex'),
  unsubscribed    boolean default false,
  created_at      timestamptz default now()
);

-- RUMORS
create table if not exists rumors (
  id           uuid primary key default gen_random_uuid(),
  car_name     text not null,
  brand        text,
  confidence   text not null
               check (confidence in ('speculation','probable','likely','confirmed')),
  source       text,
  description  text,
  fulfilled    boolean default false,
  fulfilled_at timestamptz,
  set_number   text,
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- WAITLIST
create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  created_at timestamptz default now()
);

-- AGENT DECISIONS
create table if not exists agent_decisions (
  id            uuid primary key default gen_random_uuid(),
  agent_name    text,
  decision_type text,
  approved      boolean default false,
  payload       jsonb,
  created_at    timestamptz default now()
);

-- ARTICLE LEARNINGS
create table if not exists article_learnings (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references articles(id),
  issue_type  text,
  description text,
  suggestion  text,
  applied     boolean default false,
  created_at  timestamptz default now()
);

-- ERROR LOG
create table if not exists error_log (
  id                uuid primary key default gen_random_uuid(),
  agent_name        text,
  error_type        text,
  message           text,
  context           jsonb,
  article_id        uuid,
  resolved          boolean default false,
  consecutive_count int default 1,
  created_at        timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table sets            enable row level security;
alter table articles        enable row level security;
alter table prices          enable row level security;
alter table price_alerts    enable row level security;
alter table subscribers     enable row level security;
alter table rumors          enable row level security;
alter table waitlist        enable row level security;

-- Public read policies (use IF NOT EXISTS via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read sets') THEN
    CREATE POLICY "Public read sets" ON sets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read articles') THEN
    CREATE POLICY "Public read articles" ON articles FOR SELECT USING (is_draft = false AND published_at <= now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read prices') THEN
    CREATE POLICY "Public read prices" ON prices FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read rumors') THEN
    CREATE POLICY "Public read rumors" ON rumors FOR SELECT USING (published_at <= now());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service write') THEN
    CREATE POLICY "Service write" ON price_alerts FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service write subscribers') THEN
    CREATE POLICY "Service write subscribers" ON subscribers FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service write waitlist') THEN
    CREATE POLICY "Service write waitlist" ON waitlist FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- View: current prices
CREATE OR REPLACE VIEW current_prices AS
  SELECT DISTINCT ON (set_number, store)
    set_number, store, price_czk, url, in_stock, discount_pct, scraped_at
  FROM prices
  ORDER BY set_number, store, scraped_at DESC;
`

async function setupDb() {
  // Use Supabase's REST RPC to execute raw SQL via the pg_net or sql endpoint
  // Since we can't run raw SQL via the JS client, we'll use the HTTP API
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({}),
  })

  // The REST API doesn't support raw SQL — we need to print instructions
  console.log('='.repeat(60))
  console.log('SUPABASE SQL SCHEMA')
  console.log('='.repeat(60))
  console.log()
  console.log('Zkopiruj SQL nize a spust ho v:')
  console.log(`${SUPABASE_URL.replace('.supabase.co', '')}/project/default/sql/new`)
  console.log('nebo: Supabase Dashboard → SQL Editor → New Query')
  console.log()
  console.log('='.repeat(60))
  console.log(SQL)
  console.log('='.repeat(60))
}

setupDb()
