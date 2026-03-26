import { createAdminClient } from '@/lib/supabase/admin'
import CashoutsClient from './CashoutsClient'
import type { CashoutStatus, CashoutMethod } from '@/types/database'

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
  brokers: { full_name: string; email: string } | null
}

export default async function SuperAdminCashoutsPage() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('cashout_requests')
    .select('*, brokers!broker_id(full_name, email)')
    .order('created_at', { ascending: false })

  const cashouts = (data ?? []) as unknown as CashoutRow[]
  return <CashoutsClient initialCashouts={cashouts} />
}
