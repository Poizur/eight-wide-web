export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="animate-pulse bg-sur2" style={{ height: '85vh', minHeight: 560 }} />

      <div className="max-w-content mx-auto px-8 py-8">
        {/* Section head */}
        <div className="flex items-center justify-between py-11 pb-5 mb-6" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <div className="h-4 w-32 rounded bg-sur2 animate-pulse" />
          <div className="h-3 w-24 rounded bg-sur2 animate-pulse" />
        </div>

        {/* Article grid */}
        <div className="grid gap-[2px] rounded-[10px] overflow-hidden" style={{ gridTemplateColumns: '1.55fr 1fr', background: 'var(--bdr)' }}>
          <div className="bg-sur animate-pulse" style={{ aspectRatio: '3/2' }} />
          <div className="flex flex-col gap-[2px]">
            <div className="bg-sur animate-pulse flex-1" />
            <div className="bg-sur animate-pulse flex-1" />
            <div className="bg-sur animate-pulse flex-1" />
          </div>
        </div>

        {/* 3-grid */}
        <div className="grid grid-cols-3 gap-[2px] mt-[2px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-sur animate-pulse rounded" style={{ aspectRatio: '4/3' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
