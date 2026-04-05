'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifySuperAdmin } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'

export async function approveCashout(id: string): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({ status: 'approved', processed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}

export async function rejectCashout(
  id: string,
  notes: string
): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({
      status: 'rejected',
      admin_notes: notes,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}

export async function completeCashout(id: string): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}
