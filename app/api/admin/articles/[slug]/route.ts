import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

async function checkAuth() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('articles').select('*').eq('slug', params.slug).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('articles')
    .update({
      title: body.title,
      series: body.series,
      brand: body.brand,
      set_number: body.set_number,
      excerpt: body.excerpt,
      read_time_min: body.read_time_min,
      rating_overall: body.rating_overall,
      rating_shape: body.rating_shape,
      rating_detail: body.rating_detail,
      rating_build: body.rating_build,
      rating_value: body.rating_value,
      rating_display: body.rating_display,
      is_draft: body.is_draft,
      published_at: body.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', params.slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
