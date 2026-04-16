import Image from 'next/image'
import { setImageUrl } from '@/lib/affiliate'

interface RvbCompareProps {
  realPhoto: string
  legoSetNumber: string
  realLabel?: string
  legoLabel?: string
}

export function RvbCompare({
  realPhoto,
  legoSetNumber,
  realLabel = 'Reality',
  legoLabel = 'LEGO',
}: RvbCompareProps) {
  return (
    <div
      className="grid grid-cols-2 gap-[3px] my-8 rounded-lg overflow-hidden"
      style={{ background: 'var(--bdr)' }}
    >
      {/* Real */}
      <div className="group relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Image
          src={realPhoto}
          alt={realLabel}
          fill
          className="object-cover photo-dark"
          sizes="50vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.9) 0%, transparent 60%)' }}
        />
        <span
          className="absolute top-3 left-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm z-[2]"
          style={{ background: 'rgba(200,40,30,0.85)', color: 'white' }}
        >
          {realLabel}
        </span>
        <div className="absolute bottom-3 left-3 z-[2]">
          <div className="font-cond text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.4)' }}>Realne auto</div>
          <div className="font-cond text-lg font-black uppercase" style={{ color: 'var(--text)' }}>{realLabel}</div>
        </div>
      </div>

      {/* LEGO */}
      <div className="group relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Image
          src={setImageUrl(legoSetNumber)}
          alt={legoLabel}
          fill
          className="object-cover photo-dark"
          sizes="50vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,12,16,0.9) 0%, transparent 60%)' }}
        />
        <span
          className="absolute top-3 left-3 font-cond text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm z-[2]"
          style={{ background: 'rgba(201,162,39,0.85)', color: '#000' }}
        >
          {legoLabel}
        </span>
        <div className="absolute bottom-3 left-3 z-[2]">
          <div className="font-cond text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.4)' }}>Set {legoSetNumber}</div>
          <div className="font-cond text-lg font-black uppercase" style={{ color: 'var(--text)' }}>{legoLabel}</div>
        </div>
      </div>
    </div>
  )
}
