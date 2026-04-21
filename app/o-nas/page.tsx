import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O webu — Eight Wide',
  description: 'Proč Eight Wide existuje a jak hodnotíme Speed Champions sety.',
}

export default function ONasPage() {
  return (
    <div className="max-w-[680px] mx-auto px-8 py-16">
      <div className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--red)' }}>
        O webu
      </div>
      <h1
        className="font-serif leading-[1.05] mb-8"
        style={{ fontSize: 'clamp(36px,5vw,52px)', color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em' }}
      >
        Píšeme o autech, která stavíš.
      </h1>

      <div className="text-base leading-[1.8] space-y-6" style={{ color: 'var(--ink2)' }}>
        <p>
          Když si koupíš <strong style={{ color: 'var(--ink)' }}>Porsche 911 RSR 75912</strong>, chceš vědět proč RSR a ne GT3 RS. Když váháš mezi <strong style={{ color: 'var(--ink)' }}>Speed Champions Countachem</strong> a <strong style={{ color: 'var(--ink)' }}>Icons verzí</strong>, chceš vědět co koupit a proč. Žádný jiný český web to neřeší — proto existuje <strong style={{ color: 'var(--ink)' }}>Eight Wide</strong>.
        </p>

        <p>
          Každý set má příběh. Ferrari F40 není jen 318 plastových dílků — je to poslední auto, které Enzo Ferrari osobně schválil. Lotus Evija není krásně zelená hračka — je to 2 000 koní z britské elektromobilové revoluce. Chceme ten příběh vyprávět a pak ti říct, jestli ho LEGO zachytilo dobře.
        </p>

        <h2 className="font-serif pt-4" style={{ fontSize: 26, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em' }}>
          Jak hodnotíme
        </h2>
        <p>
          <strong style={{ color: 'var(--ink)' }}>Skóre 0 až 10</strong> v pěti kategoriích — tvar & proporce (25 %), detail & věrnost (25 %), stavba (20 %), hodnota (20 %), display efekt (10 %). Žádné marketingové bla-bla, jen čísla. A pod tím verdikt: koupit, počkat, nebo rovnou BrickLink.
        </p>
        <p>
          <strong style={{ color: 'var(--ink)' }}>DNA</strong> — hloubkový článek pro jeden set. Historie auta + recenze LEGO verze, pokud existuje Icons/Technic sourozenec tak i porovnání a tip co koupit.
        </p>
        <p>
          <strong style={{ color: 'var(--ink)' }}>Generace</strong> — starý 6-wide proti novému 8-wide. Side by side. Vyplatilo se čekat sedm let na novou verzi?
        </p>
        <p>
          <strong style={{ color: 'var(--ink)' }}>Pit Stop</strong> — ceny na Mall.cz, Alza, LEGO.com a BrickLink každé pondělí. Nastav si alert na cílovou cenu, pošleme mail když set zlevní.
        </p>
        <p>
          <strong style={{ color: 'var(--ink)' }}>Paddock Rumors</strong> — patenty, licence, retailer listingy. Co LEGO chystá dál, se skóre spolehlivosti.
        </p>

        <h2 className="font-serif pt-4" style={{ fontSize: 26, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em' }}>
          Co tu nenajdeš
        </h2>
        <p>
          Žádný &bdquo;top 5 nejhezčích setů&ldquo;, žádný &bdquo;je to ohromné&ldquo;, žádné placené recenze. Pokud o setu píšeme, je to protože jsme ho postavili nebo do něj hodně vidíme. Pokud má slabá místa, řekneme to.
        </p>

        <h2 className="font-serif pt-4" style={{ fontSize: 26, color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.02em' }}>
          Kontakt
        </h2>
        <p>
          Napiš na <a href="mailto:info@speedchampions.cz" style={{ color: 'var(--red)' }}>info@speedchampions.cz</a> — tip na článek, chybu v datech, nebo že chceš sponzorovat pillar set.
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Eight Wide není afilovaný s LEGO Group. LEGO® a Speed Champions™ jsou registrované ochranné známky LEGO Group.
        </p>
      </div>
    </div>
  )
}
