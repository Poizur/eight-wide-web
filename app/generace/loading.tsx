export default function GeneraceLoading() {
  return (
    <div>
      <div className="pt-[100px] pb-10" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <div className="max-w-content mx-auto px-8">
          <div className="h-3 w-20 rounded bg-sur2 animate-pulse mb-3" />
          <div className="h-14 w-80 rounded bg-sur2 animate-pulse mb-4" />
          <div className="h-4 w-96 rounded bg-sur2 animate-pulse mb-8" />
          <div className="grid grid-cols-2 gap-[3px] rounded-xl overflow-hidden" style={{ maxWidth: 700 }}>
            <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '4/3' }} />
            <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '4/3' }} />
          </div>
        </div>
      </div>
      <div className="max-w-content mx-auto px-8 py-10">
        <div className="grid grid-cols-2 gap-[2px] rounded-xl overflow-hidden" style={{ background: 'var(--bdr)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--sur)' }}>
              <div className="grid grid-cols-2 gap-[2px]" style={{ background: 'var(--bdr)' }}>
                <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '16/9' }} />
                <div className="bg-sur2 animate-pulse" style={{ aspectRatio: '16/9' }} />
              </div>
              <div className="p-4"><div className="h-5 w-40 rounded bg-sur2 animate-pulse" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
