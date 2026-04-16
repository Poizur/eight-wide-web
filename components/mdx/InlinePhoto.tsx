import Image from 'next/image'

interface InlinePhotoProps {
  src: string
  caption?: string
  side?: 'left' | 'right' | 'full'
  alt?: string
}

export function InlinePhoto({ src, caption, side = 'full', alt }: InlinePhotoProps) {
  const floatClass =
    side === 'left'
      ? 'float-left mr-6 mb-4 w-[45%]'
      : side === 'right'
        ? 'float-right ml-6 mb-4 w-[45%]'
        : 'w-full'

  return (
    <figure className={`relative my-8 rounded-lg overflow-hidden ${floatClass}`}>
      <Image
        src={src}
        alt={alt ?? caption ?? ''}
        width={800}
        height={500}
        className="block w-full object-cover"
        style={{ filter: 'brightness(0.85)' }}
        sizes={side === 'full' ? '100vw' : '50vw'}
      />
      {caption && (
        <figcaption
          className="absolute bottom-0 left-0 right-0 px-4 py-3 font-cond text-[11px] tracking-[0.1em] uppercase"
          style={{
            background: 'linear-gradient(to top, rgba(10,12,16,0.85), transparent)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
