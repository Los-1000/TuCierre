'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { ApiBroker } from '@/types/api'

export function useAuth() {
  const [broker, setBroker] = useState<ApiBroker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.brokers.me()
      .then((b) => setBroker(b))
      .catch(() => setBroker(null))
      .finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    await api.auth.logout().catch(() => {})
    window.location.href = '/login'
  }

  return { broker, loading, signOut }
}
