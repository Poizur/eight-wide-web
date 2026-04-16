import { SectionHead } from './SectionHead'

const timelineData = [
  { year: '2015', era: '6-wide era zacina', desc: 'Prvni Speed Champions sety. Mensi scale, zakladni detaily. Ferrari, McLaren, Porsche jako prvni znacky.', stat: '17 setu · 150–200 dilku', key: false },
  { year: '2017', era: 'Spoluprace s Ferrari', desc: 'LEGO podepsalo exkluzivni smlouvu s Ferrari. Detailnejsi modely, Scuderia livery, prvni minifigurky s helmami.', stat: '5 Ferrari setu za rok', key: false },
  { year: '2020', era: '8-wide revoluce', desc: 'Nejvetsi redesign v historii serie. Auta o 25 % sirsi, dramaticky vice detailu, vernejsi proporce. Zlomovy rok.', stat: '+25 % dilku · nove techniky stavby', key: true },
  { year: '2022', era: 'Zlaty vek detailu', desc: 'Lotus, Lamborghini Countach, Ferrari 512M. Nejdetailnejsi sety do te doby.', stat: 'Prumer 270 dilku na set', key: false },
  { year: '2026', era: 'Soucasnost', desc: 'McLaren W1, Ferrari SF90, Porsche 911 GT3 RS. Serie je na vrcholu. 150+ setu celkem od roku 2015.', stat: '150+ setu celkem', key: false },
]

export function SeriesTimeline() {
  return (
    <div style={{ background: 'var(--sur2)', paddingBottom: 8 }}>
      <div className="max-w-content mx-auto px-8">
        <SectionHead title="Vyvoj serie" sub="— od 6-wide k 8-wide" />
        <div className="relative py-2 pb-8">
          {/* Vertical line */}
          <div className="absolute left-12 top-0 bottom-0 w-px" style={{ background: 'var(--bdr)' }} />

          <div className="flex flex-col gap-[2px]">
            {timelineData.map((item) => (
              <div
                key={item.year}
                className="grid items-start relative"
                style={{
                  gridTemplateColumns: '96px 80px 1fr',
                  background: 'var(--sur)',
                  padding: '20px 24px 20px 0',
                }}
              >
                {/* Dot */}
                <div
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    left: 44,
                    top: 24,
                    background: item.key ? 'var(--gold)' : 'var(--bdr)',
                    border: item.key ? '2px solid var(--bg)' : '2px solid var(--sur2)',
                    boxShadow: item.key ? '0 0 0 3px rgba(201,162,39,0.25)' : 'none',
                  }}
                />

                {/* Year */}
                <div
                  className="font-cond text-[28px] font-black leading-none pl-[70px] pt-0.5"
                  style={{ color: item.key ? 'var(--gold)' : 'rgba(255,255,255,0.12)' }}
                >
                  {item.year}
                </div>

                <div />

                {/* Content */}
                <div
                  style={{
                    background: item.key ? 'rgba(201,162,39,0.04)' : 'transparent',
                    borderLeft: item.key ? '2px solid rgba(201,162,39,0.3)' : 'none',
                    paddingLeft: item.key ? 16 : 0,
                  }}
                >
                  <div className="font-cond text-sm font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: 'var(--text)' }}>
                    {item.era} {item.key && '★'}
                  </div>
                  <div className="text-[13px] leading-[1.55] mb-2 max-w-[580px]" style={{ color: 'var(--text2)' }}>
                    {item.desc}
                  </div>
                  <div className="font-cond text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--gold)' }}>
                    {item.stat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
