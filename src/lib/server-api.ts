import type { ApiBroker, ApiTramiteListItem, ApiTramiteDetail, ApiDashboardStats, ApiPage } from '@/types/api'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'

export const MOCK_TOKEN = 'mock-demo-token'
export const MOCK_SUPERADMIN_TOKEN = 'mock-superadmin-token'

export const MOCK_SUPERADMIN_STATS = {
  totalBrokers: 47,
  totalNotarias: 8,
  activeTramites: 23,
  incomeThisMonth: 34800,
  pendingCashouts: 3,
  pendingPriceMatch: 2,
  recentTramites: [
    { id: '1', referenceCode: 'TC-2024-001', status: 'EN_FIRMA', finalFee: 1080, updatedAt: '2024-05-20T10:00:00', tramiteType: 'Compraventa', brokerName: 'María Ríos' },
    { id: '2', referenceCode: 'TC-2024-002', status: 'EN_REVISION', finalFee: 810, updatedAt: '2024-05-19T15:00:00', tramiteType: 'Hipoteca', brokerName: 'Juan Paredes' },
    { id: '3', referenceCode: 'TC-2024-003', status: 'COMPLETADO', finalFee: 630, updatedAt: '2024-05-18T09:00:00', tramiteType: 'Donación', brokerName: 'Ana Castro' },
    { id: '4', referenceCode: 'TC-2024-004', status: 'SOLICITADO', finalFee: 1260, updatedAt: '2024-05-17T14:00:00', tramiteType: 'Compraventa', brokerName: 'Luis Vega' },
    { id: '5', referenceCode: 'TC-2024-005', status: 'EN_REGISTRO', finalFee: 1620, updatedAt: '2024-05-16T11:00:00', tramiteType: 'Compraventa', brokerName: 'Carmen Díaz' },
  ],
}

export function isSuperAdminMock(token: string) { return token === MOCK_SUPERADMIN_TOKEN }

const MOCK_BROKER: ApiBroker = {
  id: 1, fullName: 'María Ríos', email: 'admin@gmail.com',
  cellphone: '987654321', isAdmin: false, tierName: 'Plata',
  referralCode: 'MARIA001', createdAt: '2024-01-15T10:00:00',
}

const MOCK_TRAMITES: ApiTramiteListItem[] = [
  { id: 1, tramiteType: 'COMPRAVENTA', propertyAddress: 'Av. Larco 1234', propertyDistrictAddress: 'Miraflores', finalFee: 1200, currency: 'USD', statusTramite: 'EN_FIRMA', createdAt: '2024-05-20T09:00:00' },
  { id: 2, tramiteType: 'HIPOTECA', propertyAddress: 'Calle Los Pinos 56', propertyDistrictAddress: 'San Isidro', finalFee: 900, currency: 'PEN', statusTramite: 'EN_REVISION', createdAt: '2024-05-18T10:00:00' },
  { id: 3, tramiteType: 'DONACION', propertyAddress: 'Jr. Cusco 890', propertyDistrictAddress: 'San Borja', finalFee: 700, currency: 'PEN', statusTramite: 'COTIZADO', createdAt: '2024-05-15T11:00:00' },
  { id: 4, tramiteType: 'SUCESION', propertyAddress: 'Av. Brasil 320', propertyDistrictAddress: 'Pueblo Libre', finalFee: 950, currency: 'PEN', statusTramite: 'COMPLETADO', createdAt: '2024-05-10T09:00:00' },
  { id: 5, tramiteType: 'COMPRAVENTA', propertyAddress: 'Calle Las Flores 77', propertyDistrictAddress: 'La Molina', finalFee: 1800, currency: 'USD', statusTramite: 'SOLICITADO', createdAt: '2024-05-22T14:00:00' },
  { id: 6, tramiteType: 'HIPOTECA', propertyAddress: 'Av. Javier Prado 450', propertyDistrictAddress: 'San Borja', finalFee: 1400, currency: 'PEN', statusTramite: 'EN_REGISTRO', createdAt: '2024-05-12T08:00:00' },
  { id: 7, tramiteType: 'COMPRAVENTA', propertyAddress: 'Calle Schell 200', propertyDistrictAddress: 'Miraflores', finalFee: 2500, currency: 'USD', statusTramite: 'COMPLETADO', createdAt: '2024-04-30T09:00:00' },
  { id: 8, tramiteType: 'DONACION', propertyAddress: 'Av. Arequipa 1500', propertyDistrictAddress: 'Lince', finalFee: 700, currency: 'PEN', statusTramite: 'CANCELADO', createdAt: '2024-05-05T16:00:00' },
]

const MOCK_STATS: ApiDashboardStats = {
  activeCount: 5, completedThisMonth: 3,
  totalValuePEN: 124000, totalValueUSD: 32000,
  totalSavings: 2480,
  commissionEarnedPEN: 1240, commissionEarnedUSD: 320,
  tramitesThisMonth: 5,
}

export const MOCK_TRAMITE_DETAIL: ApiTramiteDetail = {
  id: 1, tramiteType: 'COMPRAVENTA',
  propertyAddress: 'Av. Larco 1234', propertyDistrictAddress: 'Miraflores',
  quotedPriceProperty: 250000, baseFee: 1200, additionalFee: 0, finalFee: 1080,
  currency: 'USD',
  statusTramite: 'EN_FIRMA', createdAt: '2024-05-20T09:00:00',
  idNotary: 1, brokerIdDocumentNumber: '12345678',
  parties: [
    { fullName: 'Carlos Mendoza', role: 'COMPRADOR', idDocumentNumber: '45678901', typeIdDocument: false, idDocumentFileCopy: null },
    { fullName: 'Ana Torres', role: 'VENDEDOR', idDocumentNumber: '32156789', typeIdDocument: false, idDocumentFileCopy: null },
  ],
  requiredDocuments: [
    { name: 'Foto del DNI', description: 'Foto legible del DNI vigente de las partes' },
    { name: 'HR', description: 'Hoja de Resumen (HR) vigente del predio' },
    { name: 'PU', description: 'Predio Urbano (PU) vigente del predio' },
    { name: 'Copia Literal', description: 'Copia literal de la partida registral del inmueble' },
    { name: 'Constancia de no adeudo', description: 'Constancia de no adeudo de tributos municipales' },
    { name: 'Poder del apoderado', description: 'Poder vigente que acredita al apoderado' },
  ],
  documents: [
    { name: 'HR', url: '#', uploaded_at: '2024-05-19T16:00:00', status: 'approved' },
    { name: 'PU', url: '#', uploaded_at: '2024-05-20T09:30:00', status: 'pending' },
    { name: 'Copia Literal', url: '#', uploaded_at: '2024-05-18T11:00:00', status: 'rejected', rejection_note: 'La copia literal está vencida. Adjunta una con antigüedad menor a 30 días.' },
  ],
}

function isMock(token: string) { return token === MOCK_TOKEN }

async function serverFetch(path: string, accessToken: string): Promise<any> {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `access_token=${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  if (res.status === 204) return null

  return res.json()
}

export async function getMe(accessToken: string): Promise<ApiBroker | null> {
  if (isMock(accessToken)) return MOCK_BROKER
  return serverFetch('/api/brokers/me', accessToken)
}

export async function getDashboardStats(accessToken: string): Promise<ApiDashboardStats | null> {
  if (isMock(accessToken)) return MOCK_STATS
  return serverFetch('/api/dashboard/stats', accessToken)
}

export async function getTramites(
  accessToken: string,
  params?: { status?: string; page?: number; size?: number }
): Promise<ApiPage<ApiTramiteListItem> | null> {
  if (isMock(accessToken)) {
    const filtered = params?.status
      ? MOCK_TRAMITES.filter(t => t.statusTramite === params.status)
      : MOCK_TRAMITES
    const sliced = filtered.slice(0, params?.size ?? 20)
    return { content: sliced, totalElements: filtered.length, totalPages: 1, number: 0, size: sliced.length, first: true, last: true }
  }
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page !== undefined) qs.set('page', String(params.page))
  if (params?.size !== undefined) qs.set('size', String(params.size))
  return serverFetch(`/api/tramites?${qs}`, accessToken)
}

export async function getTramiteById(accessToken: string, id: string): Promise<ApiTramiteDetail | null> {
  if (isMock(accessToken)) return { ...MOCK_TRAMITE_DETAIL, id: Number(id) }
  return serverFetch(`/api/tramites/${id}`, accessToken)
}
