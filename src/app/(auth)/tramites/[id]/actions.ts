'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelTramite(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('tramites')
    .update({ status: 'cancelado' } as never)
    .eq('id', id)
    .eq('broker_id', user.id)
    .not('status', 'in', '("completado","cancelado")')

  if (error) return { error: error.message }
  revalidatePath(`/tramites/${id}`)
  return {}
}
