'use client'

import { useEffect, useRef } from 'react'

export function useTramiteStatusRealtime(
  tramiteId: number,
  onStatusChange: (status: string) => void
) {
  const callbackRef = useRef(onStatusChange)
  useEffect(() => { callbackRef.current = onStatusChange })

  useEffect(() => {
    if (!tramiteId) return
    if (typeof document !== 'undefined' && document.cookie.includes('mock-demo-token')) return

    let subscription: { unsubscribe: () => void } | null = null

    import('@/lib/ws').then(({ subscribeToTramiteStatus }) => {
      subscribeToTramiteStatus(tramiteId, (data) => {
        callbackRef.current(data.status)
      }).then((sub) => {
        subscription = sub
      })
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [tramiteId])
}
