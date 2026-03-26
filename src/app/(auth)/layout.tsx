import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: broker } = await supabase
    .from('brokers')
    .select('*')
    .eq('id', user.id)
    .single()

  return <AppShell broker={broker}>{children}</AppShell>
}
