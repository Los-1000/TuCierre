'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type { ApiTramiteListItem, ApiTramiteDetail } from '@/types/api'

export function useTramites(filters?: { status?: string; page?: number; size?: number }) {
  const [tramites, setTramites] = useState<ApiTramiteListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTramites = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.tramites.list(filters)
      setTramites(result?.content ?? [])
    } catch {
      setTramites([])
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.page, filters?.size])

  useEffect(() => { fetchTramites() }, [fetchTramites])

  return { tramites, loading, refresh: fetchTramites }
}

export function useTramite(id: number) {
  const [tramite, setTramite] = useState<ApiTramiteDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTramite = useCallback(async () => {
    try {
      const data = await api.tramites.getById(id)
      setTramite(data)
    } catch {
      setTramite(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchTramite() }, [fetchTramite])

  return { tramite, loading, refresh: fetchTramite }
}
