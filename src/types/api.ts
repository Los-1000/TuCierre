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
