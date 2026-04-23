import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PerfilClient from './PerfilClient'

export const metadata = { title: 'Mi perfil · TuCierre' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <PerfilClient />
}
