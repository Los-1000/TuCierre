import { createAdminClient } from '@/lib/supabase/admin'
import PriceMatchClient from './PriceMatchClient'
import type { PriceMatchStatus } from '@/types/database'

export interface PriceMatchRow {
  id: string
  competitor_name: string
  competitor_price: number
  our_matched_price: number | null
  evidence_url: string | null
  status: PriceMatchStatus
  created_at: string
  reviewed_at: string | null
  brokers: { full_name: string; email: string } | null
  tramite_types: { display_name: string } | null
}

export default async function SuperAdminPriceMatchPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('price_match_requests')
    .select('*, brokers!broker_id(full_name, email), tramite_types(display_name)')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as PriceMatchRow[]

  return <PriceMatchClient initialRequests={requests} />
}
