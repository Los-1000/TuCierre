'use client'

import { CheckCircle2, ExternalLink } from 'lucide-react'
import { cn, formatDate, formatPrice } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonCard'
import type { PriceMatchRequest, PriceMatchStatus, TramiteType } from '@/types/database'

export type PriceMatchRow = PriceMatchRequest & {
  tramite_types?: TramiteType | null
}

const STATUS_CONFIG: Record<PriceMatchStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Aprobado',   className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rechazado',  className: 'bg-red-50 text-red-700 border-red-200' },
}

interface Props {
  requests: PriceMatchRow[]
  requestsLoading: boolean
}

export default function PriceMatchHistoryList({ requests, requestsLoading }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Mis solicitudes previas</h2>

      {requestsLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="Sin solicitudes aún"
          description="Cuando envíes una solicitud de price match, aparecerá aquí con su estado actual."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const statusConf = STATUS_CONFIG[req.status]
            return (
              <div key={req.id} className="rounded-3xl border border-[#18181B]/8 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#18181B] text-sm truncate">
                      {req.tramite_types?.display_name ?? 'Trámite notarial'}
                    </div>
                    <div className="text-xs text-[#6B7A9A] mt-0.5">
                      Enviado {formatDate(req.created_at)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border shrink-0',
                      statusConf.className
                    )}
                  >
                    {statusConf.label}
                  </span>
                </div>

                {req.status === 'approved' && req.our_matched_price != null && (
                  <div className="bg-[#2855E0]/8 border border-[#2855E0]/20 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#2855E0] font-medium mb-0.5">
                        Precio igualado
                      </div>
                      <div className="text-xl font-bold text-[#2855E0] tabular-nums font-mono">
                        {formatPrice(req.our_matched_price)}
                      </div>
                    </div>
                    <CheckCircle2 size={28} className="text-[#2855E0] shrink-0" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#18181B]/60">
                  <div>
                    <span className="text-[#6B7A9A]">Notaría competidora</span>
                    <div className="font-medium text-[#18181B] mt-0.5">
                      {req.competitor_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#6B7A9A]">Precio cotizado</span>
                    <div className="font-semibold text-[#18181B] tabular-nums font-mono mt-0.5">
                      {formatPrice(req.competitor_price)}
                    </div>
                  </div>
                  {req.reviewed_at && (
                    <div>
                      <span className="text-[#6B7A9A]">Revisado</span>
                      <div className="font-medium text-[#18181B] mt-0.5">
                        {formatDate(req.reviewed_at)}
                      </div>
                    </div>
                  )}
                  {req.evidence_url && (
                    <div>
                      <span className="text-[#6B7A9A]">Evidencia</span>
                      <div className="mt-0.5">
                        <a
                          href={req.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2855E0] hover:underline font-medium"
                        >
                          Ver documento
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
