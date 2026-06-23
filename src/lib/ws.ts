'use client'

import type { Client, StompSubscription } from '@stomp/stompjs'

let stompClient: Client | null = null
let connectPromise: Promise<void> | null = null

function getClient(): Promise<Client> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('WebSocket not available server-side'))
  }

  if (!stompClient) {
    // Lazy import to avoid SSR issues
    return import('@stomp/stompjs').then(({ Client }) =>
      import('sockjs-client').then(({ default: SockJS }) => {
        stompClient = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          reconnectDelay: 5000,
        })
        return stompClient
      })
    )
  }

  return Promise.resolve(stompClient)
}

export async function connectStomp(): Promise<void> {
  if (connectPromise) return connectPromise

  connectPromise = getClient().then(
    (client) =>
      new Promise<void>((resolve, reject) => {
        if (client.connected) { resolve(); return }
        client.onConnect = () => resolve()
        client.onStompError = (frame) => {
          connectPromise = null
          reject(new Error(frame.headers.message))
        }
        if (!client.active) client.activate()
      })
  )

  return connectPromise
}

export async function subscribeToTramiteStatus(
  tramiteId: number,
  callback: (data: { tramiteId: number; status: string }) => void
): Promise<StompSubscription> {
  await connectStomp()
  const client = await getClient()
  return client.subscribe(`/topic/tramite/${tramiteId}/status`, (msg) => {
    callback(JSON.parse(msg.body))
  })
}

export function disconnectStomp(): void {
  if (stompClient?.active) {
    stompClient.deactivate()
    stompClient = null
    connectPromise = null
  }
}
