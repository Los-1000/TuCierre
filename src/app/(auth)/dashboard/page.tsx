import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calculator, FileText, Clock, CheckCircle, Wallet, PiggyBank, ArrowRight, ChevronRight, Plus, UserPlus } from 'lucide-react'
import { TIER_CONFIG } from '@/lib/constants'
import { calculateMonthlyCommission, COMMISSION_TIER_CONFIG } from '@/lib/commission'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import StatusBadge from '@/components/tramites/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import type { Tramite, Broker } from '@/types/database'

async function getDashboardData(brokerId: string) {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [tramitesResult, rewardsResult, commissionTramitesResult] = await Promise.all([
    supabase
      .from('tramites')
      .select('*, tramite_types(display_name)')
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('rewards')
      .select('amount')
      .eq('broker_id', brokerId)
      .eq('applied', true),
    supabase
      .from('tramites')
      .select('final_price')
      .eq('broker_id', brokerId)
      .eq('status', 'completado')
      .gte('completed_at', startOfMonth)
      .is('commission_cashout_id', null),
  ])

  const tramites = (tramitesResult.data ?? []) as Tramite[]
  const rewards = (rewardsResult.data ?? []) as { amount: number }[]
  const commissionTramites = (commissionTramitesResult.data ?? []) as { final_price: number }[]

  const activeCount = tramites.filter(t =>
    !['completado', 'cancelado', 'cotizado'].includes(t.status)
  ).length

  const completedThisMonth = tramites.filter(t =>
    t.status === 'completado' && t.completed_at && t.completed_at >= startOfMonth
  ).length

  const totalAmount = tramites
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + t.final_price, 0)

  const totalSavings = rewards.reduce((sum, r) => sum + r.amount, 0)

  return { tramites, activeCount, completedThisMonth, totalAmount, totalSavings, commissionTramites }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [brokerResult, dashboardData] = await Promise.all([
    supabase.from('brokers').select('*').eq('id', user.id).single(),
    getDashboardData(user.id),
  ])

  const broker = brokerResult.data as Broker | null
  const { tramites, activeCount, completedThisMonth, totalAmount, totalSavings, commissionTramites } = dashboardData

  const commissionResult = calculateMonthlyCommission(commissionTramites)
  const commissionTierConfig = COMMISSION_TIER_CONFIG[commissionResult.tier]
  const nextCommissionTier = commissionResult.tier < 3 ? COMMISSION_TIER_CONFIG[(commissionResult.tier + 1) as 2 | 3] : null
  const clientsToNextCommissionTier = nextCommissionTier
    ? Math.max(nextCommissionTier.minClients - commissionResult.count, 0)
    : 0

  const recentTramites = tramites.slice(0, 5)
  const tier = (broker?.tier as 'bronce' | 'plata' | 'oro') ?? 'bronce'
  const tierConfig = TIER_CONFIG[tier]
  // Use the live completed count rather than the denormalized broker.total_tramites_month field,
  // which is only updated when update_broker_tier() is explicitly called.
  const monthCount = completedThisMonth

  let progressPercent = 0
  let nextTierLabel = ''
  let tramitesToNext = 0
  if (tier === 'bronce') {
    progressPercent = Math.min((monthCount / 4) * 100, 100)
    nextTierLabel = 'Plata'
    tramitesToNext = Math.max(4 - monthCount, 0)
  } else if (tier === 'plata') {
    progressPercent = Math.min(((monthCount - 4) / 4) * 100, 100)
    nextTierLabel = 'Oro'
    tramitesToNext = Math.max(8 - monthCount, 0)
  } else {
    progressPercent = 100
  }

  const firstName = broker?.full_name?.split(' ')[0] ?? 'Broker'

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? 'Buenos días' : getHour() < 19 ? 'Buenas tardes' : 'Buenas noches'

  const stats = [
    { label: 'Trámites activos', value: activeCount.toString(), icon: Clock, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Completados / mes', value: completedThisMonth.toString(), icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Monto gestionado', value: formatPrice(totalAmount), icon: Wallet, iconBg: 'bg-[#D47151]/8', iconColor: 'text-[#D47151]', isPrice: true },
    { label: 'Ahorro acumulado', value: formatPrice(totalSavings), icon: PiggyBank, iconBg: 'bg-[#D69E2E]/10', iconColor: 'text-[#D69E2E]', isPrice: true },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#18181B] tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-[#18181B]/60 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/cotizar"
          className="hidden sm:flex items-center gap-2 bg-[#D47151] hover:bg-[#A6553A] text-white rounded-full px-6 py-2.5 font-semibold text-sm transition-all shadow-lg shadow-[#D47151]/20"
        >
          <Plus size={16} />
          Nueva cotización
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40">
                {stat.label}
              </span>
              <div className={cn('p-2 rounded-xl', stat.iconBg)}>
                <stat.icon size={18} className={stat.iconColor} />
              </div>
            </div>
            <div className={cn('font-bold text-[#18181B] leading-none', stat.isPrice ? 'text-xl' : 'text-4xl')}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tier progress card */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#18181B]">
              {monthCount} trámite{monthCount !== 1 ? 's' : ''} completado{monthCount !== 1 ? 's' : ''} este mes
            </h3>
            <p className="text-[#18181B]/60 text-sm mt-0.5">
              {tier !== 'oro'
                ? `Te faltan ${tramitesToNext} trámite${tramitesToNext !== 1 ? 's' : ''} para nivel ${nextTierLabel}`
                : 'Nivel máximo alcanzado'}
            </p>
          </div>
          {tier !== 'oro' && (
            <div className="flex items-center gap-2 text-[#D47151] font-bold text-sm bg-[#D47151]/5 px-4 py-2 rounded-full border border-[#D47151]/10">
              <span>{tramitesToNext} trámites más</span>
              <ArrowRight size={14} />
              <span className="font-black">Nivel {nextTierLabel}</span>
            </div>
          )}
        </div>
        <div className="relative w-full h-2.5 bg-[#18181B]/8 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#D47151] rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[11px] font-bold text-[#18181B]/40 uppercase tracking-widest">
          <span>0 Trámites</span>
          <span>{Math.round(progressPercent)}% del objetivo</span>
          <span>{tier === 'bronce' ? '4' : '8'} trámites ({nextTierLabel || 'Oro'})</span>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-[#18181B]/40 uppercase tracking-widest mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/clientes/nuevo', label: 'Nuevo cliente', desc: 'Registra un cliente ahora', icon: UserPlus, primary: true },
            { href: '/tramites', label: 'Mis trámites', desc: `${activeCount} en proceso`, icon: FileText, primary: false },
            { href: '/cotizar', label: 'Cotizar', desc: 'Precio al instante', icon: Calculator, primary: false },
          ].map(action => (
            <Link key={action.href} href={action.href}>
              <div className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:shadow-sm border',
                action.primary
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#18181B] border-[#18181B]/8 hover:border-[#D47151]/30'
              )}>
                <action.icon size={17} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-none">{action.label}</div>
                  <div className={cn('text-xs mt-1 leading-none', action.primary ? 'opacity-60' : 'text-[#18181B]/50')}>
                    {action.desc}
                  </div>
                </div>
                <ArrowRight size={14} className="opacity-40 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tramites */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#18181B]/8 flex items-center justify-between">
          <h2 className="font-semibold text-[#18181B]">Trámites Recientes</h2>
          <Link
            href="/tramites"
            className="text-xs font-bold text-[#D47151] hover:underline uppercase tracking-wider"
          >
            Ver todos
          </Link>
        </div>

        {recentTramites.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Aún no tienes trámites"
              description="Empieza cotizando tu primer trámite notarial en minutos."
              actionLabel="Cotizar ahora"
              actionHref="/cotizar"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-[#18181B]/40 uppercase tracking-widest bg-[#F9F9F8]">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4 hidden sm:table-cell">Fecha</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/5">
                {recentTramites.map((tramite) => (
                  <tr key={tramite.id} className="hover:bg-[#F9F9F8]/80 transition-colors group">
                    <td className="px-6 py-4">
                      <code className="font-mono text-xs bg-[#18181B]/5 text-[#18181B]/60 px-2 py-1 rounded-md font-semibold">
                        {tramite.reference_code}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-[#18181B]/60 text-sm">
                      {(tramite as any).tramite_types?.display_name ?? 'Trámite notarial'}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={tramite.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 text-[#18181B]/40 text-xs hidden sm:table-cell">
                      {formatDate(tramite.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#18181B] text-sm tabular-nums">
                      {formatPrice(tramite.final_price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/tramites/${tramite.id}`}
                        className="inline-flex items-center gap-1 text-[#D47151] font-bold text-sm group-hover:translate-x-1 transition-transform"
                      >
                        Ver <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAB for mobile */}
      <Link
        href="/cotizar"
        className="fixed bottom-20 right-5 lg:hidden flex items-center gap-2 bg-[#D47151] text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl shadow-[#D47151]/40 hover:bg-[#A6553A] transition-all z-50 font-semibold"
      >
        <Plus size={18} />
        Nueva cotización
      </Link>
    </div>
  )
}
