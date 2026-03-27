'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { calculateMonthlyCommission } from '@/lib/commission'

async function verifySuperAdmin(): Promise<{ error: string } | { userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data } = await supabase
    .from('brokers')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  const broker = data as { is_superadmin: boolean } | null
  if (!broker?.is_superadmin) return { error: 'Sin permisos' }

  return { userId: user.id }
}

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

    // Update all tramites with commission_cashout_id
    const tramiteIds = brokerTramites.map(t => t.id)
    const { error: updateError } = await (adminClient.from('tramites') as any)
      .update({ commission_cashout_id: cashout.id })
      .in('id', tramiteIds)

    if (updateError) {
      console.error('[generateMonthlyCommissions] tramites update error', updateError.message)
      continue
    }

    generated++
  }

  revalidatePath('/superadmin/cashouts')
  return { generated }
}
