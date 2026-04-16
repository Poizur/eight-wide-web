import type { Article, LegoSet } from '@/lib/supabase/types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://speedchampions.cz'

export function articleJsonLd(article: Article, set?: LegoSet | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? article.meta_description,
    image: article.hero_photo_url ?? `${BASE_URL}/api/og/${article.slug}`,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Organization',
      name: 'Eight Wide',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Eight Wide',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${article.series}/${article.slug}`,
    },
    ...(article.rating_overall
      ? {
          review: {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: article.rating_overall,
              bestRating: 10,
              worstRating: 0,
            },
            author: { '@type': 'Organization', name: 'Eight Wide' },
          },
        }
      : {}),
  }
}

export function productJsonLd(set: LegoSet, article?: Article | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `LEGO ${set.name} (${set.set_number})`,
    brand: { '@type': 'Brand', name: 'LEGO' },
    description: `LEGO ${set.lego_line === 'speed_champions' ? 'Speed Champions' : set.lego_line} set ${set.set_number} — ${set.name}. ${set.pieces ?? ''} dilku.`,
    sku: set.set_number,
    image: set.brickset_img_url ?? `https://images.brickset.com/sets/images/${set.set_number}-1.jpg`,
    ...(set.rrp_czk
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'CZK',
            price: set.rrp_czk,
            availability:
              set.status === 'available' || set.status === 'retiring'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
    ...(article?.rating_overall
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: article.rating_overall,
            bestRating: 10,
            worstRating: 0,
            ratingCount: 1,
          },
        }
      : {}),
  }
}
