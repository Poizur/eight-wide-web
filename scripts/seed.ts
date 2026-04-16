import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_SETS = [
  {
    set_number: '76934',
    name: 'Ferrari F40',
    brand: 'Ferrari',
    year_released: 2023,
    pieces: 318,
    rrp_czk: 629,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '75912',
    name: 'Porsche 911 RSR',
    brand: 'Porsche',
    year_released: 2023,
    pieces: 434,
    rrp_czk: 699,
    status: 'retiring',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76907',
    name: 'Lotus Evija',
    brand: 'Lotus',
    year_released: 2022,
    pieces: 247,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
    rating_overall: 9.8,
  },
  {
    set_number: '76908',
    name: 'Lamborghini Countach LP400',
    brand: 'Lamborghini',
    year_released: 2022,
    pieces: 262,
    rrp_czk: 629,
    status: 'retired',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76910',
    name: 'Aston Martin Valkyrie AMR Pro',
    brand: 'Aston Martin',
    year_released: 2022,
    pieces: 286,
    rrp_czk: 699,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76911',
    name: '007 Aston Martin DB5',
    brand: 'Aston Martin',
    year_released: 2022,
    pieces: 298,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76912',
    name: 'Fast & Furious 1970 Dodge Charger R/T',
    brand: 'Dodge',
    year_released: 2022,
    pieces: 345,
    rrp_czk: 549,
    status: 'retired',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76916',
    name: 'Porsche 963',
    brand: 'Porsche',
    year_released: 2023,
    pieces: 280,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76917',
    name: '2 Fast 2 Furious Nissan Skyline GT-R',
    brand: 'Nissan',
    year_released: 2023,
    pieces: 319,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76918',
    name: 'McLaren Solus GT & McLaren F1 LM',
    brand: 'McLaren',
    year_released: 2023,
    pieces: 581,
    rrp_czk: 999,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76919',
    name: '2023 McLaren Formula 1 Race Car',
    brand: 'McLaren',
    year_released: 2024,
    pieces: 245,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  {
    set_number: '76920',
    name: 'Ford Mustang Dark Horse',
    brand: 'Ford',
    year_released: 2024,
    pieces: 344,
    rrp_czk: 549,
    status: 'available',
    era: '8wide',
    lego_line: 'speed_champions',
  },
  // Icons
  {
    set_number: '10317',
    name: 'Lamborghini Countach 25th Anniversary',
    brand: 'Lamborghini',
    year_released: 2023,
    pieces: 1161,
    rrp_czk: 3499,
    status: 'available',
    lego_line: 'icons',
    sibling_set_number: '76908',
  },
  {
    set_number: '10295',
    name: 'Porsche 911',
    brand: 'Porsche',
    year_released: 2021,
    pieces: 1458,
    rrp_czk: 3299,
    status: 'retired',
    lego_line: 'icons',
    sibling_set_number: '75912',
  },
  // Technic
  {
    set_number: '42143',
    name: 'Ferrari Daytona SP3',
    brand: 'Ferrari',
    year_released: 2022,
    pieces: 3778,
    rrp_czk: 4999,
    status: 'available',
    lego_line: 'technic',
  },
  {
    set_number: '42141',
    name: 'McLaren Formula 1 Race Car',
    brand: 'McLaren',
    year_released: 2022,
    pieces: 1432,
    rrp_czk: 2799,
    status: 'available',
    lego_line: 'technic',
    sibling_set_number: '76918',
  },
  {
    set_number: '42172',
    name: 'Pagani Utopia',
    brand: 'Pagani',
    year_released: 2024,
    pieces: 3975,
    rrp_czk: 4999,
    status: 'available',
    lego_line: 'technic',
  },
]

const SEED_ARTICLES = [
  {
    slug: 'ferrari-f40',
    title: 'Ferrari F40 — posledni Enzovo dilo',
    series: 'dna',
    number: 1,
    brand: 'Ferrari',
    set_number: '76934',
    excerpt:
      'Pribeh poslednich supercar ktere Enzo Ferrari osobne schvalil pred svou smrti v roce 1988.',
    read_time_min: 12,
    rating_overall: 9.2,
    rating_shape: 9.4,
    rating_detail: 8.8,
    rating_build: 8.5,
    rating_value: 9.4,
    rating_display: 9.6,
    is_draft: false,
    published_at: '2024-01-15T10:00:00Z',
  },
]

const SEED_RUMORS = [
  {
    car_name: 'Nissan Skyline GT-R R34',
    brand: 'Nissan',
    confidence: 'likely',
    source: 'Patent databaze DK, November 2024',
    description:
      'Patent na "japonske kupe s bocnimi vyduchy" zaregistrovan Q4 2024.',
    published_at: new Date().toISOString(),
  },
  {
    car_name: 'BMW M3 E30 DTM',
    brand: 'BMW',
    confidence: 'probable',
    source: 'Analyza licence',
    description: 'BMW licence vyprsi Q3 2025.',
    published_at: new Date().toISOString(),
  },
  {
    car_name: 'Toyota AE86 Sprinter Trueno',
    brand: 'Toyota',
    confidence: 'speculation',
    source: 'Fan komunita',
    description: 'Komunita spekuluje o Initial D spoluprace.',
    published_at: new Date().toISOString(),
  },
  {
    car_name: 'Bugatti Chiron',
    brand: 'Bugatti',
    confidence: 'confirmed',
    source: 'LEGO tiskovka, leden 2025',
    description: 'Potvrzeno pro Speed Champions 2025 lineup.',
    published_at: new Date().toISOString(),
  },
]

async function seed() {
  console.log('Seeding sets...')
  const { error: setsError } = await supabase
    .from('sets')
    .upsert(SEED_SETS, { onConflict: 'set_number', ignoreDuplicates: false })
  if (setsError) console.error('Sets error:', setsError)
  else console.log(`  ${SEED_SETS.length} sets upserted`)

  console.log('Seeding articles...')
  const { error: articlesError } = await supabase
    .from('articles')
    .upsert(SEED_ARTICLES, { onConflict: 'slug', ignoreDuplicates: false })
  if (articlesError) console.error('Articles error:', articlesError)
  else console.log(`  ${SEED_ARTICLES.length} articles upserted`)

  console.log('Seeding rumors...')
  const { error: rumorsError } = await supabase.from('rumors').insert(SEED_RUMORS)
  if (rumorsError) console.error('Rumors error:', rumorsError)
  else console.log(`  ${SEED_RUMORS.length} rumors inserted`)

  console.log('Seed complete!')
}

seed()
