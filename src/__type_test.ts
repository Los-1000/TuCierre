import { createBrowserClient } from "@supabase/ssr"
import type { Database, Broker } from "@/types/database"

const supabase = createBrowserClient<Database>("url", "key")

async function test() {
  // Test simple select
  const r1 = await supabase.from('brokers').select('*').eq('id', '1').single()
  // Hover over r1.data to see the type
  const d: typeof r1.data = null
  
  // Test insert
  const r2 = supabase.from('tramites').insert
  type InsertType = Parameters<typeof r2>[0]
  const t: InsertType = undefined as any
}
