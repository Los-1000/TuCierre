'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, TramiteStatus } from '@/types/database'

export function useTramiteStatusRealtime(
  tramiteId: string,
  onStatusChange: (status: TramiteStatus) => void
) {
  const supabase = createClient()

  useEffect(() => {
    if (!tramiteId) return
    const channel = supabase
      .channel(`tramite-status-${tramiteId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'tramites',
        filter: `id=eq.${tramiteId}`,
      }, (payload) => {
        onStatusChange((payload.new as any).status)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tramiteId])
}

export function useChatRealtime(
  tramiteId: string,
  onNewMessage: (message: Message) => void
) {
  const supabase = createClient()

  useEffect(() => {
    if (!tramiteId) return
    const channel = supabase
      .channel(`chat-${tramiteId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `tramite_id=eq.${tramiteId}`,
      }, (payload) => {
        onNewMessage(payload.new as Message)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tramiteId])
}
