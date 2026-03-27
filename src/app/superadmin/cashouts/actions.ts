'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
