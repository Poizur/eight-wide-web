interface LegoRatingProps {
  setNumber: string
  overallJson: string  // JSON.stringify(9.2)
  shapeJson: string
  detailJson: string
  buildJson: string
  valueJson: string
  displayJson: string
  verdict?: string
}

const categories = [
  { key: 'shape', label: 'Tvar & proporce', weight: '25 %' },
  { key: 'detail', label: 'Detail & vernost', weight: '25 %' },
  { key: 'build', label: 'Stavba', weight: '20 %' },
  { key: 'value', label: 'Hodnota', weight: '20 %' },
  { key: 'display', label: 'Display efekt', weight: '10 %' },
]

export function LegoRating({
  setNumber,
  overallJson,
  shapeJson,
  detailJson,
  buildJson,
  valueJson,
  displayJson,
  verdict,
}: LegoRatingProps) {
  const overall = JSON.parse(overallJson) as number
  const scores: Record<string, number> = {
    shape: JSON.parse(shapeJson),
    detail: JSON.parse(detailJson),
    build: JSON.parse(buildJson),
    value: JSON.parse(valueJson),
    display: JSON.parse(displayJson),
  }

  return (
    <div
      className="my-10 p-7 rounded-xl"
      style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-6 mb-6"
        style={{ borderBottom: '1px solid var(--bdr)' }}
      >
        <div>
          <div className="font-cond text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--text3)' }}>
            LEGO Rating · Set {setNumber}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-cond text-[48px] font-black leading-none" style={{ color: 'var(--gold)' }}>
            {overall.toFixed(1)}
          </span>
          <span className="font-cond text-lg" style={{ color: 'var(--text3)' }}>/10</span>
        </div>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-4 mb-6">
        {categories.map((cat) => {
          const score = scores[cat.key] ?? 0
          return (
            <div key={cat.key} className="grid items-center gap-3" style={{ gridTemplateColumns: '140px 1fr 36px' }}>
              <div className="font-cond text-xs font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--text2)' }}>
                {cat.label}
                <span className="ml-1 text-[9px]" style={{ color: 'var(--text3)' }}>({cat.weight})</span>
              </div>
              <div className="h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-sm transition-all duration-[800ms] ease-out"
                  style={{ width: `${score * 10}%`, background: 'var(--gold)' }}
                />
              </div>
              <div className="font-cond text-[13px] font-black text-right" style={{ color: 'var(--text)' }}>
                {score.toFixed(1)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="text-sm leading-[1.65]" style={{ color: 'var(--text2)' }}>
          <strong style={{ color: 'var(--text)' }}>Verdikt:</strong> {verdict}
        </div>
      )}
    </div>
  )
}
