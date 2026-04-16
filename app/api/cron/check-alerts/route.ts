import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get active alerts (confirmed, not yet triggered)
  const { data: alerts } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('triggered', false)
    .eq('confirmed', true)

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ ok: true, triggered: 0 })
  }

  let triggered = 0

  for (const alert of alerts) {
    // Get current lowest price for the set
    const { data: prices } = await supabase
      .from('current_prices')
      .select('*')
      .eq('set_number', alert.set_number)
      .eq('in_stock', true)

    if (!prices || prices.length === 0) continue

    const lowestPrice = Math.min(...prices.map((p: any) => p.price_czk))

    if (lowestPrice <= alert.target_price_czk) {
      // Mark as triggered
      await supabase
        .from('price_alerts')
        .update({ triggered: true, triggered_at: new Date().toISOString() })
        .eq('id', alert.id)

      // TODO: Send email via Resend when configured
      triggered++
    }
  }

  return NextResponse.json({ ok: true, triggered, timestamp: new Date().toISOString() })
}
