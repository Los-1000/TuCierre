'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { TramiteStatus } from '@/types/database'

export async function updateTramiteStatus(
  ids: string[],
  status: TramiteStatus,
  notes: string | null
): Promise<{ error?: string }> {
  // Verify admin via session client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: broker } = await supabase
    .from('brokers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!broker?.is_admin) return { error: 'Sin permisos' }

  // Use admin client to bypass RLS for writes
  const adminClient = createAdminClient()

  const { error: updateError } = await adminClient
    .from('tramites')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (updateError) return { error: updateError.message }

  const { error: historyError } = await adminClient
    .from('tramite_status_history')
    .insert(ids.map(id => ({
      tramite_id: id,
      status,
      changed_by: user.id,
      notes,
    })))

  if (historyError) return { error: historyError.message }

  revalidatePath('/admin/tramites')
  revalidatePath(`/admin/tramites/${ids[0]}`)
  return {}
}

export async function updateDocumentStatus(
  tramiteId: string,
  documentName: string,
  status: 'approved' | 'rejected',
  rejectionNote?: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: broker } = await supabase
    .from('brokers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!broker?.is_admin) return { error: 'Sin permisos' }

  const adminClient = createAdminClient()

  // Fetch current documents array
  const { data: tramite } = await adminClient
    .from('tramites')
    .select('documents')
    .eq('id', tramiteId)
    .single()

  if (!tramite) return { error: 'Trámite no encontrado' }

  const docs = (tramite.documents as any[]) ?? []
  const updated = docs.map((d: any) =>
    d.name === documentName
      ? { ...d, status, ...(rejectionNote ? { rejection_note: rejectionNote } : {}) }
      : d
  )

  const { error } = await adminClient
    .from('tramites')
    .update({ documents: updated })
    .eq('id', tramiteId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/tramites/${tramiteId}`)
  return {}
}
