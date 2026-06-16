import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, Clock, CheckCircle, Wallet, TrendingUp, ChevronRight, FileText, Calculator, AlertCircle } from 'lucide-react'
import { getDashboardStats, getTramites, getMe } from '@/lib/server-api'
import { formatPrice, formatDate, cn } from '@/lib/utils'

export const metadata = { title: 'Dashboard · TuCierre' }

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado', COTIZADO: 'Cotizado', DOCS_PENDIENTES: 'Docs. Pendientes',
  EN_REVISION: 'En Revisión', EN_FIRMA: 'En Firma', EN_REGISTRO: 'En Registro',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SOLICITADO:       { bg: '#eff2ff', text: '#2c4dfb' },
  COTIZADO:         { bg: '#eff2ff', text: '#2c4dfb' },
  DOCS_PENDIENTES:  { bg: '#fef9ee', text: '#b2832e' },
  EN_REVISION:      { bg: '#fff7ed', text: '#c2410c' },
  EN_FIRMA:         { bg: '#f0fdf4', text: '#16a34a' },
  EN_REGISTRO:      { bg: '#f0fdf4', text: '#15803d' },
  COMPLETADO:       { bg: '#f0fdf4', text: '#15803d' },
  CANCELADO:        { bg: '#fef2f2', text: '#dc2626' },
}

const URGENT_STATUSES = new Set(['DOCS_PENDIENTES', 'EN_REVISION'])

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  const [broker, stats, tramitesPage] = await Promise.all([
    getMe(accessToken),
    getDashboardStats(accessToken),
    getTramites(accessToken, { size: 8 }),
  ])

  if (!broker) redirect('/login')

  const allTramites = tramitesPage?.content ?? []
  const activeTramites = allTramites.filter((t) => t.statusTramite !== 'COMPLETADO' && t.statusTramite !== 'CANCELADO')
  const urgentTramites = activeTramites.filter((t) => URGENT_STATUSES.has(t.statusTramite))
  const firstName = broker.fullName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-5">
      {/* Header — compact on mobile */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-navy-400 font-medium">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-xl font-bold font-inter text-navy-900 tracking-tight mt-0.5">
            {greeting}, {firstName}
          </h1>
        </div>
        <Link
          href="/cotizar"
          className="flex items-center gap-1.5 text-white rounded-xl px-3.5 py-2.5 font-semibold text-sm"
          style={{ background: '#2c4dfb' }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nueva cotización</span>
          <span className="sm:hidden">Cotizar</span>
        </Link>
      </div>

      {/* Urgent banner — only shown when there's something requiring action */}
      {urgentTramites.length > 0 && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ background: '#fef9ee', borderColor: '#f3d68a' }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#b2832e' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#7a5a1e' }}>
              {urgentTramites.length === 1
                ? '1 trámite requiere tu atención'
                : `${urgentTramites.length} trámites requieren tu atención`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9e7530' }}>
              {urgentTramites.map((t) => STATUS_LABELS[t.statusTramite]).join(', ')}
            </p>
          </div>
          <Link href="/tramites" className="text-xs font-bold shrink-0" style={{ color: '#b2832e' }}>
            Ver →
          </Link>
        </div>
      )}

      {/* Active tramites — priority on mobile */}
      <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-navy-900 text-sm">Trámites activos</h2>
            {activeTramites.length > 0 && (
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                style={{ background: '#eff2ff', color: '#2c4dfb' }}
              >
                {activeTramites.length}
              </span>
            )}
          </div>
          <Link href="/tramites" className="text-xs font-medium" style={{ color: '#2c4dfb' }}>Ver todos</Link>
        </div>

        {activeTramites.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FileText size={28} className="mx-auto text-navy-200 mb-3" />
            <p className="text-sm font-medium text-navy-500">No tienes trámites activos</p>
            <p className="text-xs text-navy-400 mt-1 mb-4">Cotiza un nuevo trámite para empezar</p>
            <Link
              href="/cotizar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg"
              style={{ background: '#2c4dfb' }}
            >
              <Calculator size={14} /> Cotizar ahora
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {activeTramites.slice(0, 5).map((t) => {
              const colors = STATUS_COLORS[t.statusTramite] ?? { bg: '#f4f6fb', text: '#4a6da8' }
              const isUrgent = URGENT_STATUSES.has(t.statusTramite)
              return (
                <Link key={t.id} href={`/tramites/${t.id}`} className="flex items-center px-5 py-3.5 hover:bg-navy-50 transition-colors gap-3">
                  {isUrgent && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#b2832e' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-900 truncate">{t.tramiteType}</div>
                    <div className="text-xs text-navy-400 mt-0.5 truncate">
                      {t.propertyAddress ?? t.propertyDistrictAddress ?? '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {STATUS_LABELS[t.statusTramite] ?? t.statusTramite}
                    </span>
                    <ChevronRight size={14} className="text-navy-300" />
                  </div>
                </Link>
              )
            })}
            {activeTramites.length > 5 && (
              <Link href="/tramites" className="flex items-center justify-center px-5 py-3 text-xs font-medium" style={{ color: '#2c4dfb' }}>
                Ver {activeTramites.length - 5} más
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cashback model */}
      <Link
        href="/recompensas"
        className="flex items-center justify-between gap-3 bg-white rounded-xl border border-navy-100 p-4 hover:bg-navy-50 transition-colors motion-reduce:transition-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f0fdf4' }}>
            <TrendingUp size={16} style={{ color: '#16a34a' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900">Ganas 5% de cashback por cada trámite</p>
            <p className="text-xs text-navy-400 mt-0.5">+ 1% por los trámites de tus referidos</p>
          </div>
        </div>
        <span className="text-xs font-medium shrink-0" style={{ color: '#2c4dfb' }}>Ver →</span>
      </Link>

      {/* Stats — secondary, 2-col on mobile */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Activos', value: String(stats?.activeCount ?? 0), value2: null, icon: Clock, color: '#2c4dfb', bg: '#eff2ff' },
          { label: 'Completados / mes', value: String(stats?.completedThisMonth ?? 0), value2: null, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Monto gestionado', value: formatPrice(stats?.totalValuePEN ?? 0, 'PEN'), value2: formatPrice(stats?.totalValueUSD ?? 0, 'USD'), icon: Wallet, color: '#2c4dfb', bg: '#eff2ff' },
          { label: 'Cashback acumulado', value: formatPrice(stats?.commissionEarnedPEN ?? 0, 'PEN'), value2: formatPrice(stats?.commissionEarnedUSD ?? 0, 'USD'), icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-navy-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-medium text-navy-400 leading-tight">{s.label}</span>
            </div>
            <span className="text-lg font-bold text-navy-900 tabular-nums">{s.value}</span>
            {s.value2 && (
              <span className="block text-sm font-semibold text-navy-500 tabular-nums mt-0.5">{s.value2}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
