import { createClient } from '@/lib/supabase/server'

type AuthResult = { error: string } | { userId: string }

export async function verifyAdmin(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data } = await supabase
    .from('brokers')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const broker = data as { is_admin: boolean } | null
  if (!broker?.is_admin) return { error: 'Sin permisos' }

  return { userId: user.id }
}

export async function verifySuperAdmin(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data } = await supabase
    .from('brokers')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  const broker = data as { is_superadmin: boolean } | null
  if (!broker?.is_superadmin) return { error: 'Sin permisos' }

  return { userId: user.id }
}
