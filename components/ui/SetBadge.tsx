interface SetBadgeProps {
  setNumber: string
}

export function SetBadge({ setNumber }: SetBadgeProps) {
  return (
    <div
      className="absolute top-3 right-3 text-center opacity-0 -translate-y-[3px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
      style={{
        background: 'rgba(10,12,16,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        padding: '6px 10px',
      }}
    >
      <div
        className="font-cond text-[7px] font-bold tracking-[0.18em] uppercase"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        SET NO.
      </div>
      <div
        className="font-cond text-sm font-black leading-none"
        style={{ color: 'rgba(255,255,255,0.9)' }}
      >
        {setNumber}
      </div>
    </div>
  )
}
