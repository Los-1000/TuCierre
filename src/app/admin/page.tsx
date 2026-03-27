import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/tramites/StatusBadge'
import { formatPrice, formatDate } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import type { TramiteStatus } from '@/types/database'
import {
  FileText,
  DollarSign,
  Users,
  GitCompare,
  ArrowRight,
  Clock,
  FileCheck,
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

  const [tramitesRes, priceMatchRes, monthTramitesRes, recentRes] = await Promise.all([
    supabase.from('tramites').select('status, final_price, broker_id, updated_at'),
    supabase.from('price_match_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
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

  // Count by status
  const byStatus: Record<string, number> = {}
  const tramites = (tramitesRes.data ?? []) as { status: string; final_price: number; broker_id: string; updated_at: string }[]
  if (tramites.length > 0) {
    for (const t of tramites) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
    }
  }

  // Income this month (completado)
  let incomeThisMonth = 0
  const monthTramites = (monthTramitesRes.data ?? []) as { broker_id: string; final_price: number; status: string }[]
  if (monthTramites.length > 0) {
    incomeThisMonth = monthTramites
      .filter(t => t.status === 'completado')
      .reduce((sum, t) => sum + (t.final_price || 0), 0)
  }

  // Active brokers this month
  const activeBrokerIds = new Set(monthTramites.map(t => t.broker_id))
  const activeBrokers = activeBrokerIds.size

  // Pending price match count
  const pendingPriceMatch = priceMatchRes.count ?? 0

  const recentTramites = (recentRes.data ?? []) as unknown as RecentTramite[]

  return { byStatus, incomeThisMonth, activeBrokers, pendingPriceMatch, recentTramites }
}

export default async function AdminDashboardPage() {
  const { byStatus, incomeThisMonth, activeBrokers, pendingPriceMatch, recentTramites } =
    await fetchDashboard()

  const activeCount =
    (byStatus['solicitado'] || 0) +
    (byStatus['documentos_pendientes'] || 0) +
    (byStatus['en_revision'] || 0) +
    (byStatus['en_firma'] || 0) +
    (byStatus['en_registro'] || 0)

  const kpis = [
    {
      title: 'Trámites activos',
      value: activeCount.toString(),
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      sub: 'En proceso actualmente',
    },
    {
      title: 'Ingresos del mes',
      value: formatPrice(incomeThisMonth),
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      sub: 'Trámites completados este mes',
    },
    {
      title: 'Brokers activos',
      value: activeBrokers.toString(),
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      sub: 'Con trámites este mes',
    },
    {
      title: 'Price Match pendientes',
      value: pendingPriceMatch.toString(),
      icon: GitCompare,
      iconColor: pendingPriceMatch > 0 ? 'text-red-600' : 'text-gray-500',
      iconBg: pendingPriceMatch > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: 'Solicitudes por revisar',
      badge: pendingPriceMatch > 0 ? pendingPriceMatch : null,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de operaciones de la notaría</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon size={20} className={kpi.iconColor} />
                </div>
                {kpi.badge != null && (
                  <Badge variant="destructive" className="text-xs font-semibold">
                    {kpi.badge}
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status breakdown */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Trámites por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(TRAMITE_STATUS_CONFIG) as TramiteStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge status={status} size="sm" />
                <span className="text-sm font-semibold text-gray-700">
                  {byStatus[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/tramites?status=solicitado">
            <Card className="border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Nuevas solicitudes</p>
                  <p className="text-xs text-gray-500">
                    {byStatus['solicitado'] || 0} trámites solicitados
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/price-match">
            <Card className="border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <GitCompare size={18} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Price Match</p>
                  <p className="text-xs text-gray-500">
                    {pendingPriceMatch} solicitudes pendientes
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/tramites?status=documentos_pendientes">
            <Card className="border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileCheck size={18} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Docs. pendientes</p>
                  <p className="text-xs text-gray-500">
                    {byStatus['documentos_pendientes'] || 0} trámites esperando
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Actividad reciente</h2>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {recentTramites.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <AlertCircle size={24} className="mx-auto mb-2 opacity-40" />
                Sin actividad reciente
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTramites.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="shrink-0">
                      <p className="text-xs font-mono font-semibold text-gray-700">{t.reference_code}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.brokers?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">{t.tramite_types?.display_name ?? '—'}</p>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-800">{formatPrice(t.final_price)}</p>
                      <p className="text-xs text-gray-400">{formatDate(t.updated_at)}</p>
                    </div>
                    <Link href={`/tramites/${t.id}`}>
                      <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs">
                        Ver
                      </Button>
                    </Link>
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
