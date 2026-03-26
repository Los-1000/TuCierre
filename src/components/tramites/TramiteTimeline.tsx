import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG, TRAMITE_STATUS_ORDER } from '@/lib/constants'
import { CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TramiteStatus } from '@/types/database'

interface StatusHistoryEntry {
  status: string
  notes: string | null
  changed_by: string | null
  created_at: string
}

interface TramiteTimelineProps {
  currentStatus: TramiteStatus
  statusHistory: StatusHistoryEntry[]
  estimatedCompletion: string | null
}

export default function TramiteTimeline({
  currentStatus,
  statusHistory,
  estimatedCompletion,
}: TramiteTimelineProps) {
  // For cancelled tramites, show full order up to the last real step + cancelled at end
  const isCancelled = currentStatus === 'cancelado'
  const steps = isCancelled
    ? [...TRAMITE_STATUS_ORDER, 'cancelado' as TramiteStatus]
    : TRAMITE_STATUS_ORDER

  const currentConfig = TRAMITE_STATUS_CONFIG[currentStatus]
  const currentStep = currentConfig?.step ?? -1

  // Build a map of status → history entry (latest entry wins)
  const historyMap = statusHistory.reduce<Record<string, StatusHistoryEntry>>(
    (acc, entry) => {
      acc[entry.status] = entry
      return acc
    },
    {}
  )

  const getStepState = (status: TramiteStatus): 'completed' | 'current' | 'future' => {
    if (status === currentStatus) return 'current'
    const stepConfig = TRAMITE_STATUS_CONFIG[status]
    if (!stepConfig) return 'future'
    if (status === 'cancelado') {
      return isCancelled ? 'current' : 'future'
    }
    return stepConfig.step < currentStep ? 'completed' : 'future'
  }

  const formatEstimated = (dateStr: string) => {
    const date = new Date(dateStr)
    const dayLabel = format(date, "d 'de' MMMM", { locale: es })
    const today = new Date()
    const diffMs = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return dayLabel
    return `${dayLabel} (${diffDays} días hábiles)`
  }

  return (
    <div className="space-y-4">
      {/* Estimated completion banner */}
      {estimatedCompletion && !isCancelled && currentStatus !== 'completado' && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-center gap-2.5">
          <CalendarClock size={16} className="text-accent shrink-0" />
          <span className="text-sm text-accent font-medium">
            Estimado: {formatEstimated(estimatedCompletion)}
          </span>
        </div>
      )}

      {/* Timeline */}
      <ol role="list" className="relative">
        {steps.map((status, index) => {
          const config = TRAMITE_STATUS_CONFIG[status as TramiteStatus]
          if (!config) return null
          const state = getStepState(status as TramiteStatus)
          const historyEntry = historyMap[status]
          const isLast = index === steps.length - 1

          return (
            <li key={status} role="listitem" className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[15px] top-8 bottom-0 w-0.5',
                    state === 'completed' ? 'bg-accent' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step dot */}
              <div className="relative shrink-0 flex items-start justify-center pt-0.5">
                {state === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : state === 'current' ? (
                  <div className="w-8 h-8 rounded-full bg-accent ring-4 ring-accent/30 animate-pulse flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-border bg-white" />
                )}
              </div>

              {/* Step content */}
              <div
                className={cn(
                  'flex-1 min-w-0 rounded-lg p-3 -mt-1',
                  state === 'current' && 'bg-accent/5 border border-accent/20'
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      state === 'completed'
                        ? 'text-slate-900'
                        : state === 'current'
                        ? 'text-accent'
                        : 'text-slate-400'
                    )}
                  >
                    {config.label}
                  </span>
                  {historyEntry && (
                    <time
                      dateTime={historyEntry.created_at}
                      className="text-xs text-slate-400 tabular-nums shrink-0"
                    >
                      {formatDateTime(historyEntry.created_at)}
                    </time>
                  )}
                </div>

                {historyEntry?.notes && (
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {historyEntry.notes}
                  </p>
                )}

                {historyEntry?.changed_by && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    por {historyEntry.changed_by}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
