/**
 * scripts/verify-brickset.ts
 *
 * Pro kazdy set v DB:
 *   - udela HEAD request na https://images.brickset.com/sets/images/{set_number}-1.jpg
 *   - porovna s brickset_img_url sloupcem
 * Vystup: tabulka [set_number, name, cdn_status, db_has_url]
 *         a souhrn na konci.
 *
 * NEMENI databazi. Pouze report. Exit code 0 vzdy (i pri missing).
 *
 * Spustit: npx tsx scripts/verify-brickset.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CDN = 'https://images.brickset.com/sets/images'

async function headCheck(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}

function pad(s: string | number | null | undefined, w: number): string {
  const str = String(s ?? '')
  return str.length >= w ? str.slice(0, w) : str + ' '.repeat(w - str.length)
}

async function main() {
  const { data: sets, error } = await supabase
    .from('sets')
    .select('set_number, name, brand, lego_line, brickset_img_url')
    .order('set_number')

  if (error) {
    console.error('Supabase error:', error.message)
    process.exit(1)
  }

  if (!sets || sets.length === 0) {
    console.log('No sets in DB.')
    return
  }

  console.log(`Checking ${sets.length} sets against Brickset CDN...\n`)
  console.log(
    pad('status', 6) +
      pad('set_#', 8) +
      pad('line', 18) +
      pad('name', 40) +
      pad('cdn', 6) +
      'db_url'
  )
  console.log('-'.repeat(90))

  let cdnHit = 0
  let cdnMiss = 0
  let dbHas = 0
  const missing: { set_number: string; name: string; line: string }[] = []

  // Sequential to be polite to Brickset CDN
  for (const s of sets) {
    const url = `${CDN}/${s.set_number}-1.jpg`
    const { ok, status } = await headCheck(url)
    const hasDbUrl = Boolean(s.brickset_img_url)

    const flag = ok ? 'OK' : status === 404 ? 'MISS' : `ERR${status}`
    const cdn = ok ? 'YES' : 'NO'

    if (ok) cdnHit++
    else {
      cdnMiss++
      missing.push({ set_number: s.set_number, name: s.name, line: s.lego_line })
    }
    if (hasDbUrl) dbHas++

    console.log(
      pad(flag, 6) +
        pad(s.set_number, 8) +
        pad(s.lego_line, 18) +
        pad(s.name, 40) +
        pad(cdn, 6) +
        (hasDbUrl ? 'YES' : 'no')
    )

    // Small delay — 150ms
    await new Promise(r => setTimeout(r, 150))
  }

  console.log('-'.repeat(90))
  console.log(`\nSummary:`)
  console.log(`  Total sets:            ${sets.length}`)
  console.log(`  Brickset CDN hit:      ${cdnHit} (${((cdnHit / sets.length) * 100).toFixed(1)}%)`)
  console.log(`  Brickset CDN miss:     ${cdnMiss}`)
  console.log(`  DB brickset_img_url:   ${dbHas}`)

  if (missing.length > 0) {
    console.log(`\nMissing from Brickset CDN:`)
    for (const m of missing) {
      console.log(`  ${m.set_number}  ${m.line.padEnd(18)}  ${m.name}`)
    }
  }
}

main()
