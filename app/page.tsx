import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import { HeroCarousel } from '@/components/homepage/HeroCarousel'
import { LatestArticles } from '@/components/homepage/LatestArticles'
import { RealVsBrick } from '@/components/homepage/RealVsBrick'
import { DnaStrip } from '@/components/homepage/DnaStrip'
import { PitStopPreview } from '@/components/homepage/PitStopPreview'
import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { BrandsStrip } from '@/components/homepage/BrandsStrip'
import { HofPreview } from '@/components/homepage/HofPreview'
import { SeriesTimeline } from '@/components/homepage/SeriesTimeline'
import { BazaarTeaser } from '@/components/homepage/BazaarTeaser'

export default async function HomePage() {
  const supabase = createServerClient()

  // Fetch all data in parallel
  const [articlesRes, setsRes, hofRes, brandsRes] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .eq('is_draft', false)
      .order('published_at', { ascending: false })
      .limit(7),
    supabase
      .from('sets')
      .select('*')
      .eq('lego_line', 'speed_champions')
      .order('rating_overall', { ascending: false, nullsFirst: false })
      .limit(20),
    supabase
      .from('articles')
      .select('*')
      .eq('series', 'dna')
      .eq('is_draft', false)
      .order('rating_overall', { ascending: false, nullsFirst: false })
      .limit(5),
    supabase
      .from('sets')
      .select('brand, year_released')
      .eq('lego_line', 'speed_champions'),
  ])

  const articles = (articlesRes.data ?? []) as Article[]
  const sets = (setsRes.data ?? []) as LegoSet[]
  const hofArticles = (hofRes.data ?? []) as Article[]
  const allBrandRows = (brandsRes.data ?? []) as { brand: string; year_released: number | null }[]

  // Build brand stats
  const brandMap = new Map<string, { count: number; minYear: number; maxYear: number }>()
  for (const row of allBrandRows) {
    const existing = brandMap.get(row.brand)
    const yr = row.year_released ?? 2020
    if (existing) {
      existing.count++
      existing.minYear = Math.min(existing.minYear, yr)
      existing.maxYear = Math.max(existing.maxYear, yr)
    } else {
      brandMap.set(row.brand, { count: 1, minYear: yr, maxYear: yr })
    }
  }
  const brands = Array.from(brandMap.entries())
    .map(([brand, stats]) => ({ brand, ...stats }))
    .sort((a, b) => b.count - a.count)

  // Build set lookup map
  const setMap = new Map(sets.map((s) => [s.set_number, s]))

  // Hero slides from latest DNA articles
  const heroSlides = articles
    .filter((a) => a.series === 'dna')
    .slice(0, 4)
    .map((a) => ({ article: a, set: a.set_number ? setMap.get(a.set_number) ?? null : null }))

  // DNA strip: pick a DNA article not in hero
  const heroSlugs = new Set(heroSlides.map((s) => s.article.slug))
  const dnaStripArticle = articles.find((a) => a.series === 'dna' && !heroSlugs.has(a.slug)) ?? articles[0]
  const dnaStripSet = dnaStripArticle?.set_number ? setMap.get(dnaStripArticle.set_number) ?? null : null

  // HoF items
  const hofItems = hofArticles.map((a) => ({
    article: a,
    set: a.set_number ? setMap.get(a.set_number) ?? null : null,
  }))

  // Sets for RvB: pick 3 interesting sets
  const rvbSets = sets.filter((s) => s.dna_article_slug || s.rating_overall).slice(0, 3)
  // If not enough, just use first 3
  const rvbDisplay = rvbSets.length >= 3 ? rvbSets : sets.slice(0, 3)

  // Pit stop: mix of retiring, available, retired
  const pitStopSets = [
    ...sets.filter((s) => s.status === 'retiring').slice(0, 2),
    ...sets.filter((s) => s.status === 'available').slice(0, 2),
    ...sets.filter((s) => s.status === 'retired').slice(0, 1),
  ].slice(0, 5)
  // Fill up if not enough
  while (pitStopSets.length < 5 && pitStopSets.length < sets.length) {
    const next = sets[pitStopSets.length]
    if (next && !pitStopSets.find((s) => s.id === next.id)) pitStopSets.push(next)
    else break
  }

  return (
    <>
      {/* 1. Hero Carousel */}
      <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : [{ article: articles[0] ?? { id: '0', slug: '', title: 'Eight Wide', series: 'dna', number: 1, brand: 'LEGO', excerpt: 'Automotive magazin o LEGO Speed Champions', is_draft: false } as Article, set: null }]} />

      {/* 2. Latest Articles */}
      <div className="max-w-content mx-auto px-8">
        <LatestArticles articles={articles} />

        {/* 3. Real vs Brick */}
        <RealVsBrick sets={rvbDisplay} />

        {/* 4. DNA Strip */}
        {dnaStripArticle && <DnaStrip article={dnaStripArticle} set={dnaStripSet} />}

        {/* 5. Pit Stop Preview */}
        <PitStopPreview sets={pitStopSets} />

        {/* 6. Newsletter */}
        <NewsletterForm />
      </div>

      {/* 7. Brands Strip (full width bg) */}
      <BrandsStrip brands={brands} />

      {/* 8. Hall of Fame */}
      <HofPreview items={hofItems} />

      {/* 9. Series Timeline */}
      <SeriesTimeline />

      {/* 10. Bazaar / Community Teaser */}
      <BazaarTeaser />
    </>
  )
}
