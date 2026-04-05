'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, TramiteStatus } from '@/types/database'

export function useTramiteStatusRealtime(
  tramiteId: string,
  onStatusChange: (status: TramiteStatus) => void
) {
  const supabase = createClient()
  // Keep a stable ref to the latest callback so the subscription
  // never needs to resubscribe when the callback identity changes.
  const callbackRef = useRef(onStatusChange)
  useEffect(() => { callbackRef.current = onStatusChange })

  useEffect(() => {
    if (!tramiteId) return
    const channel = supabase
      .channel(`tramite-status-${tramiteId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'tramites',
        filter: `id=eq.${tramiteId}`,
      }, (payload) => {
        callbackRef.current((payload.new as any).status)
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
  const callbackRef = useRef(onNewMessage)
  useEffect(() => { callbackRef.current = onNewMessage })

  useEffect(() => {
    if (!tramiteId) return
    const channel = supabase
      .channel(`chat-${tramiteId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `tramite_id=eq.${tramiteId}`,
      }, (payload) => {
        callbackRef.current(payload.new as Message)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tramiteId])
}
