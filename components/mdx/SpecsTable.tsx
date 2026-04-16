interface SpecsTableProps {
  dataJson: string // JSON.stringify([["Motor","V8 biturbo"],["Rok","1987"],...])
}

export function SpecsTable({ dataJson }: SpecsTableProps) {
  const data: [string, string][] = JSON.parse(dataJson)

  return (
    <div className="my-8 rounded-lg overflow-hidden" style={{ border: '1px solid var(--bdr)' }}>
      {data.map(([label, value], i) => (
        <div
          key={i}
          className="grid grid-cols-[160px_1fr]"
          style={{ borderBottom: i < data.length - 1 ? '1px solid var(--bdr)' : 'none' }}
        >
          <div
            className="font-cond text-[11px] font-bold tracking-[0.15em] uppercase px-4 py-3"
            style={{ background: 'var(--sur)', color: 'var(--text3)' }}
          >
            {label}
          </div>
          <div
            className="font-cond text-sm font-bold px-4 py-3"
            style={{ background: 'var(--sur2)', color: 'var(--text)' }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
