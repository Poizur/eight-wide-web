export default function DnaArticleLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="animate-pulse bg-sur2" style={{ height: '92vh', minHeight: 620 }} />

      {/* Article layout skeleton */}
      <div className="max-w-content mx-auto px-8 py-12">
        <div className="grid gap-14" style={{ gridTemplateColumns: '1fr 320px' }}>
          {/* Main content */}
          <div>
            {/* Chapter skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-14">
                <div className="h-3 w-32 rounded bg-sur2 animate-pulse mb-3" />
                <div className="h-8 w-64 rounded bg-sur2 animate-pulse mb-5" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-sur2 animate-pulse" />
                  <div className="h-4 w-full rounded bg-sur2 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-sur2 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-sur2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            {/* TOC skeleton */}
            <div className="p-5 rounded-xl mb-3" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
              <div className="h-3 w-12 rounded bg-sur2 animate-pulse mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-sur2 animate-pulse mb-3" />
              ))}
            </div>
            {/* Price skeleton */}
            <div className="p-5 rounded-xl mb-3" style={{ background: 'var(--sur)', border: '1px solid var(--bdr)' }}>
              <div className="h-3 w-24 rounded bg-sur2 animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-sur2 animate-pulse mb-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
