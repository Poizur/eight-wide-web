import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, brand, series, number, rating_overall, excerpt')
    .eq('slug', params.slug)
    .single()

  const title = article?.title ?? 'Eight Wide'
  const brand = article?.brand ?? ''
  const series = article?.series?.toUpperCase() ?? ''
  const number = article?.number ? `#${String(article.number).padStart(3, '0')}` : ''
  const rating = article?.rating_overall?.toFixed(1) ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: '#0A0C10',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold bar top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#C9A227',
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 60,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ width: 28, height: 2, background: '#C9A227', marginBottom: 6 }} />
          <div style={{ fontSize: 22, fontWeight: 600, color: '#EAE8E0' }}>
            Eight <span style={{ color: '#C9A227' }}>Wide</span>
          </div>
        </div>

        {/* Rating badge */}
        {rating && (
          <div
            style={{
              position: 'absolute',
              top: 48,
              right: 60,
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 56, fontWeight: 900, color: '#C9A227' }}>{rating}</span>
            <span style={{ fontSize: 20, color: '#3E4A58' }}>/10</span>
          </div>
        )}

        {/* Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8281E' }} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C8281E',
            }}
          >
            {series} Series {number} · {brand}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#EAE8E0',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(to right, #C9A227, transparent)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
