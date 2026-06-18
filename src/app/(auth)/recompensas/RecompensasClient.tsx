'use client'

import { useRouter } from 'next/navigation'
import { Users, PiggyBank, TrendingUp, Award, Wallet, Clock, ArrowDownCircle, DollarSign } from 'lucide-react'
import { calculateMonthlyCommission } from '@/lib/commission'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import ReferralCode from '@/components/shared/ReferralCode'
import EmptyState from '@/components/shared/EmptyState'
import CashoutDialog from '@/components/recompensas/CashoutDialog'
import type { Broker, Reward, CashoutRequest, CashoutStatus } from '@/types/database'

const REWARD_TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  volume_discount: { label: 'Cashback por trámite', badgeClass: 'bg-[#2855E0]/8 text-[#2855E0] border-[#2855E0]/20' },
  referral_bonus:  { label: 'Bono de referido',     badgeClass: 'bg-[#2855E0]/8 text-[#2855E0] border-[#2855E0]/20' },
  price_match:     { label: 'Price match',           badgeClass: 'bg-[#2855E0]/8 text-[#2855E0] border-[#2855E0]/20' },
}

const CASHOUT_STATUS_CONFIG: Record<CashoutStatus, { label: string; badgeClass: string }> = {
  pending:   { label: 'Pendiente',  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:  { label: 'Aprobado',   badgeClass: 'bg-[#2855E0]/8 text-[#2855E0] border-[#2855E0]/20' },
  rejected:  { label: 'Rechazado',  badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completado', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const CASHOUT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: 'Transferencia bancaria',
  yape:          'Yape',
  plin:          'Plin',
  otros:         'Otros',
}

interface CommissionMonth {
  yearMonth: string
  tramites: { final_price: number; commission_cashout_id: string | null }[]
  cashoutStatus: 'pending' | 'completed' | 'unpaid'
}

type RewardRow = Reward & { tramites?: { reference_code: string } | null }

interface RecompensasClientProps {
  broker: Broker | null
  initialRewards: RewardRow[]
  initialCashouts: CashoutRequest[]
  referralCount: number
  referralSavings: number
  referralCashback: number
  initialCommissionMonths: CommissionMonth[]
}

export default function RecompensasClient({
  broker,
  initialRewards,
  initialCashouts,
  referralCount,
  referralSavings,
  referralCashback,
  initialCommissionMonths,
}: RecompensasClientProps) {
  const router = useRouter()

  const lockedAmount = initialCashouts
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)
  const withdrawnAmount = initialCashouts
    .filter(c => c.status === 'approved' || c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)
  const availableBalance = Math.max(0, referralSavings - lockedAmount - withdrawnAmount)
  const hasPendingCashout = initialCashouts.some(c => c.status === 'pending')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-display text-navy-900 tracking-tight">Recompensas</h1>
        <p className="text-navy-400 text-sm mt-1">
          Tu cashback, tus referidos y tus retiros — todo en un lugar.
        </p>
      </div>

      {/* ── Cashback model card (flat, no levels) ── */}
      <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6 md:p-8">
        <h2 className="text-base font-semibold text-navy-900">Cómo ganas con TuCierre</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl border border-[#2855E0]/15 bg-[#2855E0]/5 p-5">
            <div className="text-4xl font-black tracking-tight text-[#2855E0] tabular-nums">5%</div>
            <p className="text-sm font-semibold text-navy-900 mt-1">de cashback por cada trámite</p>
            <p className="text-xs text-navy-900/70 mt-0.5">Sobre cada trámite que cierras, desde el primero.</p>
          </div>
          <div className="rounded-2xl border border-[#1C7A52]/20 bg-[#1C7A52]/5 p-5">
            <div className="text-4xl font-black tracking-tight text-[#1C7A52] tabular-nums">1%</div>
            <p className="text-sm font-semibold text-navy-900 mt-1">por los trámites de tus referidos</p>
            <p className="text-xs text-navy-900/70 mt-0.5">Por cada trámite que cierran los brokers que invitas.</p>
          </div>
        </div>
        <p className="text-xs text-navy-900/70 mt-4">
          Sin niveles. Sin mínimos. Tu cashback se acumula solo y se paga a fin de mes.
        </p>
      </div>

      {/* ── Referral code ── */}
      <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={17} className="text-navy-900/70" />
          <h2 className="text-base font-semibold text-navy-900">Código de referido</h2>
        </div>
        <p className="text-sm text-navy-900/70 mb-5">
          Comparte tu código y gana 1% de cada trámite que cierren tus referidos.
        </p>
        {broker?.referral_code ? (
          <ReferralCode code={broker.referral_code} />
        ) : (
          <p className="text-sm text-[#6B7A9A] italic">Código de referido no disponible.</p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-navy-900/4 border border-navy-900/8 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users size={15} className="text-[#2855E0]" />
            </div>
            <div className="text-2xl font-bold text-navy-900">{referralCount}</div>
            <div className="text-xs text-navy-900/70 mt-0.5">referidos activos</div>
          </div>
          <div className="bg-navy-900/4 border border-navy-900/8 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <PiggyBank size={15} className="text-[#1C7A52]" />
            </div>
            <div className="text-lg font-bold text-navy-900 tabular-nums font-mono">{formatPrice(referralCashback)}</div>
            <div className="text-xs text-navy-900/70 mt-0.5">ganado por referidos (1%)</div>
          </div>
        </div>
      </div>

      {/* ── Retiro de saldo ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={17} className="text-navy-400" />
          <h2 className="text-lg font-semibold text-navy-900">Retiro de saldo</h2>
        </div>

        <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownCircle size={15} className="text-green-600" />
                <span className="text-xs text-navy-900/70 font-medium">Saldo disponible</span>
              </div>
              <div className="text-xl font-bold text-green-700 tabular-nums font-mono">
                {formatPrice(availableBalance)}
              </div>
            </div>
            {lockedAmount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={15} className="text-amber-600" />
                  <span className="text-xs text-navy-900/70 font-medium">En proceso</span>
                </div>
                <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                  {formatPrice(lockedAmount)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-navy-900/70">
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
                onSuccess={() => router.refresh()}
              />
            )}
          </div>

          {initialCashouts.length > 0 && (
            <div className="mt-5 border-t border-navy-900/8 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B7A9A] mb-3">Historial de retiros</h3>
              <div className="space-y-2">
                {initialCashouts.map((c) => {
                  const statusConf = CASHOUT_STATUS_CONFIG[c.status]
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 py-2.5 border-b border-navy-900/5 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-sm text-navy-900/70">
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
                        <div className="text-sm font-semibold text-navy-900 tabular-nums font-mono">
                          {formatPrice(c.amount)}
                        </div>
                        <div className="text-xs text-[#6B7A9A]">{formatDate(c.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cashback ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={17} className="text-navy-400" />
          <h2 className="text-lg font-semibold text-navy-900">Cashback</h2>
        </div>

        {initialCommissionMonths.length === 0 ? (
          <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] py-10 text-center">
            <DollarSign size={28} className="mx-auto text-navy-900/70 mb-2" />
            <p className="text-sm text-[#6B7A9A]">Aún no tienes cashback generado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
            {(() => {
              const currentMonth = new Date().toISOString().slice(0, 7)
              const currentMonthData = initialCommissionMonths.find(m => m.yearMonth === currentMonth)
              const pendingMonths = initialCommissionMonths.filter(m => m.cashoutStatus === 'unpaid')
              const currentCommission = currentMonthData
                ? calculateMonthlyCommission(currentMonthData.tramites)
                : null
              const totalPending = pendingMonths.reduce((sum, m) => {
                const r = calculateMonthlyCommission(m.tramites)
                return sum + r.amount
              }, 0)
              return (
                <div className="grid grid-cols-2 gap-3 p-5 border-b border-navy-900/6">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="text-xs text-navy-900/70 font-medium mb-1">Cashback este mes</div>
                    <div className="text-xl font-bold text-green-700 tabular-nums font-mono">
                      {currentCommission ? formatPrice(currentCommission.amount) : 'S/. 0.00'}
                    </div>
                    {currentCommission && currentCommission.count > 0 && (
                      <div className="text-xs text-navy-900/70 mt-0.5">
                        {currentCommission.count} trámite{currentCommission.count !== 1 ? 's' : ''} · 5%
                      </div>
                    )}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="text-xs text-navy-900/70 font-medium mb-1">Pendiente de cobro</div>
                    <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                      {formatPrice(totalPending)}
                    </div>
                    <div className="text-xs text-navy-900/70 mt-0.5">se paga a fin de mes</div>
                  </div>
                </div>
              )
            })()}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-900/8">
                    {['Mes', 'Trámites', '%', 'Monto', 'Estado'].map(h => (
                      <th key={h} scope="col" className="text-left text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {initialCommissionMonths.map(month => {
                    const r = calculateMonthlyCommission(month.tramites)
                    const [year, mo] = month.yearMonth.split('-')
                    const label = new Date(parseInt(year), parseInt(mo) - 1, 1)
                      .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                    return (
                      <tr key={month.yearMonth} className="hover:bg-navy-900/3 transition-colors motion-reduce:transition-none">
                        <td className="px-5 py-3.5 font-medium text-navy-900 capitalize">{label}</td>
                        <td className="px-5 py-3.5 text-navy-900/70">{r.count}</td>
                        <td className="px-5 py-3.5 text-navy-900/70">{Math.round(r.rate * 100)}%</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-navy-900 tabular-nums">{formatPrice(r.amount)}</td>
                        <td className="px-5 py-3.5">
                          {month.cashoutStatus === 'completed' ? (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Pagado</span>
                          ) : month.cashoutStatus === 'pending' ? (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">En proceso</span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-navy-900/4 text-navy-900/70 border-navy-900/10">Pendiente</span>
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
          <TrendingUp size={17} className="text-navy-400" />
          <h2 className="text-lg font-semibold text-navy-900">Historial de recompensas</h2>
        </div>

        {initialRewards.length === 0 ? (
          <EmptyState
            icon={<Award size={28} className="text-navy-900/70" />}
            title="Sin recompensas aún"
            description="Cierra trámites e invita referidos para empezar a acumular cashback."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-navy-900/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-900/8">
                  <th scope="col" className="text-left text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3">Tipo</th>
                  <th scope="col" className="text-left text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3">Descripción</th>
                  <th scope="col" className="text-right text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3">Monto</th>
                  <th scope="col" className="text-left text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3 hidden md:table-cell">Trámite</th>
                  <th scope="col" className="text-left text-xs font-bold uppercase tracking-widest text-[#6B7A9A] px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {initialRewards.map((reward) => {
                  const typeConfig = REWARD_TYPE_CONFIG[reward.type] ?? {
                    label: reward.type,
                    badgeClass: 'bg-navy-900/4 text-navy-900/70 border-navy-900/10',
                  }
                  return (
                    <tr key={reward.id} className="hover:bg-navy-900/3 transition-colors motion-reduce:transition-none">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border', typeConfig.badgeClass)}>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-navy-900/70 max-w-xs">
                        <span className="line-clamp-2">{reward.description}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="font-semibold text-[#2855E0] tabular-nums font-mono">
                          {formatPrice(reward.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {reward.tramites ? (
                          <code className="text-xs font-mono text-navy-900/70 bg-navy-900/6 px-2 py-0.5 rounded-full">
                            {reward.tramites?.reference_code}
                          </code>
                        ) : (
                          <span className="text-[#6B7A9A] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7A9A] text-xs whitespace-nowrap">
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
