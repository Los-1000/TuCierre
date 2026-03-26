'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { PriceMatchStatus } from '@/types/database'
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface PriceMatchRow {
  id: string
  broker_id: string
  tramite_type_id: string
  competitor_name: string
  competitor_price: number
  evidence_url: string | null
  status: PriceMatchStatus
  our_matched_price: number | null
  reviewed_at: string | null
  created_at: string
  brokers: { full_name: string } | null
  tramite_types: { display_name: string } | null
  // our_base_price is not in DB, we derive from tramite_types or show competitor as reference
}

interface ActionState {
  id: string
  matchedPrice: number
  loading: boolean
}

export default function AdminPriceMatchPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [requests, setRequests] = useState<PriceMatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
  const [showResolved, setShowResolved] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('price_match_requests')
      .select('*, brokers(full_name), tramite_types(display_name)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error al cargar solicitudes')
    } else {
      const rows = (data ?? []) as unknown as PriceMatchRow[]
      setRequests(rows)

      // Initialize action states for pending requests
      const states: Record<string, ActionState> = {}
      for (const r of rows) {
        if (r.status === 'pending') {
          states[r.id] = {
            id: r.id,
            matchedPrice: r.competitor_price,
            loading: false,
          }
        }
      }
      setActionStates(states)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  function setMatchedPrice(id: string, value: number) {
    setActionStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], matchedPrice: value },
    }))
  }

  function setRowLoading(id: string, loading: boolean) {
    setActionStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], loading },
    }))
  }

  async function handleApprove(id: string) {
    const state = actionStates[id]
    if (!state) return
    setRowLoading(id, true)

    try {
      const { error } = await supabase
        .from('price_match_requests')
        .update({
          status: 'approved',
          our_matched_price: state.matchedPrice,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Price match aprobado')
      fetchRequests()
    } catch (err: unknown) {
      toast.error('Error al aprobar la solicitud')
      console.error(err)
      setRowLoading(id, false)
    }
  }

  async function handleReject(id: string) {
    setRowLoading(id, true)

    try {
      const { error } = await supabase
        .from('price_match_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Solicitud rechazada')
      fetchRequests()
    } catch (err: unknown) {
      toast.error('Error al rechazar la solicitud')
      console.error(err)
      setRowLoading(id, false)
    }
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  function StatusPill({ status }: { status: PriceMatchStatus }) {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Aprobado
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} />
          Rechazado
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
        <Clock size={12} />
        Pendiente
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Match</h1>
          <p className="text-sm text-gray-500 mt-1">Revisión de solicitudes de igualación de precio</p>
        </div>
        {pending.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Pending requests */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Solicitudes pendientes
          {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({pending.length})</span>}
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
            <Loader2 size={18} className="animate-spin" />
            Cargando solicitudes...
          </div>
        ) : pending.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-sm text-gray-500">No hay solicitudes pendientes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => {
              const state = actionStates[r.id]
              const isLoading = state?.loading ?? false

              return (
                <Card key={r.id} className="border border-yellow-200 shadow-sm bg-white">
                  <CardContent className="p-5 space-y-4">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Broker</p>
                        <p className="text-sm font-semibold text-gray-900">{r.brokers?.full_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Tipo</p>
                        <p className="text-sm font-semibold text-gray-900">{r.tramite_types?.display_name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Competidor</p>
                        <p className="text-sm font-semibold text-gray-900">{r.competitor_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Precio competidor</p>
                        <p className="text-sm font-semibold text-red-600">{formatPrice(r.competitor_price)}</p>
                      </div>
                    </div>

                    {/* Evidence */}
                    {r.evidence_url && (
                      <div>
                        <a
                          href={r.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                        >
                          <ExternalLink size={12} />
                          Ver evidencia
                        </a>
                      </div>
                    )}

                    <hr className="border-gray-100" />

                    {/* Action area */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      <div className="space-y-1.5 flex-1">
                        <label className="text-xs font-medium text-gray-700">
                          Precio igualado propuesto
                        </label>
                        <div className="relative max-w-xs">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">S/.</span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={state?.matchedPrice ?? r.competitor_price}
                            onChange={(e) => setMatchedPrice(r.id, parseFloat(e.target.value) || 0)}
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          Precio del competidor: {formatPrice(r.competitor_price)}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(r.id)}
                          disabled={isLoading}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <XCircle size={14} className="mr-1" />}
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(r.id)}
                          disabled={isLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <CheckCircle2 size={14} className="mr-1" />}
                          Aprobar con precio igualado
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400">Recibido {formatDate(r.created_at)}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Resolved requests */}
      {!loading && resolved.length > 0 && (
        <section>
          <button
            className="flex items-center gap-2 text-base font-semibold text-gray-700 hover:text-gray-900 mb-4"
            onClick={() => setShowResolved((v) => !v)}
          >
            Solicitudes resueltas
            <span className="text-sm font-normal text-gray-400">({resolved.length})</span>
            {showResolved ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showResolved && (
            <div className="space-y-3">
              {resolved.map((r) => (
                <Card key={r.id} className="border border-gray-200 shadow-sm bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {r.brokers?.full_name ?? '—'}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-600">{r.tramite_types?.display_name ?? '—'}</span>
                          <StatusPill status={r.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Competidor: <strong className="text-gray-700">{r.competitor_name}</strong></span>
                          <span>Precio competidor: <strong className="text-gray-700">{formatPrice(r.competitor_price)}</strong></span>
                          {r.status === 'approved' && r.our_matched_price != null && (
                            <span>Precio igualado: <strong className="text-emerald-700">{formatPrice(r.our_matched_price)}</strong></span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 shrink-0">
                        {r.reviewed_at ? formatDate(r.reviewed_at) : formatDate(r.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
