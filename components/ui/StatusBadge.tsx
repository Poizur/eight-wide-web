import type { SetStatus } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

const config: Record<SetStatus, { label: string; color: string; bg: string }> = {
  available: {
    label: 'Dostupny',
    color: 'var(--green)',
    bg: 'rgba(39,174,96,0.12)',
  },
  retiring: {
    label: 'Retiring',
    color: 'var(--orange)',
    bg: 'rgba(230,126,34,0.12)',
  },
  retired: {
    label: 'Retired',
    color: 'var(--red)',
    bg: 'rgba(200,40,30,0.12)',
  },
  upcoming: {
    label: 'Chystane',
    color: 'var(--blue)',
    bg: 'rgba(52,152,219,0.12)',
  },
}

interface StatusBadgeProps {
  status: SetStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = config[status]

  return (
    <span
      className={cn(
        'font-cond text-[10px] font-bold tracking-[0.16em] uppercase inline-flex items-center gap-1.5 px-2 py-1 rounded',
        className
      )}
      style={{ color: c.color, background: c.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: c.color }}
      />
      {c.label}
    </span>
  )
}
