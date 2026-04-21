import { createServerClient } from '@/lib/supabase/server'
import type { Article, LegoSet } from '@/lib/supabase/types'
import { HeroCarousel } from '@/components/homepage/HeroCarousel'
import { LatestArticles } from '@/components/homepage/LatestArticles'
import { PitStopPreview } from '@/components/homepage/PitStopPreview'
import { SeriesTiles } from '@/components/homepage/SeriesTiles'
import { NewsletterForm } from '@/components/forms/NewsletterForm'

export default async function HomePage() {
  const supabase = createServerClient()

  const [articlesRes, setsRes] = await Promise.all([
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
  ])

  const articles = (articlesRes.data ?? []) as Article[]
  const sets = (setsRes.data ?? []) as LegoSet[]
  const setMap = new Map(sets.map((s) => [s.set_number, s]))

  // Hero — latest DNA articles
  const heroSlides = articles
    .filter((a) => a.series === 'dna')
    .slice(0, 4)
    .map((a) => ({ article: a, set: a.set_number ? setMap.get(a.set_number) ?? null : null }))

  // Fallback slide if no DNA articles
  const fallbackSlide = {
    article: articles[0] ?? ({
      id: '0', slug: '', title: 'Eight Wide', series: 'dna' as const,
      number: 1, brand: 'LEGO',
      excerpt: 'Stavíš Speed Champions a chceš vědět, jestli ten set stojí za to.',
      is_draft: false,
    } as unknown as Article),
    set: null,
  }

  // Pit stop: mix of retiring, retired, upcoming, available
  const pitStopSets = [
    ...sets.filter((s) => s.status === 'retiring').slice(0, 2),
    ...sets.filter((s) => s.status === 'upcoming').slice(0, 1),
    ...sets.filter((s) => s.status === 'retired').slice(0, 1),
    ...sets.filter((s) => s.status === 'available').slice(0, 3),
  ].slice(0, 5)

  return (
    <>
      {/* 1. Hero — ink island, full width, no wrapper */}
      <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : [fallbackSlide]} />

      {/* 2..5. Content on cream bg inside 1280 wrap */}
      <div className="max-w-content mx-auto px-8">
        <LatestArticles articles={articles} />
        <PitStopPreview sets={pitStopSets} />
        <SeriesTiles />
        <NewsletterForm />
      </div>
    </>
  )
}
