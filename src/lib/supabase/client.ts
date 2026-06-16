import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// NEXT_PUBLIC_* vars are inlined into the client bundle, so the real values are
// always present in the browser where this client is actually used (effects and
// event handlers). During SSR — or in the demo flow with no env configured —
// fall back to harmless placeholders so constructing the client never throws
// "URL and API key are required" and crashes the render.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
