import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O nas — Eight Wide',
  description: 'Kdo stoji za Eight Wide, nase mise a proc piseme o LEGO Speed Champions.',
}

export default function ONasPage() {
  return (
    <div className="max-w-[680px] mx-auto px-8 py-16">
      <div className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
        O nas
      </div>
      <h1 className="font-serif font-bold tracking-[-0.02em] leading-[1.05] mb-8" style={{ fontSize: 'clamp(36px,5vw,52px)', color: 'var(--text)' }}>
        Kde se realna auta<br />potkavaji s kostkami
      </h1>

      <div className="text-base leading-[1.8] space-y-6" style={{ color: 'var(--text2)' }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>Eight Wide</strong> je nezavisly automotive magazin zamereny na LEGO Speed Champions, Icons a Technic. Piseme o historii realnych aut a hodnotime jak verne je LEGO zachytilo.
        </p>
        <p>
          Kazdy set ma pribeh. Ferrari F40 neni jen 318 plastovych dilku — je to posledni auto ktere Enzo Ferrari osobne schvalil. Nas cil je ten pribeh vypraved a pomoct ti rozhodnout jestli set stoji za koupi.
        </p>

        <h2 className="font-serif font-bold tracking-[-0.02em] text-[24px] pt-4" style={{ color: 'var(--text)' }}>
          Co delame
        </h2>
        <p>
          <strong style={{ color: 'var(--text)' }}>DNA Serie</strong> — hloubkove recenze kde rozebreme historii reálneho auta, analyzujeme LEGO verzi a dame celkove skore od 1 do 10.
        </p>
        <p>
          <strong style={{ color: 'var(--text)' }}>Generace</strong> — srovnani stare a nove generace stejneho modelu. 6-wide vs 8-wide, side by side.
        </p>
        <p>
          <strong style={{ color: 'var(--text)' }}>Pit Stop</strong> — sledujeme ceny na Mall.cz, Alza a LEGO.com. Najdes u nas nejnizsi cenu a muzes nastavit price alert.
        </p>
        <p>
          <strong style={{ color: 'var(--text)' }}>Paddock Rumors</strong> — co LEGO chysta dal? Sledujeme patenty, licence a insider informace.
        </p>

        <h2 className="font-serif font-bold tracking-[-0.02em] text-[24px] pt-4" style={{ color: 'var(--text)' }}>
          Kontakt
        </h2>
        <p>
          Email: <a href="mailto:info@speedchampions.cz" style={{ color: 'var(--gold)' }}>info@speedchampions.cz</a>
        </p>
        <p className="text-sm" style={{ color: 'var(--text3)' }}>
          Eight Wide neni afiliovan s LEGO Group. LEGO a Speed Champions jsou registrovane ochranné znamky LEGO Group.
        </p>
      </div>
    </div>
  )
}
