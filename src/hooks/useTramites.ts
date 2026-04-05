'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tramite, TramiteStatus, TramiteStatusHistory } from '@/types/database'

export function useTramites(filters?: { status?: TramiteStatus; limit?: number }) {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTramites = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tramites')
      .select('*, tramite_types(*)')
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.limit) query = query.limit(filters.limit)

    const { data } = await query
    setTramites((data as Tramite[]) ?? [])
    setLoading(false)
  }, [filters?.status, filters?.limit])

  useEffect(() => { fetchTramites() }, [fetchTramites])

  return { tramites, loading, refresh: fetchTramites }
}

export function useTramite(id: string) {
  const [tramite, setTramite] = useState<Tramite | null>(null)
  const [history, setHistory] = useState<TramiteStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTramite = useCallback(async () => {
    const [{ data: tramiteData }, { data: historyData }] = await Promise.all([
      supabase.from('tramites').select('*, tramite_types(*)').eq('id', id).single(),
      supabase.from('tramite_status_history').select('*').eq('tramite_id', id).order('created_at'),
    ])
    setTramite(tramiteData as unknown as Tramite | null)
    setHistory((historyData ?? []) as TramiteStatusHistory[])
    setLoading(false)
  }, [id])

  useEffect(() => { fetchTramite() }, [fetchTramite])

  return { tramite, history, loading, refresh: fetchTramite }
}
