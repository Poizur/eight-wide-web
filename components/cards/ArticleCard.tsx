import Link from 'next/link'
import Image from 'next/image'
import type { Article, ArticleSeries } from '@/lib/supabase/types'
import { getSetImage } from '@/lib/images'

const tagConfig: Record<string, { label: string; color: string; bg: string }> = {
  dna:        { label: 'DNA Series',      color: 'var(--red)',    bg: 'var(--red-bg)' },
  generace:   { label: 'Generace',        color: 'var(--gold)',   bg: 'var(--gold-bg)' },
  investment: { label: 'The Investment',  color: 'var(--green)',  bg: 'var(--green-bg)' },
  paddock:    { label: 'Paddock Rumors',  color: 'var(--purple)', bg: '#F5EEF8' },
  realvsbrick:{ label: 'Real vs. Brick',  color: 'var(--blue)',   bg: '#EEF3FD' },
}

type CardVariant = 'featured' | 'compact' | 'grid'

interface ArticleCardProps {
  article: Article
  variant?: CardVariant
  imageLabel?: string
}

export function ArticleCard({ article, variant = 'grid', imageLabel }: ArticleCardProps) {
  const tag = tagConfig[article.series] ?? tagConfig.dna
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
    : ''
  const readTime = article.read_time_min ? `${article.read_time_min} min čtení` : null

  const showImage = variant !== 'compact'
  const imgSrc = article.set_number
    ? getSetImage({ set_number: article.set_number, hero_photo_url: null, brickset_img_url: null })
    : null

  return (
    <Link
      href={`/${article.series}/${article.slug}`}
      className="group block no-underline overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Image */}
      {showImage && imgSrc && (
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            aspectRatio: variant === 'featured' ? '4/3' : '16/9',
            background: 'var(--bg)',
          }}
        >
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 50%)' }}
          />
          {imageLabel && (
            <div
              className="absolute bottom-3 left-3.5 text-[10px] font-bold uppercase rounded px-2 py-[3px]"
              style={{
                letterSpacing: '0.1em',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
              }}
            >
              {imageLabel}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={variant === 'compact' ? 'px-4 py-3.5' : 'p-[18px]'}>
        {/* Tag */}
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase rounded px-2 py-[3px] mb-2.5"
          style={{
            letterSpacing: '0.1em',
            color: tag.color,
            background: tag.bg,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
          {tag.label}
        </div>

        {/* Title */}
        {variant === 'compact' ? (
          <div
            className="text-[15px] font-semibold leading-[1.35] transition-colors duration-150 group-hover:text-red"
            style={{ color: 'var(--ink)' }}
          >
            {article.title}
          </div>
        ) : (
          <div
            className="font-serif text-[22px] leading-[1.25] mb-2 transition-colors duration-150 group-hover:text-red"
            style={{ color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.01em' }}
          >
            {article.title}
          </div>
        )}

        {/* Excerpt */}
        {variant !== 'compact' && article.excerpt && (
          <p className="text-[13px] leading-[1.6] mb-3.5" style={{ color: 'var(--muted)' }}>
            {article.excerpt}
          </p>
        )}

        {/* Foot */}
        <div
          className="flex items-center justify-between"
          style={
            variant === 'compact'
              ? { marginTop: 8 }
              : { paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 14 }
          }
        >
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: 'var(--subtle)' }}
          >
            {variant !== 'compact' && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'var(--border)', color: 'var(--muted)' }}
              >
                EW
              </div>
            )}
            {variant === 'compact'
              ? (readTime ?? 'Eight Wide')
              : `Eight Wide${readTime ? ` · ${readTime}` : ''}`}
          </div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--subtle)' }}>
            {date}
          </div>
        </div>
      </div>
    </Link>
  )
}
