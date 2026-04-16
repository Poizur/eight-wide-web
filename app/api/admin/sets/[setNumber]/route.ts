import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceClient } from '@/lib/supabase/server'

async function checkAuth() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

export async function GET(req: NextRequest, { params }: { params: { setNumber: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('sets').select('*').eq('set_number', params.setNumber).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { setNumber: string } }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('sets')
    .update({
      name: body.name,
      brand: body.brand,
      year_released: body.year_released,
      pieces: body.pieces,
      rrp_czk: body.rrp_czk,
      status: body.status,
      era: body.era,
      lego_line: body.lego_line,
      hero_photo_url: body.hero_photo_url,
      lego_photos: body.lego_photos,
      real_photos: body.real_photos,
      dna_article_slug: body.dna_article_slug,
      sibling_set_number: body.sibling_set_number,
      rating_overall: body.rating_overall,
      updated_at: new Date().toISOString(),
    })
    .eq('set_number', params.setNumber)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
