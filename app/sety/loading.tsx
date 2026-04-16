export default function SetyLoading() {
  return (
    <div>
      {/* Search hero skeleton */}
      <div className="pt-[100px]" style={{ background: 'linear-gradient(to bottom, rgba(201,162,39,0.03), transparent)' }}>
        <div className="max-w-content mx-auto px-8 pb-9" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div className="h-3 w-24 rounded bg-sur2 animate-pulse mb-3" />
          <div className="h-14 w-80 rounded bg-sur2 animate-pulse mb-6" />
          <div className="h-12 w-[680px] rounded-[9px] bg-sur2 animate-pulse mb-5" />
          <div className="flex gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-9 w-16 rounded bg-sur2 animate-pulse" />)}
          </div>
        </div>
      </div>
      {/* Layout skeleton */}
      <div className="max-w-content mx-auto px-8 grid gap-8 pt-8" style={{ gridTemplateColumns: '240px 1fr' }}>
        {/* Sidebar */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-3 w-16 rounded bg-sur2 animate-pulse mb-3" />
              {[1, 2, 3, 4].map(j => <div key={j} className="h-7 w-full rounded bg-sur2 animate-pulse mb-1" />)}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div>
          <div className="flex justify-between mb-5">
            <div className="h-4 w-40 rounded bg-sur2 animate-pulse" />
            <div className="flex gap-1">{[1, 2, 3, 4].map(i => <div key={i} className="h-7 w-20 rounded bg-sur2 animate-pulse" />)}</div>
          </div>
          <div className="grid grid-cols-4 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--sur)' }}>
                <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '4/3' }} />
                <div className="p-3.5"><div className="h-3 w-12 rounded bg-sur2 animate-pulse mb-2" /><div className="h-4 w-24 rounded bg-sur2 animate-pulse" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
