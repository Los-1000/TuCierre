import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import CotizarClient from './CotizarClient'

export const metadata = { title: 'Cotizar · TuCierre' }

export default async function CotizarPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) redirect('/login')

  return <CotizarClient />
}
