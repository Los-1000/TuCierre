import { cn } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import type { TramiteStatus } from '@/types/database'

interface StatusBadgeProps {
  status: TramiteStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = TRAMITE_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.bg, config.text, config.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      )}
    >
      {config.label}
    </span>
  )
}
