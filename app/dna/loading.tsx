export default function DnaLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="py-20" style={{ background: 'linear-gradient(135deg, var(--bg), rgba(201,162,39,0.04))' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="h-3 w-20 rounded bg-sur2 animate-pulse mb-4" />
          <div className="h-16 w-96 rounded bg-sur2 animate-pulse mb-6" />
          <div className="flex gap-8">
            <div className="h-10 w-16 rounded bg-sur2 animate-pulse" />
            <div className="h-10 w-16 rounded bg-sur2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="h-14 flex items-center gap-2 px-8 max-w-content mx-auto" style={{ borderBottom: '1px solid var(--bdr)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-sur2 animate-pulse" />
        ))}
      </div>

      {/* Articles skeleton */}
      <div className="max-w-content mx-auto px-8 py-8">
        {/* Featured */}
        <div className="rounded-lg overflow-hidden mb-[2px]" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
          <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '21/9' }} />
          <div className="p-5">
            <div className="h-3 w-24 rounded bg-sur2 animate-pulse mb-3" />
            <div className="h-7 w-80 rounded bg-sur2 animate-pulse mb-2" />
            <div className="h-4 w-full rounded bg-sur2 animate-pulse" />
          </div>
        </div>

        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-[2px] rounded-lg overflow-hidden mt-[2px]" style={{ background: 'var(--bdr)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: 'var(--sur)' }}>
              <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '16/9' }} />
              <div className="p-[18px]">
                <div className="h-3 w-16 rounded bg-sur2 animate-pulse mb-2" />
                <div className="h-5 w-48 rounded bg-sur2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
