'use client'

import { useEffect, useState } from 'react'
import { Star, Users, PiggyBank, TrendingUp, Award, CheckCircle, Wallet, Clock, ArrowDownCircle, DollarSign } from 'lucide-react'
import { calculateMonthlyCommission, COMMISSION_TIER_CONFIG } from '@/lib/commission'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useBrokerProfile } from '@/hooks/useBrokerProfile'
import { TIER_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import ReferralCode from '@/components/shared/ReferralCode'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonCard'
import CashoutDialog from '@/components/recompensas/CashoutDialog'
import type { Reward, BrokerTier, CashoutRequest, CashoutStatus } from '@/types/database'

const REWARD_TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  volume_discount: { label: 'Descuento por volumen', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  referral_bonus:  { label: 'Bono de referido',      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  price_match:     { label: 'Price match',            badgeClass: 'bg-green-50 text-green-700 border-green-200' },
}

const TIER_GRADIENT: Record<BrokerTier, string> = {
  bronce: 'from-orange-100 to-orange-50 border-orange-200',
  plata:  'from-gray-100 to-gray-50 border-gray-200',
  oro:    'from-yellow-100 to-yellow-50 border-yellow-200',
}

const CASHOUT_STATUS_CONFIG: Record<CashoutStatus, { label: string; badgeClass: string }> = {
  pending:   { label: 'Pendiente',  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:  { label: 'Aprobado',   badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected:  { label: 'Rechazado',  badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completado', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
}

const CASHOUT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: '🏦 Transferencia',
  yape:          '💜 Yape',
  plin:          '💚 Plin',
  otros:         '📱 Otros',
}

interface RewardRow extends Reward {
  tramites?: { reference_code: string } | null
}

interface CommissionMonth {
  yearMonth: string  // 'YYYY-MM'
  tramites: { final_price: number; commission_cashout_id: string | null }[]
  cashoutStatus: 'pending' | 'completed' | 'unpaid'
}

export default function RecompensasPage() {
  const { broker, loading: brokerLoading } = useBrokerProfile()
  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [referralCount, setReferralCount] = useState(0)
  const [referralSavings, setReferralSavings] = useState(0)
  const [rewardsLoading, setRewardsLoading] = useState(true)
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([])
  const [cashoutsLoading, setCashoutsLoading] = useState(true)
  const [commissionMonths, setCommissionMonths] = useState<CommissionMonth[]>([])
  const [commissionsLoading, setCommissionsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (!broker) return

    const fetchData = async () => {
      setRewardsLoading(true)
      setCashoutsLoading(true)
      setCommissionsLoading(true)

      const [rewardsResult, referralsResult, referralRewardsResult, cashoutsResult, commTramitesResult] = await Promise.all([
        supabase
          .from('rewards')
          .select('*, tramites(reference_code)')
          .eq('broker_id', broker.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('brokers')
          .select('id', { count: 'exact', head: true })
          .eq('referred_by', broker.id),
        supabase
          .from('rewards')
          .select('amount')
          .eq('broker_id', broker.id)
          .eq('type', 'referral_bonus'),
        supabase
          .from('cashout_requests')
          .select('*')
          .eq('broker_id', broker.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('tramites')
          .select('final_price, commission_cashout_id, completed_at')
          .eq('broker_id', broker.id)
          .eq('status', 'completado')
          .not('completed_at', 'is', null),
      ])

      setRewards((rewardsResult.data ?? []) as RewardRow[])
      setReferralCount(referralsResult.count ?? 0)
      const savingsSum = (referralRewardsResult.data ?? []).reduce(
        (sum, r) => sum + (r.amount ?? 0),
        0
      )
      setReferralSavings(savingsSum)
      setCashouts((cashoutsResult.data ?? []) as CashoutRequest[])
      setRewardsLoading(false)
      setCashoutsLoading(false)

      // Group commission tramites by month
      const tramiteRows = (commTramitesResult.data ?? []) as {
        final_price: number
        commission_cashout_id: string | null
        completed_at: string
      }[]
      const byMonth: Record<string, typeof tramiteRows> = {}
      for (const t of tramiteRows) {
        const ym = t.completed_at.slice(0, 7) // 'YYYY-MM'
        if (!byMonth[ym]) byMonth[ym] = []
        byMonth[ym].push(t)
      }
      // Fetch cashout statuses for commission cashouts
      const commCashoutIds = [...new Set(tramiteRows.map(t => t.commission_cashout_id).filter(Boolean))] as string[]
      const cashoutStatusMap: Record<string, 'pending' | 'completed'> = {}
      if (commCashoutIds.length > 0) {
        const { data: cData } = await supabase
          .from('cashout_requests')
          .select('id, status')
          .in('id', commCashoutIds)
        for (const c of (cData ?? [])) {
          cashoutStatusMap[(c as any).id] = (c as any).status === 'completed' ? 'completed' : 'pending'
        }
      }
      const months: CommissionMonth[] = Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([ym, trams]) => {
          const firstCashoutId = trams.find(t => t.commission_cashout_id)?.commission_cashout_id
          const cashoutStatus = firstCashoutId
            ? (cashoutStatusMap[firstCashoutId] ?? 'pending')
            : 'unpaid'
          return { yearMonth: ym, tramites: trams, cashoutStatus }
        })
      setCommissionMonths(months)
      setCommissionsLoading(false)
    }

    fetchData()
  }, [broker])

  const tier = (broker?.tier ?? 'bronce') as BrokerTier
  const tierConfig = TIER_CONFIG[tier]
  const monthCount = broker?.total_tramites_month ?? 0

  // Cashout balance calculations
  const lockedAmount = cashouts
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)
  const withdrawnAmount = cashouts
    .filter(c => c.status === 'approved' || c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)
  const availableBalance = Math.max(0, referralSavings - lockedAmount - withdrawnAmount)
  const hasPendingCashout = cashouts.some(c => c.status === 'pending')

  // Progress calculation
  let progressPercent = 0
  let nextTierLabel = ''
  let tramitesToNext = 0
  let nextTierDiscount = 0

  if (tier === 'bronce') {
    progressPercent = Math.min((monthCount / 4) * 100, 100)
    nextTierLabel = 'Plata'
    tramitesToNext = Math.max(4 - monthCount, 0)
    nextTierDiscount = 5
  } else if (tier === 'plata') {
    progressPercent = Math.min(((monthCount - 4) / 4) * 100, 100)
    nextTierLabel = 'Oro'
    tramitesToNext = Math.max(8 - monthCount, 0)
    nextTierDiscount = 10
  } else {
    progressPercent = 100
  }

  const tierBenefits: Record<BrokerTier, { title: string; benefits: string[]; isHighlighted: boolean }> = {
    bronce: {
      title: 'Bronce',
      isHighlighted: tier === 'bronce',
      benefits: [
        'Precio estándar en todos los trámites',
        'Soporte básico por mensajería',
        'Price matching disponible',
      ],
    },
    plata: {
      title: 'Plata',
      isHighlighted: tier === 'plata',
      benefits: [
        'Todo lo de Bronce',
        '5% de descuento en todos los trámites',
        'Prioridad media en revisión',
        'Soporte preferente',
      ],
    },
    oro: {
      title: 'Oro',
      isHighlighted: tier === 'oro',
      benefits: [
        'Todo lo de Plata',
        '10% de descuento en todos los trámites',
        'Prioridad máxima en revisión',
        'Atención dedicada',
        'Gestor asignado',
      ],
    },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recompensas</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tu nivel de fidelidad, beneficios y ahorro acumulado.
        </p>
      </div>

      {/* ── Section 1: Tier actual ── */}
      {brokerLoading ? (
        <CardSkeleton />
      ) : (
        <Card className={cn('border-2 bg-gradient-to-br shadow-sm', TIER_GRADIENT[tier])}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl leading-none">{tierConfig.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={cn('text-2xl font-bold', tierConfig.color)}>
                      {tierConfig.label}
                    </h2>
                    {tier === 'oro' && (
                      <Star size={18} className="text-yellow-500 fill-yellow-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {monthCount} trámite{monthCount !== 1 ? 's' : ''} este mes
                  </p>
                </div>
              </div>

              {tierConfig.discount > 0 && (
                <div className="bg-white/70 border border-white/80 rounded-xl px-4 py-2 text-center shrink-0">
                  <div className={cn('text-2xl font-bold', tierConfig.color)}>
                    {tierConfig.discount}%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">descuento</div>
                </div>
              )}
            </div>

            <div className="mt-5">
              {tier !== 'oro' ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Progreso hacia {nextTierLabel}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {monthCount} / {tier === 'bronce' ? 4 : 8}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2.5" />
                  <p className="text-xs text-slate-600 mt-2">
                    {tramitesToNext > 0 ? (
                      <>
                        <span className="font-semibold text-slate-800">{tramitesToNext} trámite{tramitesToNext !== 1 ? 's' : ''} más</span>
                        {' '}para {nextTierLabel} → {nextTierDiscount}% descuento
                      </>
                    ) : (
                      <span className="text-brand-green font-medium">
                        ¡Estás a punto de subir a {nextTierLabel}!
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 mt-1 w-fit">
                  <Star size={14} className="text-yellow-500 fill-yellow-400 shrink-0" />
                  <span className="text-sm text-yellow-700 font-medium">
                    Máximo nivel alcanzado
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Section 2: Beneficios del programa ── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Beneficios del programa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['bronce', 'plata', 'oro'] as BrokerTier[]).map((t) => {
            const config = TIER_CONFIG[t]
            const info = tierBenefits[t]
            const isActive = info.isHighlighted

            return (
              <Card
                key={t}
                className={cn(
                  'border-2 transition-shadow',
                  isActive
                    ? 'border-accent shadow-md'
                    : 'border-slate-200 shadow-sm opacity-80'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <CardTitle
                      className={cn(
                        'text-base',
                        isActive ? 'text-accent' : config.color
                      )}
                    >
                      {config.label}
                      {isActive && (
                        <span className="ml-2 text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full align-middle">
                          Tu nivel
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  {config.discount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Desde{' '}
                      <span className="font-semibold text-slate-700">
                        {TIER_CONFIG[t].minTramites} trámites/mes
                      </span>
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {info.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle
                        size={14}
                        className={cn(
                          'mt-0.5 shrink-0',
                          isActive ? 'text-accent' : 'text-slate-400'
                        )}
                      />
                      <span className="text-sm text-slate-600">{benefit}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Código de referido ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            <CardTitle className="text-base">Código de referido</CardTitle>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Comparte tu código y gana beneficios adicionales cuando tus referidos completen trámites.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {brokerLoading ? (
            <div className="h-11 bg-slate-100 rounded-lg animate-pulse" />
          ) : broker?.referral_code ? (
            <ReferralCode code={broker.referral_code} />
          ) : (
            <p className="text-sm text-slate-400 italic">Código de referido no disponible.</p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={16} className="text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {rewardsLoading ? '–' : referralCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">referidos activos</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <PiggyBank size={16} className="text-brand-green" />
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {rewardsLoading ? '–' : formatPrice(referralSavings)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">ahorro por referidos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3b: Retiro de referidos ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Retiro de referidos</h2>
        </div>

        {brokerLoading || cashoutsLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {/* Balance grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowDownCircle size={15} className="text-brand-green" />
                    <span className="text-xs text-slate-500 font-medium">Saldo disponible</span>
                  </div>
                  <div className="text-xl font-bold text-brand-green tabular-nums font-mono">
                    {formatPrice(availableBalance)}
                  </div>
                </div>
                {lockedAmount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={15} className="text-amber-600" />
                      <span className="text-xs text-slate-500 font-medium">En proceso</span>
                    </div>
                    <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                      {formatPrice(lockedAmount)}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-slate-500">
                  {hasPendingCashout
                    ? 'Tienes una solicitud en proceso. Espera a que sea aprobada.'
                    : availableBalance <= 0
                    ? 'Sin saldo disponible para retirar.'
                    : 'Puedes solicitar el retiro de tu saldo acumulado.'}
                </p>
                {broker && (
                  <CashoutDialog
                    availableBalance={availableBalance}
                    brokerId={broker.id}
                    onSuccess={() => {
                      setCashoutsLoading(true)
                      supabase
                        .from('cashout_requests')
                        .select('*')
                        .eq('broker_id', broker.id)
                        .order('created_at', { ascending: false })
                        .then(({ data }) => {
                          setCashouts((data ?? []) as CashoutRequest[])
                          setCashoutsLoading(false)
                        })
                    }}
                  />
                )}
              </div>

              {/* Cashout history */}
              {cashouts.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Historial de retiros</h3>
                  <div className="space-y-2">
                    {cashouts.map((c) => {
                      const statusConf = CASHOUT_STATUS_CONFIG[c.status]
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="text-sm text-slate-500">
                              {CASHOUT_METHOD_LABEL[c.method] ?? c.method}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
                                statusConf.badgeClass
                              )}
                            >
                              {statusConf.label}
                            </span>
                            {c.status === 'rejected' && c.admin_notes && (
                              <span className="text-xs text-red-500 truncate max-w-[160px]">
                                {c.admin_notes}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold text-slate-800 tabular-nums font-mono">
                              {formatPrice(c.amount)}
                            </div>
                            <div className="text-xs text-slate-400">{formatDate(c.created_at)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Section 3c: Comisiones ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Comisiones</h2>
        </div>

        {commissionsLoading ? (
          <CardSkeleton />
        ) : commissionMonths.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-10 text-center">
              <DollarSign size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Aún no tienes comisiones generadas.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {(() => {
                const currentMonth = new Date().toISOString().slice(0, 7)
                const currentMonthData = commissionMonths.find(m => m.yearMonth === currentMonth)
                const pendingMonths = commissionMonths.filter(m => m.cashoutStatus === 'unpaid')
                const currentCommission = currentMonthData
                  ? calculateMonthlyCommission(currentMonthData.tramites)
                  : null
                const totalPending = pendingMonths.reduce((sum, m) => {
                  const r = calculateMonthlyCommission(m.tramites)
                  return sum + r.amount
                }, 0)
                return (
                  <div className="grid grid-cols-2 gap-3 p-5 border-b border-slate-100">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1">Comisión este mes</div>
                      <div className="text-xl font-bold text-brand-green tabular-nums font-mono">
                        {currentCommission ? formatPrice(currentCommission.amount) : 'S/. 0.00'}
                      </div>
                      {currentCommission && currentCommission.count > 0 && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {COMMISSION_TIER_CONFIG[currentCommission.tier].icon} {COMMISSION_TIER_CONFIG[currentCommission.tier].label} · {COMMISSION_TIER_CONFIG[currentCommission.tier].ratePercent}%
                        </div>
                      )}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1">Pendiente de cobro</div>
                      <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                        {formatPrice(totalPending)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">se paga a fin de mes</div>
                    </div>
                  </div>
                )
              })()}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Mes', 'Clientes', 'Nivel', '%', 'Monto', 'Estado'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {commissionMonths.map(month => {
                      const r = calculateMonthlyCommission(month.tramites)
                      const tc = COMMISSION_TIER_CONFIG[r.tier]
                      const [year, mo] = month.yearMonth.split('-')
                      const label = new Date(parseInt(year), parseInt(mo) - 1, 1)
                        .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                      return (
                        <tr key={month.yearMonth} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-medium text-slate-800 capitalize">{label}</td>
                          <td className="px-4 py-3 text-slate-600">{r.count}</td>
                          <td className="px-4 py-3">{tc.icon} {tc.label}</td>
                          <td className="px-4 py-3 text-slate-600">{tc.ratePercent}%</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800 tabular-nums">{formatPrice(r.amount)}</td>
                          <td className="px-4 py-3">
                            {month.cashoutStatus === 'completed' ? (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Pagado</span>
                            ) : month.cashoutStatus === 'pending' ? (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">En proceso</span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Section 4: Historial de recompensas ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Historial de recompensas</h2>
        </div>

        {rewardsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <EmptyState
            icon={<Award size={28} className="text-slate-400" />}
            title="Sin recompensas aún"
            description="Completa trámites y sube de nivel para empezar a acumular recompensas y descuentos."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Descripción
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Monto
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Trámite
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rewards.map((reward) => {
                  const typeConfig = REWARD_TYPE_CONFIG[reward.type] ?? {
                    label: reward.type,
                    badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
                  }
                  return (
                    <tr key={reward.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border',
                            typeConfig.badgeClass
                          )}
                        >
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        <span className="line-clamp-2">{reward.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-semibold text-brand-green tabular-nums font-mono">
                          {formatPrice(reward.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {reward.tramites ? (
                          <code className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {(reward as any).tramites?.reference_code}
                          </code>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(reward.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
