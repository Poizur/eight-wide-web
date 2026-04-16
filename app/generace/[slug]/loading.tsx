export default function GeneraceArticleLoading() {
  return (
    <div>
      <div className="grid grid-cols-2" style={{ height: '80vh', minHeight: 500 }}>
        <div className="bg-sur2 animate-pulse" />
        <div className="bg-sur2 animate-pulse" style={{ opacity: 0.7 }} />
      </div>
      <div className="max-w-[780px] mx-auto px-8 py-12">
        <div className="h-10 w-96 rounded bg-sur2 animate-pulse mb-6" />
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-10">
            <div className="h-3 w-32 rounded bg-sur2 animate-pulse mb-3" />
            <div className="h-7 w-64 rounded bg-sur2 animate-pulse mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(j => <div key={j} className="h-4 w-full rounded bg-sur2 animate-pulse" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
