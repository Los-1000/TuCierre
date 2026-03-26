import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/tramites/StatusBadge'
import Link from 'next/link'
import { Users, FileText, DollarSign, ArrowDownCircle, GitCompare, Building2 } from 'lucide-react'
import type { TramiteStatus } from '@/types/database'

interface RecentTramite {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  updated_at: string
  tramite_types: { display_name: string } | null
  brokers: { full_name: string } | null
}

async function fetchSuperDashboard() {
  const adminClient = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    brokersRes,
    notariasRes,
    allTramitesRes,
    monthTramitesRes,
    cashoutPendingRes,
    priceMatchPendingRes,
    recentRes,
  ] = await Promise.all([
    adminClient
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin', false)
      .eq('is_superadmin', false),
    adminClient
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin', true),
    adminClient.from('tramites').select('status'),
    adminClient
      .from('tramites')
      .select('status, final_price')
      .gte('created_at', startOfMonth),
    adminClient
      .from('cashout_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('price_match_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('tramites')
      .select(
        'id, reference_code, status, final_price, updated_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name)'
      )
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const allTramites = (allTramitesRes.data ?? []) as { status: string }[]
  const activeTramites = allTramites.filter(t =>
    ['solicitado', 'documentos_pendientes', 'en_revision', 'en_firma', 'en_registro'].includes(t.status)
  ).length

  const monthTramites = (monthTramitesRes.data ?? []) as { status: string; final_price: number }[]
  const incomeThisMonth = monthTramites
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + (t.final_price || 0), 0)

  return {
    totalBrokers: brokersRes.count ?? 0,
    totalNotarias: notariasRes.count ?? 0,
    activeTramites,
    incomeThisMonth,
    pendingCashouts: cashoutPendingRes.count ?? 0,
    pendingPriceMatch: priceMatchPendingRes.count ?? 0,
    recentTramites: (recentRes.data ?? []) as unknown as RecentTramite[],
  }
}

export default async function SuperAdminDashboard() {
  const {
    totalBrokers,
    totalNotarias,
    activeTramites,
    incomeThisMonth,
    pendingCashouts,
    pendingPriceMatch,
    recentTramites,
  } = await fetchSuperDashboard()

  const kpis = [
    {
      title: 'Brokers registrados',
      value: totalBrokers.toString(),
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      sub: 'Total en la plataforma',
      href: '/superadmin/brokers',
      badge: null,
    },
    {
      title: 'Notarías activas',
      value: totalNotarias.toString(),
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      sub: 'Administradores registrados',
      href: '/superadmin/notarias',
      badge: null,
    },
    {
      title: 'Trámites activos',
      value: activeTramites.toString(),
      icon: FileText,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
      sub: 'En proceso actualmente',
      href: '/superadmin/tramites',
      badge: null,
    },
    {
      title: 'Ingresos del mes',
      value: formatPrice(incomeThisMonth),
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      sub: 'Trámites completados',
      href: null,
      badge: null,
    },
    {
      title: 'Cashouts pendientes',
      value: pendingCashouts.toString(),
      icon: ArrowDownCircle,
      iconColor: pendingCashouts > 0 ? 'text-red-600' : 'text-gray-500',
      iconBg: pendingCashouts > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: 'Solicitudes por procesar',
      href: '/superadmin/cashouts',
      badge: pendingCashouts > 0 ? pendingCashouts : null,
    },
    {
      title: 'Price Match pendientes',
      value: pendingPriceMatch.toString(),
      icon: GitCompare,
      iconColor: pendingPriceMatch > 0 ? 'text-red-600' : 'text-gray-500',
      iconBg: pendingPriceMatch > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: 'Solicitudes por revisar',
      href: '/superadmin/price-match',
      badge: pendingPriceMatch > 0 ? pendingPriceMatch : null,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Global</h1>
        <p className="text-sm text-gray-500 mt-1">Vista de toda la plataforma TuCierre</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const card = (
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon size={20} className={kpi.iconColor} />
                  </div>
                  {kpi.badge != null && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {kpi.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
          return kpi.href ? (
            <Link key={kpi.title} href={kpi.href}>
              {card}
            </Link>
          ) : (
            <div key={kpi.title}>{card}</div>
          )
        })}
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Actividad reciente (todas las notarías)
        </h2>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {recentTramites.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin actividad reciente</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTramites.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs font-mono font-semibold text-gray-700 shrink-0">
                      {t.reference_code}
                    </p>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.brokers?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.tramite_types?.display_name ?? '—'}
                      </p>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatPrice(t.final_price)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(t.updated_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
