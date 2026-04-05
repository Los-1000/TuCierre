'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/auth-guards'
import { revalidatePath } from 'next/cache'
import type { TramiteStatus } from '@/types/database'

export async function updateTramiteStatus(
  ids: string[],
  status: TramiteStatus,
  notes: string | null
): Promise<{ error?: string }> {
  const check = await verifyAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()

  const { error: updateError } = await (adminClient.from('tramites') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (updateError) return { error: updateError.message }

  const { error: historyError } = await (adminClient.from('tramite_status_history') as any)
    .insert(ids.map(id => ({
      tramite_id: id,
      status,
      changed_by: check.userId,
      notes,
    })))

  if (historyError) return { error: historyError.message }

  revalidatePath('/admin/tramites')
  ids.forEach(id => revalidatePath(`/admin/tramites/${id}`))
  return {}
}

export async function updateDocumentStatus(
  tramiteId: string,
  documentName: string,
  status: 'approved' | 'rejected',
  rejectionNote?: string
): Promise<{ error?: string }> {
  const check = await verifyAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()

  // Fetch current documents array
  const { data: tramiteResult } = await adminClient
    .from('tramites')
    .select('documents')
    .eq('id', tramiteId)
    .single()

  const tramite = tramiteResult as { documents: any[] } | null
  if (!tramite) return { error: 'Trámite no encontrado' }

  const docs = tramite.documents ?? []
  const updated = docs.map((d: any) =>
    d.name === documentName
      ? { ...d, status, ...(rejectionNote ? { rejection_note: rejectionNote } : {}) }
      : d
  )

  const { error } = await (adminClient.from('tramites') as any)
    .update({ documents: updated })
    .eq('id', tramiteId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/tramites/${tramiteId}`)
  return {}
}
