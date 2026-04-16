import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Update set statuses based on date_last_available
  const { data: sets } = await supabase
    .from('sets')
    .select('set_number, date_last_available, status')
    .not('date_last_available', 'is', null)

  let updated = 0

  for (const set of sets ?? []) {
    const lastDate = new Date(set.date_last_available)
    const now = new Date()
    const monthsLeft = (lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)

    let newStatus: string
    if (lastDate < now) newStatus = 'retired'
    else if (monthsLeft < 6) newStatus = 'retiring'
    else newStatus = 'available'

    if (newStatus !== set.status) {
      await supabase
        .from('sets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('set_number', set.set_number)
      updated++
    }
  }

  return NextResponse.json({ ok: true, updated, timestamp: new Date().toISOString() })
}
