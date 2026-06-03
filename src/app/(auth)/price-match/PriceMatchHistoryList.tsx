'use client'

import { CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'
import type { PriceMatchRequest, TramiteType } from '@/types/database'

export type PriceMatchRow = PriceMatchRequest & {
  tramite_types?: TramiteType | null
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente',  bg: '#fef9ee', text: '#b2832e', Icon: Clock },
  approved: { label: 'Aprobado',   bg: '#ecfdf5', text: '#059669', Icon: CheckCircle2 },
  rejected: { label: 'Rechazado',  bg: '#fef2f2', text: '#dc2626', Icon: XCircle },
} as const

interface Props {
  requests: PriceMatchRow[]
  requestsLoading: boolean
}

export default function PriceMatchHistoryList({ requests, requestsLoading }: Props) {
  if (requestsLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 bg-navy-100 rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-navy-100 p-5 space-y-3 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 w-40 bg-navy-100 rounded" />
              <div className="h-6 w-20 bg-navy-100 rounded-full" />
            </div>
            <div className="h-3 w-28 bg-navy-50 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-navy-50 rounded-lg" />
              <div className="h-10 bg-navy-50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-navy-100 p-10 text-center">
        <p className="text-navy-400 text-sm font-medium">Sin solicitudes previas</p>
        <p className="text-navy-300 text-xs mt-1">Tus solicitudes de price match aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-navy-900">Mis solicitudes</h2>

      {requests.map((req) => {
        const conf = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
        const { Icon } = conf
        return (
          <div key={req.id} className="bg-white rounded-xl border border-navy-100 p-5 space-y-4">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-900 truncate">
                  {req.tramite_types?.display_name ?? 'Trámite notarial'}
                </div>
                <div className="text-xs text-navy-400 mt-0.5">
                  Enviado el {formatDate(req.created_at)}
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                style={{ background: conf.bg, color: conf.text }}
              >
                <Icon size={11} />
                {conf.label}
              </span>
            </div>

            {/* Approved price banner */}
            {req.status === 'approved' && req.our_matched_price != null && (
              <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#eff2ff' }}>
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: '#2c4dfb' }}>Precio igualado</div>
                  <div className="text-xl font-bold tabular-nums font-mono" style={{ color: '#2c4dfb' }}>
                    {formatPrice(req.our_matched_price)}
                  </div>
                </div>
                <CheckCircle2 size={26} style={{ color: '#2c4dfb' }} className="opacity-70" />
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-navy-50 rounded-lg px-3 py-2.5">
                <div className="text-xs text-navy-400 mb-0.5">Notaría competidora</div>
                <div className="text-sm font-semibold text-navy-900 truncate">{req.competitor_name}</div>
              </div>
              <div className="bg-navy-50 rounded-lg px-3 py-2.5">
                <div className="text-xs text-navy-400 mb-0.5">Precio cotizado</div>
                <div className="text-sm font-semibold text-navy-900 tabular-nums font-mono">{formatPrice(req.competitor_price)}</div>
              </div>
              {req.reviewed_at && (
                <div className="bg-navy-50 rounded-lg px-3 py-2.5">
                  <div className="text-xs text-navy-400 mb-0.5">Revisado</div>
                  <div className="text-sm font-medium text-navy-900">{formatDate(req.reviewed_at)}</div>
                </div>
              )}
              {req.evidence_url && (
                <div className="bg-navy-50 rounded-lg px-3 py-2.5">
                  <div className="text-xs text-navy-400 mb-0.5">Evidencia</div>
                  <a
                    href={req.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: '#2c4dfb' }}
                  >
                    Ver documento <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
