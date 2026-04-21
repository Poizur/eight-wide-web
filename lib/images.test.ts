import { describe, it, expect } from 'vitest'
import { getSetImage, getReferenceImage, getArticleHero } from './images'

describe('getSetImage', () => {
  it('returns hero_photo_url when present (highest priority)', () => {
    const src = getSetImage({
      hero_photo_url: 'https://example.com/custom.jpg',
      brickset_img_url: 'https://images.brickset.com/sets/images/76934-1.jpg',
      set_number: '76934',
    })
    expect(src).toBe('https://example.com/custom.jpg')
  })

  it('returns brickset_img_url when hero is null', () => {
    const src = getSetImage({
      hero_photo_url: null,
      brickset_img_url: 'https://images.brickset.com/sets/images/custom-76934.jpg',
      set_number: '76934',
    })
    expect(src).toBe('https://images.brickset.com/sets/images/custom-76934.jpg')
  })

  it('returns Brickset CDN template URL when both overrides are null', () => {
    const src = getSetImage({
      hero_photo_url: null,
      brickset_img_url: null,
      set_number: '76934',
    })
    expect(src).toBe('https://images.brickset.com/sets/images/76934-1.jpg')
  })

  it('honors Icons/Technic set numbers in template', () => {
    const src = getSetImage({
      hero_photo_url: null,
      brickset_img_url: null,
      set_number: '10317',
    })
    expect(src).toBe('https://images.brickset.com/sets/images/10317-1.jpg')
  })

  it('never returns empty string, null, or unsplash URL', () => {
    const src = getSetImage({
      hero_photo_url: null,
      brickset_img_url: null,
      set_number: '99999',
    })
    expect(src).toBeTruthy()
    expect(src).not.toContain('unsplash')
  })
})

describe('getReferenceImage', () => {
  it('returns null when real_photos is empty array', () => {
    const result = getReferenceImage({ real_photos: [] })
    expect(result).toBeNull()
  })

  it('returns null when real_photos is null-like (defensive)', () => {
    // @ts-expect-error — test defensive null handling
    const result = getReferenceImage({ real_photos: null })
    expect(result).toBeNull()
  })

  it('returns first item when real_photos has entries', () => {
    const result = getReferenceImage({
      real_photos: [
        'https://images.unsplash.com/photo-ferrari-f40-1.jpg',
        'https://images.unsplash.com/photo-ferrari-f40-2.jpg',
      ],
    })
    expect(result).toBe('https://images.unsplash.com/photo-ferrari-f40-1.jpg')
  })
})

describe('getArticleHero', () => {
  it('returns article.hero_photo_url when set (override wins)', () => {
    const result = getArticleHero(
      { hero_photo_url: 'https://example.com/article-hero.jpg' },
      {
        hero_photo_url: null,
        brickset_img_url: null,
        set_number: '76934',
      }
    )
    expect(result.src).toBe('https://example.com/article-hero.jpg')
  })

  it('falls back to set image when article hero is null and set is provided', () => {
    const result = getArticleHero(
      { hero_photo_url: null },
      {
        hero_photo_url: null,
        brickset_img_url: null,
        set_number: '76934',
      }
    )
    expect(result.src).toBe('https://images.brickset.com/sets/images/76934-1.jpg')
  })

  it('falls back to placeholder SVG when both article hero and set are missing', () => {
    const result = getArticleHero({ hero_photo_url: null }, null)
    expect(result.src).toBe('/placeholder-set.svg')
  })

  it('falls back to placeholder when hero is empty string and no set', () => {
    const result = getArticleHero({ hero_photo_url: '' }, null)
    expect(result.src).toBe('/placeholder-set.svg')
  })

  it('returned object has only src field (no isReference flag)', () => {
    const result = getArticleHero({ hero_photo_url: 'https://example.com/x.jpg' }, null)
    expect(Object.keys(result)).toEqual(['src'])
  })
})
