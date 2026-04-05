'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifySuperAdmin } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'

export async function approvePriceMatch(
  id: string,
  matchedPrice: number
): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.from('price_match_requests') as any)
    .update({
      status: 'approved',
      our_matched_price: matchedPrice,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/price-match')
  return {}
}

export async function rejectPriceMatch(id: string): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient.from('price_match_requests') as any)
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/price-match')
  return {}
}
