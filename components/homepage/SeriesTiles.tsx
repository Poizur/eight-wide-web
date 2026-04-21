import Link from 'next/link'
import { SectionHead } from './SectionHead'

interface Tile {
  href: string
  icon: string
  name: string
  desc: string
  count: string
  color: string
  bg: string
  accent: string
}

const tiles: Tile[] = [
  {
    href: '/dna',
    icon: 'DNA',
    name: 'DNA Series',
    desc: 'Příběh reálného auta, závodní kariéra a kulturní dopad. Pak: zachytilo to LEGO?',
    count: 'Vychází při každém novém setu',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    accent: 'var(--red)',
  },
  {
    href: '/generace',
    icon: 'GEN',
    name: 'Generace',
    desc: 'Pokaždé když LEGO vydá novou verzi — srovnáme ji s předchůdcem. Data, fotky, verdikt.',
    count: 'Při novém releasu',
    color: 'var(--gold)',
    bg: 'var(--gold-bg)',
    accent: 'var(--gold)',
  },
  {
    href: '/hof',
    icon: 'INV',
    name: 'Hall of Fame',
    desc: 'Definitivní ranking — která auta zestárla nejlíp. Data, skóre, metodika.',
    count: 'Aktualizace každý měsíc',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    accent: 'var(--green)',
  },
  {
    href: '/paddock',
    icon: 'RMR',
    name: 'Paddock Rumors',
    desc: 'Leaky, patent databáze, retailer listingy. Která auta přijdou příště?',
    count: 'Každý týden',
    color: 'var(--purple)',
    bg: '#F5EEF8',
    accent: 'var(--purple)',
  },
]

export function SeriesTiles() {
  return (
    <div>
      <SectionHead title="Naše série" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative overflow-hidden rounded-xl p-[22px] no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Top accent line, scales on hover */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              style={{ background: t.accent }}
            />

            {/* Icon square */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold mb-[14px]"
              style={{ background: t.bg, color: t.color }}
            >
              {t.icon}
            </div>

            <div className="text-sm font-bold mb-1.5" style={{ color: 'var(--ink)' }}>
              {t.name}
            </div>
            <p className="text-xs leading-[1.55] mb-3.5" style={{ color: 'var(--muted)' }}>
              {t.desc}
            </p>
            <div className="text-[11px] font-medium" style={{ color: 'var(--subtle)' }}>
              {t.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
