import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getTramites } from '@/lib/server-api'
import TramitesClient from './TramitesClient'

export const metadata = { title: 'Mis Trámites · TuCierre' }

export default async function TramitesPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  const result = await getTramites(accessToken, { size: 20 })
  return <TramitesClient initialTramites={result?.content ?? []} />
}
