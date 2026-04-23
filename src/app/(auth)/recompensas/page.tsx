'use client'

import { useEffect, useState } from 'react'
import { Star, Users, PiggyBank, TrendingUp, Award, CheckCircle, Wallet, Clock, ArrowDownCircle, DollarSign, Lock } from 'lucide-react'
import { calculateMonthlyCommission, COMMISSION_TIER_CONFIG } from '@/lib/commission'
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

// Tier colors per design spec
const TIER_COLOR: Record<BrokerTier, string> = {
  bronce: '#C05621',
  plata:  '#718096',
  oro:    '#D69E2E',
}

const TIER_BORDER: Record<BrokerTier, string> = {
  bronce: 'border-[#C05621]/20',
  plata:  'border-2 border-[#718096] shadow-md',
  oro:    'border-2 border-[#D69E2E] border-dashed',
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
  yearMonth: string
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
      const savingsSum = ((referralRewardsResult.data ?? []) as { amount: number }[]).reduce(
        (sum, r) => sum + (r.amount ?? 0),
        0
      )
      setReferralSavings(savingsSum)
      setCashouts((cashoutsResult.data ?? []) as CashoutRequest[])
      setRewardsLoading(false)
      setCashoutsLoading(false)

      const tramiteRows = (commTramitesResult.data ?? []) as {
        final_price: number
        commission_cashout_id: string | null
        completed_at: string
      }[]
      const byMonth: Record<string, typeof tramiteRows> = {}
      for (const t of tramiteRows) {
        const ym = t.completed_at.slice(0, 7)
        if (!byMonth[ym]) byMonth[ym] = []
        byMonth[ym].push(t)
      }
      const commCashoutIds = Array.from(new Set(tramiteRows.map(t => t.commission_cashout_id).filter(Boolean))) as string[]
      const cashoutStatusMap: Record<string, 'pending' | 'completed' | 'unpaid'> = {}
      if (commCashoutIds.length > 0) {
        const { data: cData } = await supabase
          .from('cashout_requests')
          .select('id, status')
          .in('id', commCashoutIds)
          .eq('cashout_type', 'commission')
        for (const c of (cData ?? [])) {
          const cs = (c as any).status as string
          cashoutStatusMap[(c as any).id] = cs === 'completed' ? 'completed' : cs === 'rejected' ? 'unpaid' : 'pending'
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
  const tierColor = TIER_COLOR[tier]

  const lockedAmount = cashouts
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)
  const withdrawnAmount = cashouts
    .filter(c => c.status === 'approved' || c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)
  const availableBalance = Math.max(0, referralSavings - lockedAmount - withdrawnAmount)
  const hasPendingCashout = cashouts.some(c => c.status === 'pending')

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

  const tierBenefits: Record<BrokerTier, string[]> = {
    bronce: [
      '3% de comisión por cada trámite completado',
      'Soporte básico por mensajería',
      'Price matching disponible',
    ],
    plata: [
      '5% de comisión por cada trámite completado',
      'Prioridad media en revisión',
      'Soporte preferente',
    ],
    oro: [
      '8% de comisión por cada trámite completado',
      'Prioridad máxima en revisión',
      'Atención dedicada',
      'Gestor asignado',
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Recompensas</h1>
        <p className="text-white/50 text-sm mt-1">
          Tu nivel de fidelidad, beneficios y ahorro acumulado.
        </p>
      </div>

      {/* ── Tier hero card ── */}
      {brokerLoading ? (
        <CardSkeleton />
      ) : (
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: tier badge */}
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shrink-0"
                style={{ backgroundColor: tierColor }}
              >
                {tierConfig.icon}
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: tierColor }}>{tierConfig.label}</div>
                <p className="text-sm text-[#18181B]/50 mt-0.5">
                  {monthCount} trámite{monthCount !== 1 ? 's' : ''} este mes
                </p>
              </div>
            </div>

            {/* Center: progress bar */}
            <div className="flex-1">
              {tier !== 'oro' ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#18181B]/50 font-medium">Progreso hacia {nextTierLabel}</span>
                    <span className="text-xs font-semibold text-[#18181B]">
                      {monthCount} / {tier === 'bronce' ? 4 : 8}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#18181B]/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%`, backgroundColor: tierColor }}
                    />
                  </div>
                  <p className="text-xs text-[#18181B]/50 mt-2">
                    {tramitesToNext > 0 ? (
                      <><span className="font-semibold text-[#18181B]">{tramitesToNext} trámite{tramitesToNext !== 1 ? 's' : ''} más</span>{' '}para subir a {nextTierLabel}</>
                    ) : (
                      <span className="font-semibold text-[#2855E0]">¡Estás a punto de subir a {nextTierLabel}!</span>
                    )}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-[#D69E2E]/10 border border-[#D69E2E]/20 rounded-xl px-4 py-2.5 w-fit">
                  <Star size={14} className="text-[#D69E2E] fill-[#D69E2E] shrink-0" />
                  <span className="text-sm text-[#D69E2E] font-semibold">Máximo nivel alcanzado</span>
                </div>
              )}
            </div>

            {/* Right: amber callout */}
            {tier !== 'oro' && tierConfig.discount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center shrink-0">
                <div className="text-2xl font-bold text-amber-700">{tierConfig.discount}%</div>
                <div className="text-xs text-amber-600 font-medium mt-0.5">descuento</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3 tier cards ── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Beneficios del programa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['bronce', 'plata', 'oro'] as BrokerTier[]).map((t) => {
            const config = TIER_CONFIG[t]
            const isActive = tier === t
            const color = TIER_COLOR[t]
            const isLocked = (t === 'plata' && tier === 'bronce') || (t === 'oro' && tier !== 'oro')
            const TierIcon = t === 'oro' ? Award : t === 'plata' ? Star : TrendingUp

            return (
              <div
                key={t}
                className={cn(
                  'rounded-2xl p-5 transition-all duration-200',
                  isActive
                    ? 'bg-white border-2 shadow-[0_8px_28px_rgba(0,0,0,0.10)]'
                    : isLocked
                    ? 'bg-white/55 border border-white/10'
                    : 'bg-white border border-[#18181B]/8',
                )}
                style={isActive ? { borderColor: color } : {}}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: isActive ? `${color}18` : 'rgba(24,24,27,0.05)',
                      color: isActive ? color : 'rgba(24,24,27,0.3)',
                    }}
                  >
                    <TierIcon size={17} />
                  </div>
                  {isActive ? (
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      Actual
                    </span>
                  ) : isLocked ? (
                    <Lock size={13} className="text-[#18181B]/25 mt-1" />
                  ) : null}
                </div>

                {/* Tier label */}
                <div className="mb-3">
                  <span
                    className={cn('font-black text-lg tracking-tight')}
                    style={{ color: isActive ? color : isLocked ? 'rgba(24,24,27,0.35)' : '#18181B' }}
                  >
                    {config.label}
                  </span>
                  {config.discount > 0 && (
                    <p className="text-xs text-[#18181B]/40 mt-0.5">
                      {TIER_CONFIG[t].minTramites}+ trámites/mes
                    </p>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  {tierBenefits[t].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle
                        size={13}
                        className="mt-0.5 shrink-0"
                        style={{ color: isActive ? color : 'rgba(24,24,27,0.2)' }}
                      />
                      <span
                        className="text-sm leading-snug"
                        style={{ color: isActive ? 'rgba(24,24,27,0.75)' : 'rgba(24,24,27,0.4)' }}
                      >
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {isLocked && tramitesToNext > 0 && (
                  <div
                    className="mt-4 text-center py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${color}10`, color }}
                  >
                    Faltan {tramitesToNext} trámite{tramitesToNext !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Referral code ── */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={17} className="text-[#18181B]/50" />
          <h2 className="text-base font-semibold text-[#18181B]">Código de referido</h2>
        </div>
        <p className="text-sm text-[#18181B]/50 mb-5">
          Comparte tu código y gana beneficios adicionales cuando tus referidos completen trámites.
        </p>
        {brokerLoading ? (
          <div className="h-11 bg-[#18181B]/6 rounded-2xl animate-pulse" />
        ) : broker?.referral_code ? (
          <ReferralCode code={broker.referral_code} />
        ) : (
          <p className="text-sm text-[#18181B]/40 italic">Código de referido no disponible.</p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-slate-50 border border-[#18181B]/8 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users size={15} className="text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-[#18181B]">
              {rewardsLoading ? '–' : referralCount}
            </div>
            <div className="text-xs text-[#18181B]/50 mt-0.5">referidos activos</div>
          </div>
          <div className="bg-slate-50 border border-[#18181B]/8 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <PiggyBank size={15} className="text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-[#18181B] tabular-nums">
              {rewardsLoading ? '–' : formatPrice(referralSavings)}
            </div>
            <div className="text-xs text-[#18181B]/50 mt-0.5">ahorro por referidos</div>
          </div>
        </div>
      </div>

      {/* ── Retiro de referidos ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={17} className="text-[#18181B]/50" />
          <h2 className="text-lg font-semibold text-[#18181B]">Retiro de referidos</h2>
        </div>

        {brokerLoading || cashoutsLoading ? (
          <CardSkeleton />
        ) : (
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowDownCircle size={15} className="text-green-600" />
                  <span className="text-xs text-[#18181B]/50 font-medium">Saldo disponible</span>
                </div>
                <div className="text-xl font-bold text-green-700 tabular-nums font-mono">
                  {formatPrice(availableBalance)}
                </div>
              </div>
              {lockedAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={15} className="text-amber-600" />
                    <span className="text-xs text-[#18181B]/50 font-medium">En proceso</span>
                  </div>
                  <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                    {formatPrice(lockedAmount)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-[#18181B]/50">
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

            {cashouts.length > 0 && (
              <div className="mt-5 border-t border-[#18181B]/8 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40 mb-3">Historial de retiros</h3>
                <div className="space-y-2">
                  {cashouts.map((c) => {
                    const statusConf = CASHOUT_STATUS_CONFIG[c.status]
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 py-2.5 border-b border-[#18181B]/5 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-sm text-[#18181B]/60">
                            {CASHOUT_METHOD_LABEL[c.method] ?? c.method}
                          </span>
                          <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', statusConf.badgeClass)}>
                            {statusConf.label}
                          </span>
                          {c.status === 'rejected' && (c as any).admin_notes && (
                            <span className="text-xs text-red-500 truncate max-w-[160px]">
                              {(c as any).admin_notes}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-[#18181B] tabular-nums font-mono">
                            {formatPrice(c.amount)}
                          </div>
                          <div className="text-xs text-[#18181B]/40">{formatDate(c.created_at)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Comisiones ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={17} className="text-[#18181B]/50" />
          <h2 className="text-lg font-semibold text-[#18181B]">Comisiones</h2>
        </div>

        {commissionsLoading ? (
          <CardSkeleton />
        ) : commissionMonths.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] py-10 text-center">
            <DollarSign size={28} className="mx-auto text-[#18181B]/20 mb-2" />
            <p className="text-sm text-[#18181B]/40">Aún no tienes comisiones generadas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
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
                <div className="grid grid-cols-2 gap-3 p-5 border-b border-[#18181B]/6">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="text-xs text-[#18181B]/50 font-medium mb-1">Comisión este mes</div>
                    <div className="text-xl font-bold text-green-700 tabular-nums font-mono">
                      {currentCommission ? formatPrice(currentCommission.amount) : 'S/. 0.00'}
                    </div>
                    {currentCommission && currentCommission.count > 0 && (
                      <div className="text-xs text-[#18181B]/50 mt-0.5">
                        {COMMISSION_TIER_CONFIG[currentCommission.tier].icon} {COMMISSION_TIER_CONFIG[currentCommission.tier].label} · {COMMISSION_TIER_CONFIG[currentCommission.tier].ratePercent}%
                      </div>
                    )}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="text-xs text-[#18181B]/50 font-medium mb-1">Pendiente de cobro</div>
                    <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                      {formatPrice(totalPending)}
                    </div>
                    <div className="text-xs text-[#18181B]/50 mt-0.5">se paga a fin de mes</div>
                  </div>
                </div>
              )
            })()}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#18181B]/8">
                    {['Mes', 'Clientes', 'Nivel', '%', 'Monto', 'Estado'].map(h => (
                      <th key={h} className="text-left text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/5">
                  {commissionMonths.map(month => {
                    const r = calculateMonthlyCommission(month.tramites)
                    const tc = COMMISSION_TIER_CONFIG[r.tier]
                    const [year, mo] = month.yearMonth.split('-')
                    const label = new Date(parseInt(year), parseInt(mo) - 1, 1)
                      .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                    return (
                      <tr key={month.yearMonth} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#18181B] capitalize">{label}</td>
                        <td className="px-5 py-3.5 text-[#18181B]/60">{r.count}</td>
                        <td className="px-5 py-3.5">{tc.icon} {tc.label}</td>
                        <td className="px-5 py-3.5 text-[#18181B]/60">{tc.ratePercent}%</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-[#18181B] tabular-nums">{formatPrice(r.amount)}</td>
                        <td className="px-5 py-3.5">
                          {month.cashoutStatus === 'completed' ? (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Pagado</span>
                          ) : month.cashoutStatus === 'pending' ? (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">En proceso</span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-50 text-[#18181B]/50 border-[#18181B]/10">Pendiente</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Historial de recompensas ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={17} className="text-[#18181B]/50" />
          <h2 className="text-lg font-semibold text-[#18181B]">Historial de recompensas</h2>
        </div>

        {rewardsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <EmptyState
            icon={<Award size={28} className="text-[#18181B]/30" />}
            title="Sin recompensas aún"
            description="Completa trámites y sube de nivel para empezar a acumular recompensas y descuentos."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#18181B]/8">
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3">Tipo</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3">Descripción</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3">Monto</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3 hidden md:table-cell">Trámite</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/5">
                {rewards.map((reward) => {
                  const typeConfig = REWARD_TYPE_CONFIG[reward.type] ?? {
                    label: reward.type,
                    badgeClass: 'bg-slate-50 text-[#18181B]/60 border-[#18181B]/10',
                  }
                  return (
                    <tr key={reward.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border', typeConfig.badgeClass)}>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#18181B]/70 max-w-xs">
                        <span className="line-clamp-2">{reward.description}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="font-semibold text-emerald-600 tabular-nums font-mono">
                          {formatPrice(reward.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {reward.tramites ? (
                          <code className="text-xs font-mono text-[#18181B]/50 bg-[#18181B]/6 px-2 py-0.5 rounded-full">
                            {(reward as any).tramites?.reference_code}
                          </code>
                        ) : (
                          <span className="text-[#18181B]/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#18181B]/40 text-xs whitespace-nowrap">
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
