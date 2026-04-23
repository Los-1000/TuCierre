import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/tramites/StatusBadge'
import { formatPrice, formatDate } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import type { TramiteStatus } from '@/types/database'
import {
  FileText,
  Users,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

interface RecentTramite {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  updated_at: string
  tramite_types: { display_name: string } | null
  brokers: { full_name: string } | null
}

async function fetchDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [tramitesRes, monthTramitesRes, recentRes] = await Promise.all([
    supabase.from('tramites').select('status, final_price, broker_id, updated_at'),
    supabase
      .from('tramites')
      .select('broker_id, final_price, status')
      .gte('created_at', startOfMonth),
    supabase
      .from('tramites')
      .select('id, reference_code, status, final_price, updated_at, tramite_types(display_name), brokers(full_name)')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const byStatus: Record<string, number> = {}
  const tramites = (tramitesRes.data ?? []) as { status: string; final_price: number; broker_id: string; updated_at: string }[]
  for (const t of tramites) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
  }

  let incomeThisMonth = 0
  const monthTramites = (monthTramitesRes.data ?? []) as { broker_id: string; final_price: number; status: string }[]
  incomeThisMonth = monthTramites
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + (t.final_price || 0), 0)

  const activeBrokerIds = new Set(monthTramites.map(t => t.broker_id))
  const activeBrokers = activeBrokerIds.size

  const recentTramites = (recentRes.data ?? []) as unknown as RecentTramite[]

  return { byStatus, incomeThisMonth, activeBrokers, recentTramites }
}

export default async function AdminDashboardPage() {
  const { byStatus, incomeThisMonth, activeBrokers, recentTramites } =
    await fetchDashboard()

  const activeCount =
    (byStatus['solicitado'] || 0) +
    (byStatus['documentos_pendientes'] || 0) +
    (byStatus['en_revision'] || 0) +
    (byStatus['en_firma'] || 0) +
    (byStatus['en_registro'] || 0)

  const enProcesoCount =
    (byStatus['en_revision'] || 0) +
    (byStatus['en_firma'] || 0) +
    (byStatus['en_registro'] || 0)

  const completedCount = byStatus['completado'] || 0
  const totalCount = Object.values(byStatus).reduce((a, b) => a + b, 0)
  const sinAsignar = byStatus['solicitado'] || 0

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#18181B]/60 mb-1">
            Resumen Administrativo
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#18181B]">Dashboard</h1>
        </div>
      </div>

      {/* Alert Banner */}
      {sinAsignar > 0 && (
        <div className="bg-[#D69E2E]/10 border-l-4 border-[#D69E2E] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D69E2E] flex items-center justify-center text-white shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-bold text-[#D69E2E] tracking-tight">
                {sinAsignar} trámite{sinAsignar !== 1 ? 's' : ''} sin notaría asignada
              </p>
              <p className="text-sm text-[#D69E2E]/80">
                Es necesario asignar una notaría para continuar con el flujo legal.
              </p>
            </div>
          </div>
          <Link
            href="/admin/tramites?status=solicitado"
            className="border border-[#D69E2E]/40 text-[#D69E2E] rounded-full px-6 py-2.5 font-semibold text-sm bg-transparent hover:bg-[#D69E2E]/10 transition-colors shrink-0"
          >
            Gestionar ahora
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Trámites activos */}
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">Trámites activos</p>
          <h3 className="text-4xl font-black text-[#18181B]">{activeCount}</h3>
          <p className="text-xs text-[#18181B]/50 mt-1">En proceso actualmente</p>
        </div>

        {/* Sin asignar — highlighted */}
        <div className={`rounded-3xl border p-6 ${sinAsignar > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)]'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${sinAsignar > 0 ? 'text-red-600/70' : 'text-[#18181B]/60'}`}>Sin asignar</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-4xl font-black ${sinAsignar > 0 ? 'text-red-700' : 'text-[#18181B]'}`}>{sinAsignar}</h3>
            {sinAsignar > 0 && <AlertCircle size={18} className="text-red-500 mb-1" />}
          </div>
          <p className={`text-xs mt-1 ${sinAsignar > 0 ? 'text-red-500' : 'text-[#18181B]/50'}`}>Requieren acción</p>
        </div>

        {/* En proceso */}
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">En proceso</p>
          <h3 className="text-4xl font-black text-[#18181B]">{enProcesoCount}</h3>
          <p className="text-xs text-[#18181B]/50 mt-1">En revisión, firma o registro</p>
        </div>

        {/* Completados */}
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">Completados</p>
          <h3 className="text-4xl font-black text-[#18181B]">{completedCount}</h3>
          <p className="text-xs text-[#18181B]/50 mt-1">de {totalCount} en total</p>
        </div>

        {/* Ingresos — dark card */}
        <div className="bg-[#18181B] rounded-3xl shadow-xl p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Ingresos del mes</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{formatPrice(incomeThisMonth)}</h3>
          <p className="text-xs text-zinc-500 mt-1">Trámites completados</p>
        </div>
      </div>

      {/* Charts + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Status breakdown + Quick actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status breakdown card */}
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-8">
            <h4 className="text-lg font-bold text-[#18181B] mb-6">Trámites por estado</h4>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(TRAMITE_STATUS_CONFIG) as TramiteStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <StatusBadge status={status} size="sm" />
                  <span className="text-sm font-bold text-[#18181B]">
                    {byStatus[status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-8">
            <h4 className="text-lg font-bold text-[#18181B] mb-6">Acciones rápidas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/admin/tramites?status=solicitado"
                className="group flex items-center gap-3 p-4 rounded-2xl border border-[#18181B]/10 hover:border-[#2855E0]/40 hover:bg-[#2855E0]/5 transition-all"
              >
                <div className="p-2 bg-[#2855E0]/10 rounded-xl">
                  <FileText size={18} className="text-[#2855E0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#18181B]">Nuevas solicitudes</p>
                  <p className="text-xs text-[#18181B]/50">{byStatus['solicitado'] || 0} trámites</p>
                </div>
                <ArrowRight size={16} className="text-[#18181B]/30 group-hover:text-[#2855E0] transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/brokers"
                className="group flex items-center gap-3 p-4 rounded-2xl border border-[#18181B]/10 hover:border-[#2855E0]/40 hover:bg-[#2855E0]/5 transition-all"
              >
                <div className="p-2 bg-[#020952]/10 rounded-xl">
                  <Users size={18} className="text-[#020952]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#18181B]">Brokers activos</p>
                  <p className="text-xs text-[#18181B]/50">{activeBrokers} este mes</p>
                </div>
                <ArrowRight size={16} className="text-[#18181B]/30 group-hover:text-[#2855E0] transition-colors shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-8">
          <h4 className="text-lg font-bold text-[#18181B] mb-8">Actividad Reciente</h4>

          {recentTramites.length === 0 ? (
            <div className="py-8 text-center text-[#18181B]/40 text-sm">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-40" />
              Sin actividad reciente
            </div>
          ) : (
            <div className="relative space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#18181B]/10" />

              {recentTramites.map((t) => {
                const cfg = TRAMITE_STATUS_CONFIG[t.status as TramiteStatus]
                const dotColor = t.status === 'completado'
                  ? 'bg-[#2855E0]'
                  : t.status === 'cancelado'
                  ? 'bg-red-500'
                  : t.status === 'solicitado'
                  ? 'bg-[#6B7A9A]'
                  : 'bg-[#020952]'
                return (
                  <div key={t.id} className="relative flex gap-4 pl-8">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${cfg ? cfg.bg : 'bg-[#18181B]/8'}`}>
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight text-[#18181B]">
                        {t.reference_code} — {t.brokers?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-[#18181B]/50 mt-0.5">
                        {t.tramite_types?.display_name ?? '—'} · {formatDate(t.updated_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <Link
            href="/admin/tramites"
            className="block w-full mt-8 py-3 text-xs font-bold uppercase tracking-widest text-center text-[#18181B]/50 hover:text-[#2855E0] transition-colors border-t border-[#18181B]/8"
          >
            Ver todo el historial
          </Link>
        </div>
      </div>
    </div>
  )
}
