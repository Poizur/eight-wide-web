import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase.from('subscribers').insert({
      email: email.toLowerCase().trim(),
      source: source ?? 'homepage',
    })

    if (error) {
      if (error.code === '23505') {
        // Duplicate email — not an error from user perspective
        return NextResponse.json({ ok: true, message: 'Already subscribed' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Subscribed successfully' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
