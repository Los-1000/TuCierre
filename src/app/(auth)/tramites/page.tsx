import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TramitesClient from './TramitesClient'
import type { Tramite } from '@/types/database'

export default async function TramitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('tramites')
    .select('*, tramite_types(*)')
    .eq('broker_id', user.id)
    .order('created_at', { ascending: false })

  return <TramitesClient initialTramites={(data as Tramite[]) ?? []} />
}
