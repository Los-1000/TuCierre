import type { Currency } from '@/lib/utils'

export type ApiBroker = {
  id: number
  fullName: string
  email: string
  cellphone: string | null
  isAdmin: boolean
  tierName: string
  referralCode: string | null
  createdAt: string
}

export type ApiTramiteStatus =
  | 'SOLICITADO'
  | 'COTIZADO'
  | 'DOCS_PENDIENTES'
  | 'EN_REVISION'
  | 'EN_FIRMA'
  | 'EN_REGISTRO'
  | 'COMPLETADO'
  | 'CANCELADO'

export type ApiTramiteListItem = {
  id: number
  tramiteType: string
  propertyAddress: string | null
  propertyDistrictAddress: string | null
  finalFee: number | null
  currency: Currency
  statusTramite: ApiTramiteStatus
  createdAt: string
}

export type ApiParty = {
  fullName: string
  typeIdDocument: boolean
  idDocumentNumber: string
  role: string
  idDocumentFileCopy: string | null
}

export type ApiTramiteDocStatus = 'pending' | 'uploaded' | 'approved' | 'rejected'

export type ApiRequiredDocument = {
  name: string
  description?: string
}

export type ApiUploadedDocument = {
  name: string
  url?: string | null
  uploaded_at?: string | null
  status: ApiTramiteDocStatus
  rejection_note?: string
}

export type ApiTramiteDetail = {
  id?: number
  statusTramite: ApiTramiteStatus
  idNotary: number
  brokerIdDocumentNumber: string
  tramiteType: string
  propertyAddress: string | null
  propertyDistrictAddress: string | null
  quotedPriceProperty: number | null
  baseFee: number | null
  additionalFee: number | null
  finalFee: number | null
  currency: Currency
  createdAt: string
  parties: ApiParty[]
  // Documentos requeridos del tipo de trámite y los que el broker ya subió.
  // El backend los devuelve; en modo mock se simulan.
  requiredDocuments?: ApiRequiredDocument[]
  documents?: ApiUploadedDocument[]
}

export type ApiDashboardStats = {
  activeCount: number
  completedThisMonth: number
  totalValuePEN: number
  totalValueUSD: number
  totalSavings: number
  commissionEarnedPEN: number
  commissionEarnedUSD: number
  tramitesThisMonth: number
}

export type ApiMessage = {
  id: number
  tramiteId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
}

export type ApiPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
