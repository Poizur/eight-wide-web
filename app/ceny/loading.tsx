export default function CenyLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="pt-[100px] pb-10" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8 grid items-end gap-8" style={{ gridTemplateColumns: '1fr auto' }}>
          <div>
            <div className="h-3 w-16 rounded bg-sur2 animate-pulse mb-3" />
            <div className="h-14 w-72 rounded bg-sur2 animate-pulse mb-3" />
            <div className="h-3 w-64 rounded bg-sur2 animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 w-28 rounded-[10px] bg-sur animate-pulse" style={{ border: '1px solid var(--bdr)' }} />)}
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="h-[52px] flex items-center gap-4 px-8 max-w-content mx-auto" style={{ borderBottom: '1px solid var(--bdr)' }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-24 rounded bg-sur2 animate-pulse" />)}
      </div>
      {/* Table skeleton */}
      <div className="max-w-content mx-auto px-8 py-8">
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
          <div className="h-10" style={{ background: 'var(--sur2)', borderBottom: '1px solid var(--bdr)' }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse" style={{ borderBottom: '1px solid var(--bdr)', background: i % 2 === 0 ? 'var(--sur)' : 'var(--sur2)', opacity: 0.5 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
