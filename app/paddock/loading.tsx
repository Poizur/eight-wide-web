export default function PaddockLoading() {
  return (
    <div>
      <div className="pt-[100px] pb-10" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="h-3 w-32 rounded bg-sur2 animate-pulse mb-3" />
          <div className="h-14 w-72 rounded bg-sur2 animate-pulse mb-6" />
          <div className="flex gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="h-5 w-28 rounded bg-sur2 animate-pulse" />)}</div>
        </div>
      </div>
      <div className="max-w-content mx-auto px-8 py-10">
        <div className="h-48 rounded-xl bg-sur animate-pulse mb-6" style={{ border: '1px solid var(--bdr)' }} />
        <div className="grid grid-cols-2 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-sur animate-pulse" />)}
        </div>
      </div>
    </div>
  )
}
