import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    // Support both JSON and form data
    let email: string
    let set_number: string
    let target_price_czk: number
    let store: string

    if (body) {
      email = body.email
      set_number = body.set_number
      target_price_czk = Number(body.target_price_czk)
      store = body.store ?? 'any'
    } else {
      const formData = await req.formData()
      email = formData.get('email') as string
      set_number = formData.get('set_number') as string
      target_price_czk = Number(formData.get('target_price_czk'))
      store = (formData.get('store') as string) ?? 'any'
    }

    if (!email || !set_number || !target_price_czk) {
      return NextResponse.json(
        { error: 'Missing required fields: email, set_number, target_price_czk' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verify set exists
    const { data: set } = await supabase
      .from('sets')
      .select('set_number')
      .eq('set_number', set_number)
      .single()

    if (!set) {
      return NextResponse.json({ error: `Set ${set_number} not found` }, { status: 404 })
    }

    const { error } = await supabase.from('price_alerts').insert({
      email,
      set_number,
      target_price_czk,
      store,
      confirmed: true, // TODO: implement double opt-in
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Price alert created' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
