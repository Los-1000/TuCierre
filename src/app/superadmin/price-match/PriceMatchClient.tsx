'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react'
import type { PriceMatchStatus } from '@/types/database'
import { approvePriceMatch, rejectPriceMatch } from './actions'
import type { PriceMatchRow } from './page'

const STATUS_CONFIG: Record<PriceMatchStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Aprobado',  className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default function PriceMatchClient({
  initialRequests,
}: {
  initialRequests: PriceMatchRow[]
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [matchedPrices, setMatchedPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialRequests.map(r => [r.id, r.competitor_price]))
  )
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const pending = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    const result = await approvePriceMatch(id, matchedPrices[id] ?? 0)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: 'approved', our_matched_price: matchedPrices[id], reviewed_at: new Date().toISOString() }
          : r
      )
    )
    toast.success('Price match aprobado')
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    const result = await rejectPriceMatch(id)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: 'rejected', reviewed_at: new Date().toISOString() }
          : r
      )
    )
    toast.success('Solicitud rechazada')
  }

  const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Match</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las solicitudes de igualación de precio ({requests.length})
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

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">
            Pendientes <span className="text-sm font-normal text-slate-400">({pending.length})</span>
          </h2>
          {pending.map(r => {
            const isLoading = loadingId === r.id
            return (
              <Card key={r.id} className="border border-amber-200 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Broker</p>
                      <p className="text-sm font-semibold text-slate-900">{r.brokers?.full_name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{r.brokers?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tipo</p>
                      <p className="text-sm font-semibold text-slate-900">{r.tramite_types?.display_name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Competidor</p>
                      <p className="text-sm font-semibold text-slate-900">{r.competitor_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Precio competidor</p>
                      <p className="text-sm font-semibold text-red-600">{formatPrice(r.competitor_price)}</p>
                    </div>
                  </div>

                  {r.evidence_url && (
                    <a
                      href={r.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink size={12} />
                      Ver evidencia
                    </a>
                  )}

                  <hr className="border-slate-100" />

                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-medium text-slate-700">
                        Precio igualado propuesto
                      </label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">S/.</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={matchedPrices[r.id] ?? r.competitor_price}
                          onChange={e =>
                            setMatchedPrices(prev => ({ ...prev, [r.id]: parseFloat(e.target.value) || 0 }))
                          }
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(r.id)}
                        disabled={isLoading}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle size={14} className="mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(r.id)}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 size={14} className="mr-1" />
                        {isLoading ? 'Procesando...' : 'Aprobar'}
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">Recibido {formatDate(r.created_at)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">
            Resueltas <span className="text-sm font-normal text-slate-400">({resolved.length})</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['Broker', 'Tipo', 'Competidor', 'Precio comp.', 'Precio igualado', 'Estado', 'Fecha', 'Evidencia'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resolved.map(r => {
                  const statusConf = STATUS_CONFIG[r.status]
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 text-xs">{r.brokers?.full_name ?? '—'}</div>
                        <div className="text-slate-400 text-xs">{r.brokers?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{r.tramite_types?.display_name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{r.competitor_name}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-xs">{formatPrice(r.competitor_price)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-xs">
                        {r.our_matched_price != null
                          ? <span className="font-semibold text-green-700">{formatPrice(r.our_matched_price)}</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', statusConf.className)}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        {r.evidence_url
                          ? <a href={r.evidence_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">Ver <ExternalLink size={10} /></a>
                          : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">No hay solicitudes de price match</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
