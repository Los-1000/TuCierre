import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { PriceMatchStatus } from '@/types/database'
import { CheckCircle2, XCircle, ExternalLink, Clock, ChevronDown } from 'lucide-react'

interface PriceMatchRow {
  id: string
  competitor_name: string
  competitor_price: number
  evidence_url: string | null
  status: PriceMatchStatus
  our_matched_price: number | null
  reviewed_at: string | null
  created_at: string
  brokers: { full_name: string } | null
  tramite_types: { display_name: string } | null
}

function StatusPill({ status }: { status: PriceMatchStatus }) {
  if (status === 'approved')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} /> Aprobado
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} /> Rechazado
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock size={12} /> Pendiente
    </span>
  )
}

export default async function AdminPriceMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brokerResult } = await supabase
    .from('brokers')
    .select('is_admin, id')
    .eq('id', user.id)
    .single()

  const broker = brokerResult as { is_admin: boolean; id: string } | null
  if (!broker?.is_admin) redirect('/dashboard')

  // Price match is managed exclusively by SuperAdmin
  redirect('/admin')

  // Use admin client to bypass RLS — fetch all price match requests for brokers of this notaría
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('price_match_requests')
    .select('*, brokers!broker_id(full_name), tramite_types(display_name)')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as PriceMatchRow[]
  const pending = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Match</h1>
          <p className="text-sm text-gray-500 mt-1">Solicitudes de igualación de precio de tus brokers</p>
        </div>
        {pending.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Solicitudes pendientes
          <span className="ml-2 text-sm font-normal text-gray-400">({pending.length})</span>
        </h2>

        {pending.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-sm text-gray-500">No hay solicitudes pendientes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map(r => (
              <Card key={r.id} className="border border-yellow-200 shadow-sm bg-white">
                <CardContent className="p-5 space-y-4">
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

                  {r.evidence_url && (
                    <a
                      href={r.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                    >
                      <ExternalLink size={12} />
                      Ver evidencia
                    </a>
                  )}

                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Clock size={14} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700">
                      En revisión por SuperAdmin — recibirás respuesta pronto.
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">Recibido {formatDate(r.created_at)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <details className="group">
            <summary className="flex items-center gap-2 text-base font-semibold text-gray-700 hover:text-gray-900 mb-4 cursor-pointer list-none">
              Solicitudes resueltas
              <span className="text-sm font-normal text-gray-400">({resolved.length})</span>
              <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
            </summary>
            <div className="space-y-3">
              {resolved.map(r => (
                <Card key={r.id} className="border border-gray-200 shadow-sm bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-gray-900">{r.brokers?.full_name ?? '—'}</span>
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
          </details>
        </section>
      )}
    </div>
  )
}
