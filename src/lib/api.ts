import type { ApiBroker, ApiTramiteListItem, ApiTramiteDetail, ApiDashboardStats, ApiMessage, ApiPage } from '@/types/api'

function isMockMode() {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('mock-demo-token')
}

async function mockApiFetch(path: string, options?: RequestInit): Promise<any> {
  const { getTramites, getTramiteById, getDashboardStats, getMe, MOCK_TOKEN } = await import('./server-api')
  const method = options?.method?.toUpperCase() ?? 'GET'

  if (path.startsWith('/api/tramites') && method === 'GET') {
    const url = new URL(path, 'http://localhost')
    const id = path.match(/\/api\/tramites\/(\d+)(?:\/|$)/)?.[1]
    if (id) return getTramiteById(MOCK_TOKEN, id)
    return getTramites(MOCK_TOKEN, {
      status: url.searchParams.get('status') ?? undefined,
      size: Number(url.searchParams.get('size') ?? 20),
    })
  }
  if (path === '/api/tramites' && method === 'POST') {
    const { MOCK_TRAMITE_DETAIL } = await import('./server-api')
    return { ...MOCK_TRAMITE_DETAIL, id: 99 }
  }
  if (path === '/api/dashboard/stats') return getDashboardStats(MOCK_TOKEN)
  if (path === '/api/brokers/me') return getMe(MOCK_TOKEN)
  if (path.includes('/messages') && method === 'POST') {
    return { id: Date.now(), tramiteId: 0, senderId: 2, senderName: 'Tú', content: JSON.parse(options?.body as string).content, createdAt: new Date().toISOString() }
  }
  if (path.includes('/messages')) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true }
  return null
}

async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  if (isMockMode()) return mockApiFetch(path, options)

  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  if (res.status === 204) return null

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }): Promise<ApiBroker> =>
      apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    signup: (data: {
      fullName: string; email: string; password: string;
      cellphone?: string; typeIdDocument?: boolean; idDocumentNumber?: string; referralCode?: string
    }): Promise<ApiBroker> =>
      apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    logout: (): Promise<void> => apiFetch('/auth/logout', { method: 'POST' }),
    refresh: (): Promise<void> => apiFetch('/auth/refresh', { method: 'POST' }),
  },
  brokers: {
    me: (): Promise<ApiBroker> => apiFetch('/api/brokers/me'),
    getById: (id: number): Promise<ApiBroker> => apiFetch(`/api/brokers/${id}`),
    notaries: (): Promise<ApiBroker[]> => apiFetch('/api/brokers/notaries'),
  },
  tramites: {
    list: (params?: { status?: string; page?: number; size?: number }): Promise<ApiPage<ApiTramiteListItem>> => {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.page !== undefined) qs.set('page', String(params.page))
      if (params?.size !== undefined) qs.set('size', String(params.size))
      return apiFetch(`/api/tramites?${qs}`)
    },
    getById: (id: number): Promise<ApiTramiteDetail> => apiFetch(`/api/tramites/${id}`),
    updateStatus: (id: number, status: string): Promise<ApiTramiteDetail> =>
      apiFetch(`/api/tramites/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    cancel: (id: number): Promise<void> =>
      apiFetch(`/api/tramites/${id}`, { method: 'DELETE' }),
    create: (data: { tramiteType: string; propertyAddress: string; propertyDistrictAddress: string; quotedPriceProperty: number }): Promise<ApiTramiteDetail> =>
      apiFetch('/api/tramites', { method: 'POST', body: JSON.stringify(data) }),
  },
  dashboard: {
    stats: (): Promise<ApiDashboardStats> => apiFetch('/api/dashboard/stats'),
  },
  messages: {
    list: (tramiteId: number, page = 0, size = 50): Promise<ApiPage<ApiMessage>> =>
      apiFetch(`/api/tramites/${tramiteId}/messages?page=${page}&size=${size}`),
    send: (tramiteId: number, content: string): Promise<ApiMessage> =>
      apiFetch(`/api/tramites/${tramiteId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },
  priceMatch: {
    myRequests: (brokerId: number) => apiFetch(`/api/price-match/broker/${brokerId}`),
  },
}
