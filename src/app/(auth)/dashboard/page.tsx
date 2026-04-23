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

export const metadata = { title: 'Dashboard · TuCierre' }

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
    { label: 'Trámites activos', value: activeCount.toString(), icon: Clock, iconBg: 'bg-[#2855E0]/8', iconColor: 'text-[#2855E0]' },
    { label: 'Completados / mes', value: completedThisMonth.toString(), icon: CheckCircle, iconBg: 'bg-[#1C7A52]/8', iconColor: 'text-[#1C7A52]' },
    { label: 'Monto gestionado', value: formatPrice(totalAmount), icon: Wallet, iconBg: 'bg-[#2855E0]/8', iconColor: 'text-[#2855E0]', isPrice: true },
    { label: 'Ahorro acumulado', value: formatPrice(totalSavings), icon: PiggyBank, iconBg: 'bg-[#C9880E]/10', iconColor: 'text-[#C9880E]', isPrice: true },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display text-white tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/cotizar"
          className="hidden sm:flex items-center gap-2 bg-[#2855E0] hover:bg-[#1E46C7] text-white rounded-full px-6 py-3 font-semibold text-sm transition-all motion-reduce:transition-none"
        >
          <Plus size={16} />
          Nueva cotización
        </Link>
      </div>

      {/* Stats strip */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.04)]">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#18181B]/6">
          {stats.map((stat, i) => (
            <div key={stat.label} className={cn(
              'px-6 py-5 flex flex-col gap-1.5',
              i === 0 && 'md:pl-8',
              i === stats.length - 1 && 'md:pr-8'
            )}>
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B7A9A]">{stat.label}</span>
              <span className={cn('font-bold text-[#18181B] leading-none tabular-nums', stat.isPrice ? 'text-xl' : 'text-xl')}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier progress — naked, no card */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-white tabular-nums">{monthCount}</span>
            <span className="text-white/50 text-sm">
              trámite{monthCount !== 1 ? 's' : ''} este mes
            </span>
          </div>
          {tier !== 'oro' ? (
            <span className="text-xs font-semibold text-white/60">
              {tramitesToNext} más → <span className="text-white/80 font-bold">{nextTierLabel}</span>
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C9880E' }}>
              Nivel Oro ★
            </span>
          )}
        </div>
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 motion-reduce:transition-none"
            style={{ width: `${progressPercent}%`, background: tier === 'oro' ? '#C9880E' : '#2855E0' }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-white/60">
          <span>0</span>
          <span>{tier === 'bronce' ? '4' : '8'} trámites</span>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary — spans 2 columns on sm+ */}
          <Link href="/clientes/nuevo" className="sm:col-span-2">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#2855E0] hover:bg-[#1E46C7] text-white border border-[#2855E0] transition-all h-full">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <UserPlus size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-none">Nuevo cliente</div>
                <div className="text-xs mt-1.5 opacity-60 leading-snug">Registra y solicita un trámite</div>
              </div>
              <ArrowRight size={15} className="opacity-50 shrink-0" />
            </div>
          </Link>
          {/* Secondaries — stacked */}
          <div className="flex flex-col gap-3">
            {[
              { href: '/tramites', label: 'Mis trámites', desc: `${activeCount} en proceso`, icon: FileText },
              { href: '/cotizar', label: 'Cotizar', desc: 'Precio al instante', icon: Calculator },
            ].map(action => (
              <Link key={action.href} href={action.href} className="flex-1">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-[#18181B] border border-[#18181B]/8 hover:border-[#2855E0]/30 transition-all h-full">
                  <action.icon size={16} className="text-[#18181B]/45 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-none">{action.label}</div>
                    <div className="text-xs mt-1 leading-none text-[#18181B]/50">{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tramites */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#18181B]/8 flex items-center justify-between">
          <h2 className="font-semibold text-[#18181B]">Trámites Recientes</h2>
          <Link
            href="/tramites"
            className="text-xs font-medium text-[#2855E0] hover:underline"
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
                <tr className="text-xs font-bold text-[#6B7A9A] uppercase tracking-widest bg-[#18181B]/4">
                  <th scope="col" className="px-6 py-4">Código</th>
                  <th scope="col" className="px-4 py-4">Tipo</th>
                  <th scope="col" className="px-4 py-4">Estado</th>
                  <th scope="col" className="px-4 py-4 hidden sm:table-cell">Fecha</th>
                  <th scope="col" className="px-6 py-4 text-right">Monto</th>
                  <th scope="col" className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/5">
                {recentTramites.map((tramite) => (
                  <tr key={tramite.id} className="hover:bg-[#18181B]/3 transition-colors motion-reduce:transition-none group">
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
                    <td className="px-4 py-4 text-[#6B7A9A] text-xs hidden sm:table-cell">
                      {formatDate(tramite.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#18181B] text-sm tabular-nums">
                      {formatPrice(tramite.final_price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/tramites/${tramite.id}`}
                        className="inline-flex items-center gap-1 text-[#2855E0] font-bold text-sm group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 transition-transform motion-reduce:transition-none"
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
        className="fixed bottom-20 right-5 lg:hidden flex items-center gap-2 bg-[#2855E0] text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl hover:bg-[#1E46C7] transition-all motion-reduce:transition-none z-50 font-semibold"
      >
        <Plus size={18} />
        Nueva cotización
      </Link>
    </div>
  )
}
