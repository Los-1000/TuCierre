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

  const { data: broker } = await supabase
    .from('brokers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!broker?.is_admin) redirect('/dashboard')

  // Fetch ALL tramites using admin client (bypasses RLS).
  // Use !broker_id to disambiguate: tramites has TWO FKs to brokers
  // (broker_id and notaria_id), so PostgREST needs an explicit hint.
  const adminClient = createAdminClient()
  const { data: tramites, error } = await adminClient
    .from('tramites')
    .select('id, reference_code, status, final_price, created_at, updated_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/tramites] fetch error:', error.message)
  }

  // Debug: log status distribution in terminal
  if (tramites?.length) {
    const byStatus = tramites.reduce<Record<string, number>>((acc, t) => {
      acc[t.status ?? 'null'] = (acc[t.status ?? 'null'] ?? 0) + 1
      return acc
    }, {})
    console.log('[admin/tramites] fetched', tramites.length, 'tramites, by status:', byStatus)
  } else {
    console.log('[admin/tramites] 0 tramites. Error:', error?.message ?? 'none')
  }

  return (
    <TramitesClient
      initialTramites={(tramites ?? []) as any}
      initialStatus={searchParams.status ?? 'all'}
    />
  )
}
