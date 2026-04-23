import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecompensasClient from './RecompensasClient'
import type { Broker, Reward, CashoutRequest } from '@/types/database'

export const metadata = { title: 'Recompensas · TuCierre' }

interface CommissionMonth {
  yearMonth: string
  tramites: { final_price: number; commission_cashout_id: string | null }[]
  cashoutStatus: 'pending' | 'completed' | 'unpaid'
}

export default async function RecompensasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    brokerResult,
    rewardsResult,
    cashoutsResult,
    referralsResult,
    referralRewardsResult,
    commTramitesResult,
  ] = await Promise.all([
    supabase.from('brokers').select('*').eq('id', user.id).single(),
    supabase
      .from('rewards')
      .select('*, tramites(reference_code)')
      .eq('broker_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('cashout_requests')
      .select('*')
      .eq('broker_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', user.id),
    supabase
      .from('rewards')
      .select('amount')
      .eq('broker_id', user.id)
      .eq('type', 'referral_bonus'),
    supabase
      .from('tramites')
      .select('final_price, commission_cashout_id, completed_at')
      .eq('broker_id', user.id)
      .eq('status', 'completado')
      .not('completed_at', 'is', null),
  ])

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

  const commCashoutIds = Array.from(
    new Set(tramiteRows.map(t => t.commission_cashout_id).filter(Boolean))
  ) as string[]

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

  const commissionMonths: CommissionMonth[] = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([ym, trams]) => {
      const firstCashoutId = trams.find(t => t.commission_cashout_id)?.commission_cashout_id
      const cashoutStatus = firstCashoutId
        ? (cashoutStatusMap[firstCashoutId] ?? 'pending')
        : 'unpaid'
      return { yearMonth: ym, tramites: trams, cashoutStatus }
    })

  const referralSavings = ((referralRewardsResult.data ?? []) as { amount: number }[])
    .reduce((sum, r) => sum + (r.amount ?? 0), 0)

  return (
    <RecompensasClient
      broker={brokerResult.data as Broker | null}
      initialRewards={(rewardsResult.data ?? []) as any[]}
      initialCashouts={(cashoutsResult.data ?? []) as CashoutRequest[]}
      referralCount={referralsResult.count ?? 0}
      referralSavings={referralSavings}
      initialCommissionMonths={commissionMonths}
    />
  )
}
