import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice, formatDate } from '@/lib/utils'
import type { PriceMatchStatus } from '@/types/database'
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'

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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={11} /> Aprobado
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle size={11} /> Rechazado
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D69E2E]/10 text-[#D69E2E] border border-[#D69E2E]/20">
      <Clock size={11} /> Pendiente
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

  // Use admin client to bypass RLS — fetch all price match requests
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('price_match_requests')
    .select('*, brokers!broker_id(full_name), tramite_types(display_name)')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as PriceMatchRow[]
  const pending = requests.filter(r => r.status === 'pending')
  const approved = requests.filter(r => r.status === 'approved')
  const rejected = requests.filter(r => r.status === 'rejected')

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header>
        <div className="flex items-end gap-4 mb-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#18181B]">Price Matching</h1>
          {pending.length > 0 && (
            <span className="mb-1.5 px-3 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider">
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-[#18181B]/60 text-sm max-w-2xl">
          Gestión de solicitudes para igualación de precios de mercado. Revisa la documentación adjunta y aprueba los nuevos montos.
        </p>
      </header>

      {/* Tabs placeholder (visual) — tab state would need client for interactivity */}
      <div className="flex items-center gap-8 border-b border-[#18181B]/8">
        <button className="pb-4 text-sm font-bold uppercase tracking-widest text-[#18181B] border-b-2 border-[#2855E0]">
          Pendientes ({pending.length})
        </button>
        <button className="pb-4 text-sm font-bold uppercase tracking-widest text-[#18181B]/40 hover:text-[#18181B] transition-colors">
          Aprobados ({approved.length})
        </button>
        <button className="pb-4 text-sm font-bold uppercase tracking-widest text-[#18181B]/40 hover:text-[#18181B] transition-colors">
          Rechazados ({rejected.length})
        </button>
      </div>

      {/* Pending Cards */}
      {pending.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] py-16 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-sm text-[#18181B]/50 font-medium">No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pending.map(r => {
            const diff = r.competitor_price - (r.our_matched_price ?? 0)
            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl border-l-4 border-[#D69E2E] shadow-[0_4px_24px_rgba(18,18,27,0.06)] flex flex-col md:flex-row md:items-center p-6 gap-8"
              >
                {/* Left info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#18181B]">{r.brokers?.full_name ?? '—'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-[#18181B]/50 uppercase tracking-tight bg-[#F0F3FF] px-2 py-0.5 rounded-lg">
                          {r.competitor_name}
                        </span>
                        <span className="text-sm font-medium text-[#2855E0]">
                          {r.tramite_types?.display_name ?? '—'}
                        </span>
                      </div>
                    </div>
                    {r.evidence_url && (
                      <a
                        href={r.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#18181B]/15 text-[#18181B]/60 text-xs font-bold uppercase tracking-wider hover:bg-[#F0F3FF] transition-colors"
                      >
                        <ExternalLink size={12} />
                        Ver evidencia
                      </a>
                    )}
                  </div>

                  {/* Price grid */}
                  <div className="grid grid-cols-3 gap-4 bg-[#F0F3FF] p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-bold text-[#18181B]/50 uppercase mb-1">Competidor</p>
                      <p className="text-lg font-bold text-[#18181B]">{formatPrice(r.competitor_price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#18181B]/50 uppercase mb-1">Nuestro</p>
                      <p className="text-lg font-bold text-[#18181B]">
                        {r.our_matched_price != null ? formatPrice(r.our_matched_price) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#18181B]/50 uppercase mb-1">Diferencia</p>
                      <p className="text-lg font-black text-red-600">
                        {diff > 0 ? `+${formatPrice(diff)}` : formatPrice(diff)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#18181B]/40">Recibido {formatDate(r.created_at)}</p>
                </div>

                {/* Divider */}
                <div className="w-px h-24 bg-[#18181B]/8 hidden md:block" />

                {/* Right action area — read-only in server component */}
                <div className="flex flex-col gap-3 min-w-[240px]">
                  <div className="p-3 bg-[#D69E2E]/8 rounded-2xl">
                    <p className="text-xs text-[#D69E2E] font-medium flex items-center gap-2">
                      <Clock size={12} />
                      En revisión — pendiente de acción
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Resolved section */}
      {(approved.length > 0 || rejected.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-[#18181B]/60 uppercase tracking-wider text-sm">
            Solicitudes resueltas ({approved.length + rejected.length})
          </h2>
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden divide-y divide-[#18181B]/5">
            {[...approved, ...rejected].map(r => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-[#18181B]">{r.brokers?.full_name ?? '—'}</span>
                    <span className="text-xs text-[#18181B]/40">·</span>
                    <span className="text-xs text-[#18181B]/60">{r.tramite_types?.display_name ?? '—'}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[#18181B]/50">
                    <span>Competidor: <strong className="text-[#18181B]/80">{r.competitor_name}</strong></span>
                    <span>Precio competidor: <strong className="text-[#18181B]/80">{formatPrice(r.competitor_price)}</strong></span>
                    {r.status === 'approved' && r.our_matched_price != null && (
                      <span>Igualado: <strong className="text-emerald-700">{formatPrice(r.our_matched_price)}</strong></span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-[#18181B]/40 shrink-0">
                  {r.reviewed_at ? formatDate(r.reviewed_at) : formatDate(r.created_at)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
