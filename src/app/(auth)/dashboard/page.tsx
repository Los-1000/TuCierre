import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calculator, FileText, TrendingUp, CheckCircle, Clock, Wallet, PiggyBank, ArrowRight, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const [tramitesResult, rewardsResult, commissionResult] = await Promise.all([
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
  const commissionTramites = (commissionResult.data ?? []) as { final_price: number }[]

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
  const monthCount = broker?.total_tramites_month ?? 0

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

  const stats = [
    { label: 'Trámites activos', value: activeCount.toString(), icon: Clock, accent: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completados / mes', value: completedThisMonth.toString(), icon: CheckCircle, accent: 'text-brand-emerald', bg: 'bg-emerald-50' },
    { label: 'Monto gestionado', value: formatPrice(totalAmount), icon: Wallet, accent: 'text-brand-navy', bg: 'bg-brand-navy/5', isPrice: true },
    { label: 'Ahorro acumulado', value: formatPrice(totalSavings), icon: PiggyBank, accent: 'text-brand-gold', bg: 'bg-brand-gold/8', isPrice: true },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Hola, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button asChild className="hidden sm:flex gap-2 bg-brand-navy hover:bg-brand-navy-light text-parchment">
          <Link href="/cotizar">
            <Calculator size={15} />
            Cotizar
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white border-border shadow-none">
            <CardContent className="p-4">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
                <stat.icon size={16} className={stat.accent} />
              </div>
              <div className={cn('font-display font-semibold text-ink leading-none', stat.isPrice ? 'text-xl' : 'text-3xl')}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission card */}
      <Card className="bg-white border-border shadow-none overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Comisiones del mes
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{commissionTierConfig.icon}</span>
                <span className="font-semibold text-sm text-ink">{commissionTierConfig.label}</span>
                <span className="text-xs text-muted-foreground">· {commissionTierConfig.ratePercent}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {commissionResult.count} cliente{commissionResult.count !== 1 ? 's' : ''} cerrado{commissionResult.count !== 1 ? 's' : ''} este mes
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-semibold text-xl text-brand-emerald tabular-nums">
                {formatPrice(commissionResult.amount)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">comisión estimada</div>
            </div>
          </div>
          {clientsToNextCommissionTier > 0 && nextCommissionTier && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              <span className="font-semibold text-ink">{clientsToNextCommissionTier} cliente{clientsToNextCommissionTier !== 1 ? 's' : ''} más</span>
              {' '}para {nextCommissionTier.label} ({nextCommissionTier.ratePercent}%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tier progress */}
      <Card className="bg-white border-border shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {/* Gold left accent */}
            <div className="w-1 bg-gradient-to-b from-brand-gold to-brand-gold-dark shrink-0" />
            <div className="flex-1 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tierConfig.icon}</span>
                  <div>
                    <div className={cn('font-semibold text-sm', tierConfig.color)}>
                      Nivel {tierConfig.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{monthCount} trámites este mes</div>
                  </div>
                </div>
                {tierConfig.discount > 0 && (
                  <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl px-3 py-1.5 text-center">
                    <div className={cn('font-display text-lg font-semibold text-brand-gold')}>{tierConfig.discount}%</div>
                    <div className="text-[10px] text-muted-foreground leading-none">dto.</div>
                  </div>
                )}
              </div>

              {tier !== 'oro' && (
                <div className="mt-4">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-light rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {tramitesToNext > 0
                      ? <><span className="font-semibold text-ink">{tramitesToNext} trámite{tramitesToNext !== 1 ? 's' : ''} más</span> para llegar a {nextTierLabel}</>
                      : <span className="text-brand-emerald font-medium">¡A punto de subir a {nextTierLabel}!</span>
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { href: '/cotizar', label: 'Nueva cotización', desc: 'Obtén precio al instante', icon: Calculator, accent: 'bg-brand-navy text-parchment' },
            { href: '/tramites', label: 'Mis trámites', desc: `${activeCount} en proceso`, icon: FileText, accent: 'bg-white border border-border text-ink' },
            { href: '/recompensas', label: 'Recompensas', desc: formatPrice(totalSavings) + ' ahorrado', icon: TrendingUp, accent: 'bg-white border border-border text-ink' },
          ].map(action => (
            <Link key={action.href} href={action.href}>
              <div className={cn('flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all hover:shadow-sm', action.accent)}>
                <action.icon size={17} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none">{action.label}</div>
                  <div className="text-xs opacity-60 mt-1 leading-none">{action.desc}</div>
                </div>
                <ArrowRight size={14} className="opacity-40 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tramites */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Actividad reciente</h2>
          <Link href="/tramites" className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors flex items-center gap-1 font-medium">
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>

        {recentTramites.length === 0 ? (
          <EmptyState
            title="Aún no tienes trámites"
            description="Empieza cotizando tu primer trámite notarial en minutos."
            actionLabel="Cotizar ahora"
            actionHref="/cotizar"
          />
        ) : (
          <div className="space-y-2">
            {recentTramites.map((tramite) => (
              <Link
                key={tramite.id}
                href={`/tramites/${tramite.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-brand-gold/30 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {tramite.reference_code}
                    </code>
                  </div>
                  <div className="font-medium text-ink text-sm truncate">
                    {(tramite as any).tramite_types?.display_name ?? 'Trámite notarial'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatDate(tramite.created_at)}</div>
                </div>
                <div className="flex items-center gap-3 ml-2 shrink-0">
                  <StatusBadge status={tramite.status} size="sm" />
                  <span className="text-sm font-semibold text-ink tabular-nums hidden sm:block font-display">
                    {formatPrice(tramite.final_price)}
                  </span>
                  <ChevronRight size={15} className="text-muted-foreground group-hover:text-brand-gold transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
