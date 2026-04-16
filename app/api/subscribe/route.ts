import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { renderWelcomeEmail } from '@/emails/WelcomeEmail'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://speedchampions.cz'

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const cleanEmail = email.toLowerCase().trim()

    const { data, error } = await supabase
      .from('subscribers')
      .insert({ email: cleanEmail, source: source ?? 'homepage' })
      .select('confirm_token')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, message: 'Already subscribed' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send double opt-in confirmation email
    if (data?.confirm_token) {
      const confirmUrl = `${BASE_URL}/api/confirm?token=${data.confirm_token}`
      await sendEmail({
        to: cleanEmail,
        subject: 'Potvrd svuj odber — Eight Wide',
        html: renderWelcomeEmail({ confirmUrl }),
      })
    }

    return NextResponse.json({ ok: true, message: 'Check your email to confirm' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
