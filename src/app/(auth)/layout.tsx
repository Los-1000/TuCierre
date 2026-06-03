import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AppShell from '@/components/layout/AppShell'
import { getMe } from '@/lib/server-api'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) redirect('/login')

  const broker = await getMe(accessToken)
  if (!broker) redirect('/login')

  return <AppShell broker={broker}>{children}</AppShell>
}
