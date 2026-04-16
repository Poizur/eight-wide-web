import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const action = req.nextUrl.searchParams.get('action')

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_token', req.url))
  }

  const supabase = createServiceClient()

  if (action === 'unsubscribe') {
    const { error } = await supabase
      .from('subscribers')
      .update({ unsubscribed: true })
      .eq('confirm_token', token)

    if (error) {
      return NextResponse.redirect(new URL('/?error=unsubscribe_failed', req.url))
    }
    return NextResponse.redirect(new URL('/?unsubscribed=true', req.url))
  }

  // Default: confirm subscription
  const { data, error } = await supabase
    .from('subscribers')
    .update({ confirmed: true })
    .eq('confirm_token', token)
    .eq('confirmed', false)
    .select('email')
    .single()

  if (error || !data) {
    return NextResponse.redirect(new URL('/?error=invalid_token', req.url))
  }

  return NextResponse.redirect(new URL('/?confirmed=true', req.url))
}
