'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Broker } from '@/types/database'

export function useBrokerProfile() {
  const [broker, setBroker] = useState<Broker | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('brokers')
        .select('*')
        .eq('id', user.id)
        .single()

      setBroker(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('brokers').select('*').eq('id', user.id).single()
    setBroker(data)
  }

  return { broker, loading, refresh }
}
