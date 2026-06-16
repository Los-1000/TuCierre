import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getMe } from '@/lib/server-api'
import PerfilClient from './PerfilClient'

export const metadata = { title: 'Mi perfil · TuCierre' }

export default async function PerfilPage() {
  // The app authenticates via the `access_token` cookie (REST + demo mock), not
  // a Supabase session — gate on the real system so the page doesn't bounce to
  // /login. See [[dual-auth-supabase-conflict]].
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  const broker = await getMe(accessToken)
  if (!broker) redirect('/login')

  return <PerfilClient />
}
