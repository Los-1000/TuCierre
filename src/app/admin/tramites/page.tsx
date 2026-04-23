import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import TramitesClient from './TramitesClient'

export default async function AdminTramitesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brokerResult } = await supabase
    .from('brokers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const broker = brokerResult as { is_admin: boolean } | null
  if (!broker?.is_admin) redirect('/dashboard')

  // Fetch ALL tramites using admin client (bypasses RLS).
  // Use !broker_id to disambiguate: tramites has TWO FKs to brokers
  // (broker_id and notaria_id), so PostgREST needs an explicit hint.
  const adminClient = createAdminClient()
  const { data: tramites, error } = await adminClient
    .from('tramites')
    .select('id, reference_code, status, final_price, created_at, updated_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    console.error('[admin/tramites] fetch error:', error.message)
  }

  return (
    <TramitesClient
      initialTramites={(tramites ?? []) as any}
      initialStatus={searchParams.status ?? 'all'}
    />
  )
}
