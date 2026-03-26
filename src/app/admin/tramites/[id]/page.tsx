import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import AdminTramiteClient from './AdminTramiteClient'

export default async function AdminTramiteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: self } = await supabase
    .from('brokers')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!self?.is_admin) redirect('/dashboard')

  const admin = createAdminClient()

  const { data: tramite, error } = await admin
    .from('tramites')
    .select(`
      *,
      tramite_types!tramite_type_id(id, display_name, base_price, estimated_days, required_documents),
      brokers!broker_id(id, full_name, email, phone, tier, company_name, total_tramites, referral_code),
      tramite_status_history(id, status, changed_by, notes, created_at)
    `)
    .eq('id', params.id)
    .single()

  if (error || !tramite) {
    console.error('[admin/tramites/id] fetch error:', error?.message)
    notFound()
  }

  return (
    <AdminTramiteClient
      tramite={tramite as any}
      adminName={self.full_name ?? 'Notaría'}
    />
  )
}
