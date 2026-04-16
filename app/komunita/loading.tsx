export default function KomunitaLoading() {
  return (
    <div className="flex items-center" style={{ minHeight: 'calc(100vh - var(--nav-h) - 28px)' }}>
      <div className="max-w-content mx-auto px-8 w-full grid items-center gap-12" style={{ gridTemplateColumns: '1fr 420px' }}>
        <div>
          <div className="h-3 w-36 rounded bg-sur2 animate-pulse mb-3" />
          <div className="h-16 w-96 rounded bg-sur2 animate-pulse mb-4" />
          <div className="h-4 w-80 rounded bg-sur2 animate-pulse mb-8" />
          <div className="flex gap-4 mb-8">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 w-16 rounded bg-sur2 animate-pulse" />)}</div>
          <div className="h-10 w-64 rounded bg-sur2 animate-pulse" />
        </div>
        <div className="h-64 rounded-xl bg-sur animate-pulse" style={{ border: '1px solid var(--bdr)' }} />
      </div>
    </div>
  )
}
