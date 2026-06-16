import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMe } from '@/lib/server-api'
import { calculateReferralCashback } from '@/lib/commission'
import RecompensasClient from './RecompensasClient'
import type { Broker, BrokerTier, CashoutRequest } from '@/types/database'

export const metadata = { title: 'Recompensas · TuCierre' }

interface CommissionMonth {
  yearMonth: string
  tramites: { final_price: number; commission_cashout_id: string | null }[]
  cashoutStatus: 'pending' | 'completed' | 'unpaid'
}

export default async function RecompensasPage() {
  // The app authenticates via the `access_token` cookie (REST backend + demo
  // mock token) — the same system the (auth) layout and dashboard use. There is
  // no Supabase auth session, so gating on supabase.auth.getUser() here would
  // always redirect to /login. Gate on the real auth system instead.
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  const apiBroker = await getMe(accessToken)
  if (!apiBroker) redirect('/login')

  const broker = {
    id: String(apiBroker.id),
    full_name: apiBroker.fullName,
    email: apiBroker.email,
    tier: (apiBroker.tierName?.toLowerCase() ?? 'bronce') as BrokerTier,
    total_tramites_month: 0,
    referral_code: apiBroker.referralCode ?? null,
  } as unknown as Broker

  // Rewards / cashouts / commissions live in Supabase, keyed by the Supabase
  // user. Fetch them only when a real Supabase session exists; otherwise render
  // empty (the demo/REST flow has none). Never redirect or crash on its absence.
  let initialRewards: any[] = []
  let initialCashouts: CashoutRequest[] = []
  let referralCount = 0
  let referralSavings = 0
  let referralCashback = 0
  let commissionMonths: CommissionMonth[] = []

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('supabase-unconfigured')
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [
        rewardsResult,
        cashoutsResult,
        referralsResult,
        referralRewardsResult,
        commTramitesResult,
      ] = await Promise.all([
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

      initialRewards = rewardsResult.data ?? []
      initialCashouts = (cashoutsResult.data ?? []) as CashoutRequest[]
      referralCount = referralsResult.count ?? 0
      referralSavings = ((referralRewardsResult.data ?? []) as { amount: number }[])
        .reduce((sum, r) => sum + (r.amount ?? 0), 0)

      // 1% cashback on trámites completed by this broker's referrals.
      const { data: referredBrokers } = await supabase
        .from('brokers')
        .select('id')
        .eq('referred_by', user.id)
      const referredIds = ((referredBrokers ?? []) as { id: string }[]).map(b => b.id)
      if (referredIds.length > 0) {
        const { data: refTramites } = await supabase
          .from('tramites')
          .select('final_price')
          .in('broker_id', referredIds)
          .eq('status', 'completado')
        referralCashback = calculateReferralCashback((refTramites ?? []) as { final_price: number }[])
      }

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

      commissionMonths = Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([ym, trams]) => {
          const firstCashoutId = trams.find(t => t.commission_cashout_id)?.commission_cashout_id
          const cashoutStatus = firstCashoutId
            ? (cashoutStatusMap[firstCashoutId] ?? 'pending')
            : 'unpaid'
          return { yearMonth: ym, tramites: trams, cashoutStatus }
        })
    }
  } catch {
    // Supabase not configured / no session — render with empty data.
  }

  return (
    <RecompensasClient
      broker={broker}
      initialRewards={initialRewards}
      initialCashouts={initialCashouts}
      referralCount={referralCount}
      referralSavings={referralSavings}
      referralCashback={referralCashback}
      initialCommissionMonths={commissionMonths}
    />
  )
}
