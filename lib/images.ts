/**
 * lib/images.ts
 *
 * Centralizovane helpery pro zdroje obrazku. Zajistuji, ze se na webu
 * nikdy nezobrazi Unsplash fotka v roli "set image" (fotka LEGO setu).
 *
 * Pouzivat napric celym projektem misto direct string fallbacku.
 */

import type { LegoSet, Article } from './supabase/types'

const BRICKSET_CDN = 'https://images.brickset.com/sets/images'
const PLACEHOLDER = '/placeholder-set.svg'

type SetImageSource = Pick<LegoSet, 'hero_photo_url' | 'brickset_img_url' | 'set_number'>
type ReferenceImageSource = Pick<LegoSet, 'real_photos'>
type ArticleHeroSource = Pick<Article, 'hero_photo_url'>

/**
 * SET image — fotka LEGO setu. Vzdy vraci string, nikdy null.
 * Fallback chain:
 *   1. manualni override (hero_photo_url)
 *   2. prednacteny Brickset URL v DB (brickset_img_url)
 *   3. Brickset CDN sablona (vzdy funguje pro existujici sety)
 *
 * NIKDY nevraci Unsplash URL.
 */
export function getSetImage(set: SetImageSource): string {
  if (set.hero_photo_url) return set.hero_photo_url
  if (set.brickset_img_url) return set.brickset_img_url
  return `${BRICKSET_CDN}/${set.set_number}-1.jpg`
}

/**
 * REFERENCE image — fotka realneho auta. Pouze prvni z real_photos.
 * Pouzitelne jen v kontextech kde je jasne labelovana jako reference
 * (RvbCompare, RealVsBrick sekce). Nikdy jako nahrada set image.
 *
 * Vraci null kdyz neni k dispozici. Callsite to musi osetrit
 * (napr. filtrovat ze zobrazeni).
 */
export function getReferenceImage(set: ReferenceImageSource): string | null {
  const photos = set.real_photos
  if (!photos || photos.length === 0) return null
  return photos[0]
}

/**
 * ARTICLE hero — hero obrazek clanku (pres cely viewport).
 * Priority:
 *   1. article.hero_photo_url (explicit override)
 *   2. set image (pokud je set pripojen)
 *   3. placeholder SVG
 */
export function getArticleHero(
  article: ArticleHeroSource,
  set: SetImageSource | null
): { src: string } {
  if (article.hero_photo_url) return { src: article.hero_photo_url }
  if (set) return { src: getSetImage(set) }
  return { src: PLACEHOLDER }
}
