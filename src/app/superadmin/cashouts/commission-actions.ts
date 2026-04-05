'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifySuperAdmin } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import { calculateMonthlyCommission } from '@/lib/commission'

interface GenerateResult {
  error?: string
  generated?: number
}

export async function generateMonthlyCommissions(
  year: number,
  month: number  // 1-based
): Promise<GenerateResult> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()

  // Month boundaries (ISO strings)
  const startOfMonth = new Date(year, month - 1, 1).toISOString()
  const endOfMonth = new Date(year, month, 1).toISOString()

  // Fetch all completed tramites in that month with no commission cashout yet
  const { data: tramites, error: fetchError } = await adminClient
    .from('tramites')
    .select('id, broker_id, final_price')
    .eq('status', 'completado')
    .gte('completed_at', startOfMonth)
    .lt('completed_at', endOfMonth)
    .is('commission_cashout_id', null)

  if (fetchError) return { error: fetchError.message }
  if (!tramites || tramites.length === 0) return { generated: 0 }

  // Group by broker
  const byBroker: Record<string, { id: string; final_price: number }[]> = {}
  for (const t of tramites as { id: string; broker_id: string; final_price: number }[]) {
    if (!byBroker[t.broker_id]) byBroker[t.broker_id] = []
    byBroker[t.broker_id].push({ id: t.id, final_price: t.final_price })
  }

  // Fetch brokers' info
  const brokerIds = Object.keys(byBroker)
  const { data: brokers, error: brokersError } = await adminClient
    .from('brokers')
    .select('id, full_name, email, bank_cci, bank_name, bank_titular')
    .in('id', brokerIds)

  if (brokersError) return { error: brokersError.message }

  let generated = 0

  for (const broker of (brokers ?? []) as { id: string; full_name: string; email: string; bank_cci: string | null; bank_name: string | null; bank_titular: string | null }[]) {
    const brokerTramites = byBroker[broker.id]
    if (!brokerTramites?.length) continue

    const result = calculateMonthlyCommission(brokerTramites)
    if (result.amount <= 0) continue

    // Insert cashout_request for this broker
    const { data: cashout, error: cashoutError } = await (adminClient.from('cashout_requests') as any)
      .insert({
        broker_id: broker.id,
        amount: result.amount,
        method: 'bank_transfer',
        payment_details: broker.bank_cci ? {
          banco: broker.bank_name ?? '',
          cci: broker.bank_cci,
          titular: broker.bank_titular ?? broker.full_name,
          tipo_cuenta: 'ahorros',
        } : {
          nota: `Comisión mensual ${year}-${String(month).padStart(2, '0')}`,
          broker: broker.full_name,
        },
        status: 'pending',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cashout_type: 'commission' as any,
        admin_notes: null,
      })
      .select('id')
      .single()

    if (cashoutError) {
      console.error('[generateMonthlyCommissions] cashout insert error for broker', broker.id, cashoutError.message)
      continue
    }

    // Link tramites to the cashout. If this fails, delete the cashout to prevent
    // an orphaned record that would cause double-payment on the next run.
    const tramiteIds = brokerTramites.map(t => t.id)
    const { error: updateError } = await (adminClient.from('tramites') as any)
      .update({ commission_cashout_id: cashout.id })
      .in('id', tramiteIds)

    if (updateError) {
      console.error('[generateMonthlyCommissions] tramites update error for broker', broker.id, updateError.message)
      // Compensating delete: remove the orphaned cashout so this broker is retried next run
      await (adminClient.from('cashout_requests') as any).delete().eq('id', cashout.id)
      continue
    }

    generated++
  }

  revalidatePath('/superadmin/cashouts')
  return { generated }
}
