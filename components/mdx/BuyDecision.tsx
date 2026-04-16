import { setImageUrl } from '@/lib/affiliate'
import Image from 'next/image'

interface BuyDecisionProps {
  scSetNumber: string
  iconsSetNumber: string
  scName: string
  iconsName: string
  scPieces: number
  iconsPieces: number
  scPrice: number
  iconsPrice: number
  scForJson: string   // JSON.stringify(["Sbirka","Budget","30 min stavba"])
  iconsForJson: string // JSON.stringify(["Stavebni zazitek","Vitrina","Max detail"])
}

export function BuyDecision({
  scSetNumber,
  iconsSetNumber,
  scName,
  iconsName,
  scPieces,
  iconsPieces,
  scPrice,
  iconsPrice,
  scForJson,
  iconsForJson,
}: BuyDecisionProps) {
  const scFor: string[] = JSON.parse(scForJson)
  const iconsFor: string[] = JSON.parse(iconsForJson)

  return (
    <div className="my-10">
      <div
        className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase mb-4 flex items-center gap-3"
        style={{ color: 'var(--gold)' }}
      >
        <span className="block w-6 h-px" style={{ background: 'var(--gold)' }} />
        Ktere koupit?
      </div>

      <div className="grid grid-cols-2 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)' }}>
        {/* SC card */}
        <Card
          label="Speed Champions"
          setNumber={scSetNumber}
          name={scName}
          pieces={scPieces}
          price={scPrice}
          reasons={scFor}
        />
        {/* Icons card */}
        <Card
          label="Icons / Technic"
          setNumber={iconsSetNumber}
          name={iconsName}
          pieces={iconsPieces}
          price={iconsPrice}
          reasons={iconsFor}
        />
      </div>
    </div>
  )
}

function Card({
  label,
  setNumber,
  name,
  pieces,
  price,
  reasons,
}: {
  label: string
  setNumber: string
  name: string
  pieces: number
  price: number
  reasons: string[]
}) {
  return (
    <div className="p-5 flex flex-col" style={{ background: 'var(--sur)' }}>
      <div className="font-cond text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--text3)' }}>
        {label}
      </div>
      <div className="font-cond text-base font-black uppercase mb-0.5" style={{ color: 'var(--text)' }}>
        Set {setNumber}
      </div>
      <div className="font-cond text-xs mb-4" style={{ color: 'var(--text2)' }}>
        {pieces.toLocaleString('cs-CZ')} dilku · {price.toLocaleString('cs-CZ')} Kc
      </div>

      <div className="flex flex-col gap-2 mb-5 flex-1">
        {reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--text2)' }}>
            <span style={{ color: 'var(--gold)' }}>&#10003;</span>
            {r}
          </div>
        ))}
      </div>

      <a
        href={`https://www.lego.com/cs-cz/product/${setNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center font-cond text-xs font-bold tracking-[0.12em] uppercase py-2.5 rounded-md no-underline transition-colors duration-150"
        style={{ background: 'var(--gold)', color: '#000' }}
      >
        Koupit →
      </a>
    </div>
  )
}
