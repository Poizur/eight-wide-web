export default function HofLoading() {
  return (
    <div>
      <div className="py-24" style={{ background: 'linear-gradient(135deg, var(--bg), rgba(201,162,39,0.04))' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="h-3 w-24 rounded bg-sur2 animate-pulse mb-3" />
          <div className="h-16 w-72 rounded bg-sur2 animate-pulse mb-4" />
          <div className="h-4 w-96 rounded bg-sur2 animate-pulse" />
        </div>
      </div>
      <div className="max-w-content mx-auto px-8 py-10 grid gap-10" style={{ gridTemplateColumns: '1fr 260px' }}>
        <div>
          <div className="h-40 w-full rounded-xl bg-sur animate-pulse mb-[2px]" style={{ border: '1px solid var(--bdr)' }} />
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 w-full bg-sur animate-pulse mb-[2px]" />)}
        </div>
        <div className="h-64 rounded-xl bg-sur animate-pulse" style={{ border: '1px solid var(--bdr)' }} />
      </div>
    </div>
  )
}
