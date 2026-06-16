import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, type Currency } from '@/lib/utils'
import Link from 'next/link'
import { Users, FileText, DollarSign, ArrowDownCircle, GitCompare, Building2 } from 'lucide-react'
import { MOCK_SUPERADMIN_TOKEN, MOCK_SUPERADMIN_STATS } from '@/lib/server-api'

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado', COTIZADO: 'Cotizado', DOCS_PENDIENTES: 'Docs. Pendientes',
  EN_REVISION: 'En Revisión', EN_FIRMA: 'En Firma', EN_REGISTRO: 'En Registro',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SOLICITADO: { bg: '#eff2ff', text: '#2c4dfb' }, COTIZADO: { bg: '#eff2ff', text: '#2c4dfb' },
  EN_REVISION: { bg: '#fff7ed', text: '#c2410c' }, EN_FIRMA: { bg: '#ecfdf5', text: '#059669' },
  EN_REGISTRO: { bg: '#f0fdf4', text: '#15803d' }, COMPLETADO: { bg: '#f0fdf4', text: '#15803d' },
  CANCELADO: { bg: '#fef2f2', text: '#dc2626' },
}

async function fetchSuperDashboard() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  if (accessToken === MOCK_SUPERADMIN_TOKEN) {
    return MOCK_SUPERADMIN_STATS
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [brokersRes, notariasRes, allTramitesRes, monthTramitesRes, cashoutPendingRes, priceMatchPendingRes, recentRes] = await Promise.all([
    adminClient.from('brokers').select('id', { count: 'exact', head: true }).eq('is_admin', false).eq('is_superadmin', false),
    adminClient.from('brokers').select('id', { count: 'exact', head: true }).eq('is_admin', true),
    adminClient.from('tramites').select('status'),
    adminClient.from('tramites').select('status, final_price, currency').gte('created_at', startOfMonth),
    adminClient.from('cashout_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('price_match_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('tramites').select('id, reference_code, status, final_price, currency, updated_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name)').order('updated_at', { ascending: false }).limit(10),
  ])

  const allTramites = (allTramitesRes.data ?? []) as { status: string }[]
  const activeTramites = allTramites.filter(t => ['solicitado', 'documentos_pendientes', 'en_revision', 'en_firma', 'en_registro'].includes(t.status)).length
  const monthTramites = (monthTramitesRes.data ?? []) as { status: string; final_price: number; currency: Currency }[]
  const completedMonth = monthTramites.filter(t => t.status === 'completado')
  const incomePEN = completedMonth.filter(t => (t.currency ?? 'PEN') !== 'USD').reduce((sum, t) => sum + (t.final_price || 0), 0)
  const incomeUSD = completedMonth.filter(t => t.currency === 'USD').reduce((sum, t) => sum + (t.final_price || 0), 0)

  const recent = ((recentRes.data ?? []) as any[]).map(t => ({
    id: t.id, referenceCode: t.reference_code, status: t.status?.toUpperCase(),
    finalFee: t.final_price, currency: (t.currency ?? 'PEN') as Currency, updatedAt: t.updated_at,
    tramiteType: t.tramite_types?.display_name ?? '—', brokerName: t.brokers?.full_name ?? '—',
  }))

  return {
    totalBrokers: brokersRes.count ?? 0, totalNotarias: notariasRes.count ?? 0,
    activeTramites, incomePEN, incomeUSD,
    pendingCashouts: cashoutPendingRes.count ?? 0, pendingPriceMatch: priceMatchPendingRes.count ?? 0,
    recentTramites: recent,
  }
}

export default async function SuperAdminDashboard() {
  const { totalBrokers, totalNotarias, activeTramites, incomePEN, incomeUSD, pendingCashouts, pendingPriceMatch, recentTramites } = await fetchSuperDashboard()

  const kpis = [
    { title: 'Brokers registrados', value: totalBrokers.toString(), icon: Users, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', sub: 'Total en la plataforma', href: '/superadmin/brokers', badge: null },
    { title: 'Notarías activas', value: totalNotarias.toString(), icon: Building2, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', sub: 'Administradores registrados', href: '/superadmin/notarias', badge: null },
    { title: 'Trámites activos', value: activeTramites.toString(), icon: FileText, iconColor: 'text-sky-600', iconBg: 'bg-sky-50', sub: 'En proceso actualmente', href: '/superadmin/tramites', badge: null },
    { title: 'Ingresos del mes', value: formatPrice(incomePEN, 'PEN'), icon: DollarSign, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', sub: formatPrice(incomeUSD, 'USD'), href: null, badge: null },
    { title: 'Cashouts pendientes', value: pendingCashouts.toString(), icon: ArrowDownCircle, iconColor: pendingCashouts > 0 ? 'text-red-600' : 'text-gray-500', iconBg: pendingCashouts > 0 ? 'bg-red-50' : 'bg-gray-50', sub: 'Solicitudes por procesar', href: '/superadmin/cashouts', badge: pendingCashouts > 0 ? pendingCashouts : null },
    { title: 'Price Match pendientes', value: pendingPriceMatch.toString(), icon: GitCompare, iconColor: pendingPriceMatch > 0 ? 'text-red-600' : 'text-gray-500', iconBg: pendingPriceMatch > 0 ? 'bg-red-50' : 'bg-gray-50', sub: 'Solicitudes por revisar', href: '/superadmin/price-match', badge: pendingPriceMatch > 0 ? pendingPriceMatch : null },
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
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{kpi.badge}</span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
          return kpi.href ? <Link key={kpi.title} href={kpi.href}>{card}</Link> : <div key={kpi.title}>{card}</div>
        })}
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Actividad reciente (todas las notarías)</h2>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {recentTramites.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin actividad reciente</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTramites.map((t) => {
                  const colors = STATUS_COLORS[t.status] ?? { bg: '#f4f6fb', text: '#4a6da8' }
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-xs font-mono font-semibold text-gray-700 shrink-0">{t.referenceCode}</p>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.brokerName}</p>
                        <p className="text-xs text-gray-400">{t.tramiteType}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: colors.bg, color: colors.text }}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                      <div className="shrink-0 text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{formatPrice(t.finalFee, t.currency)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
