import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type { PriceMatchStatus } from '@/types/database'

interface PriceMatchRow {
  id: string
  competitor_name: string
  competitor_price: number
  our_matched_price: number | null
  evidence_url: string | null
  status: PriceMatchStatus
  created_at: string
  reviewed_at: string | null
  brokers: { full_name: string; email: string } | null
  tramite_types: { display_name: string } | null
}

const STATUS_CONFIG: Record<PriceMatchStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Aprobado',  className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function SuperAdminPriceMatchPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('price_match_requests')
    .select('*, brokers!broker_id(full_name, email), tramite_types(display_name)')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as PriceMatchRow[]

  const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Match</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todas las solicitudes de price match ({requests.length})
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['pending', 'approved', 'rejected'] as PriceMatchStatus[]).map(s => (
          <div
            key={s}
            className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm"
          >
            <div className="text-2xl font-bold text-slate-900">{byStatus[s] ?? 0}</div>
            <div className="text-xs text-slate-500 mt-0.5">{STATUS_CONFIG[s].label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Broker',
                'Tipo de trámite',
                'Notaría competidora',
                'Precio cotizado',
                'Precio igualado',
                'Estado',
                'Fecha',
                'Evidencia',
              ].map(h => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No hay solicitudes de price match
                </td>
              </tr>
            ) : (
              requests.map(r => {
                const statusConf = STATUS_CONFIG[r.status]
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-xs">
                        {r.brokers?.full_name ?? '—'}
                      </div>
                      <div className="text-slate-400 text-xs">{r.brokers?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.tramite_types?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{r.competitor_name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-xs">
                      {formatPrice(r.competitor_price)}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-xs">
                      {r.our_matched_price != null ? (
                        <span className="font-semibold text-green-700">
                          {formatPrice(r.our_matched_price)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
                          statusConf.className
                        )}
                      >
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {r.evidence_url ? (
                        <a
                          href={r.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Ver <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
