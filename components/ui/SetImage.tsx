'use client'

/**
 * components/ui/SetImage.tsx
 *
 * Wrapper nad next/image pro render SET-image (fotka LEGO setu).
 * Sam vola getSetImage() — callsite tak nemuze predat Unsplash
 * URL jako fotku setu. Pri chybe nacteni swapne na /placeholder-set.svg.
 *
 * API: misto `src` prijima `set` prop. Jiny src sem uz nepropadne.
 *
 * Duvod vybrane (single-source) varianty: cilem wrapperu je vynutit
 * fallback chain. Pass-through `src` by umoznilo obejit helper a
 * uvadet libovolnou URL — presne to, cemu jsme se snazili zabranit.
 *
 * Pass-through props: vsechny ostatni ImageProps (alt, width, height,
 * fill, sizes, priority, className, style, ...).
 *
 * Defaults: pokud caller neposkytne `sizes`, nastavime rozumny default
 * pro responsivni grid.
 */

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import type { LegoSet } from '@/lib/supabase/types'
import { getSetImage } from '@/lib/images'

const PLACEHOLDER = '/placeholder-set.svg'
const DEFAULT_SIZES = '(max-width: 768px) 100vw, 50vw'

/**
 * Minimum set shape needed to render a SET image.
 * Keep this aligned with getSetImage() inputs.
 */
export type SetImageSet = Pick<
  LegoSet,
  'set_number' | 'hero_photo_url' | 'brickset_img_url'
>

export type SetImageProps = Omit<ImageProps, 'src'> & {
  set: SetImageSet
}

export function SetImage({ set, alt, sizes, onError, ...rest }: SetImageProps) {
  const initialSrc = getSetImage(set)
  const [src, setSrc] = useState<string>(initialSrc)
  const [didFallback, setDidFallback] = useState(false)

  return (
    <Image
      {...rest}
      src={src}
      alt={alt ?? `LEGO set ${set.set_number}`}
      sizes={sizes ?? DEFAULT_SIZES}
      onError={(e) => {
        if (!didFallback) {
          console.warn(
            `[SetImage] Failed to load ${initialSrc} for set ${set.set_number} — falling back to placeholder`
          )
          setDidFallback(true)
          setSrc(PLACEHOLDER)
        }
        onError?.(e)
      }}
    />
  )
}
