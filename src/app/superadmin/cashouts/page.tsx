import { createAdminClient } from '@/lib/supabase/admin'
import CashoutsClient from './CashoutsClient'
import type { CashoutStatus, CashoutMethod } from '@/types/database'
import { calculateMonthlyCommission } from '@/lib/commission'

export interface CashoutRow {
  id: string
  broker_id: string
  amount: number
  method: CashoutMethod
  payment_details: Record<string, string>
  status: CashoutStatus
  admin_notes: string | null
  created_at: string
  processed_at: string | null
  cashout_type: string
  brokers: { full_name: string; email: string } | null
}

export interface BrokerPendingCommission {
  broker_id: string
  broker_name: string
  broker_email: string
  count: number
  tier: 1 | 2 | 3
  rate: number
  amount: number
}

export default async function SuperAdminCashoutsPage() {
  const adminClient = createAdminClient()

  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStart = prevMonth.toISOString()
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [cashoutsResult, pendingCommTramitesResult] = await Promise.all([
    adminClient
      .from('cashout_requests')
      .select('*, brokers!broker_id(full_name, email)')
      .order('created_at', { ascending: false }),
    adminClient
      .from('tramites')
      .select('id, broker_id, final_price, brokers!broker_id(full_name, email)')
      .eq('status', 'completado')
      .gte('completed_at', prevMonthStart)
      .lt('completed_at', prevMonthEnd)
      .is('commission_cashout_id', null),
  ])

  const cashouts = (cashoutsResult.data ?? []) as unknown as CashoutRow[]

  // Compute pending commissions per broker for previous month
  const tramites = (pendingCommTramitesResult.data ?? []) as unknown as {
    id: string
    broker_id: string
    final_price: number
    brokers: { full_name: string; email: string } | null
  }[]

  const byBroker: Record<string, { tramites: { final_price: number }[]; broker: { full_name: string; email: string } }> = {}
  for (const t of tramites) {
    if (!byBroker[t.broker_id]) {
      byBroker[t.broker_id] = {
        tramites: [],
        broker: t.brokers ?? { full_name: '—', email: '—' },
      }
    }
    byBroker[t.broker_id].tramites.push({ final_price: t.final_price })
  }

  const pendingCommissions: BrokerPendingCommission[] = Object.entries(byBroker)
    .map(([broker_id, { tramites: bt, broker }]) => {
      const r = calculateMonthlyCommission(bt)
      return {
        broker_id,
        broker_name: broker.full_name,
        broker_email: broker.email,
        count: r.count,
        tier: r.tier,
        rate: r.rate,
        amount: r.amount,
      }
    })
    .filter(b => b.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <CashoutsClient
      initialCashouts={cashouts}
      pendingCommissions={pendingCommissions}
      prevYear={prevMonth.getFullYear()}
      prevMonth={prevMonth.getMonth() + 1}
    />
  )
}
