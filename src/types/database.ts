export type TramiteStatus =
  | 'cotizado'
  | 'solicitado'
  | 'documentos_pendientes'
  | 'en_revision'
  | 'en_firma'
  | 'en_registro'
  | 'completado'
  | 'cancelado'

export type BrokerTier = 'bronce' | 'plata' | 'oro'
export type SenderType = 'broker' | 'notaria'
export type RewardType = 'volume_discount' | 'referral_bonus' | 'price_match'
export type PriceMatchStatus = 'pending' | 'approved' | 'rejected'
export type DocumentStatus = 'pending' | 'uploaded' | 'approved' | 'rejected'
export type PartyRole = 'comprador' | 'vendedor' | 'otro'
export type CashoutMethod = 'bank_transfer' | 'yape' | 'plin' | 'otros'
export type CashoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface BankTransferDetails {
  banco: string
  cci: string
  titular: string
  tipo_cuenta: 'ahorros' | 'corriente'
}

export interface WalletDetails {
  titular: string
  telefono: string
}

export interface CashoutRequest {
  id: string
  broker_id: string
  amount: number
  method: CashoutMethod
  payment_details: BankTransferDetails | WalletDetails
  status: CashoutStatus
  admin_notes: string | null
  created_at: string
  processed_at: string | null
}

export interface Broker {
  id: string
  email: string
  full_name: string
  phone: string
  company_name: string | null
  dni: string
  tier: BrokerTier
  total_tramites: number
  total_tramites_month: number
  referral_code: string | null
  referred_by: string | null
  is_admin: boolean
  is_superadmin: boolean
  notaria_name: string | null
  notaria_address: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TramiteType {
  id: string
  name: string
  display_name: string
  description: string | null
  base_price: number
  estimated_days: number
  required_documents: RequiredDocument[]
  is_active: boolean
  created_at: string
}

export interface RequiredDocument {
  name: string
  description: string
}

export interface TramiteParty {
  name: string
  dni: string
  role: PartyRole
  email: string
  phone: string
}

export interface TramiteDocument {
  name: string
  url: string | null
  uploaded_at: string | null
  status: DocumentStatus
  rejection_note?: string
}

export interface Tramite {
  id: string
  broker_id: string
  notaria_id: string | null
  tramite_type_id: string
  reference_code: string
  status: TramiteStatus
  property_address: string | null
  property_district: string | null
  property_value: number | null
  parties: TramiteParty[]
  quoted_price: number
  discount_applied: number
  final_price: number
  price_matched: boolean
  price_match_reference: string | null
  documents: TramiteDocument[]
  notes: string | null
  estimated_completion: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  tramite_types?: TramiteType
}

export interface TramiteStatusHistory {
  id: string
  tramite_id: string
  status: TramiteStatus
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface MessageAttachment {
  name: string
  url: string
  type: string
}

export interface Message {
  id: string
  tramite_id: string
  sender_type: SenderType
  sender_id: string | null
  content: string
  attachments: MessageAttachment[]
  read_at: string | null
  created_at: string
}

export interface Reward {
  id: string
  broker_id: string
  type: RewardType
  description: string
  amount: number
  tramite_id: string | null
  applied: boolean
  created_at: string
}

export interface PriceMatchRequest {
  id: string
  broker_id: string
  tramite_type_id: string
  competitor_name: string
  competitor_price: number
  evidence_url: string | null
  status: PriceMatchStatus
  our_matched_price: number | null
  reviewed_at: string | null
  created_at: string
  tramite_types?: TramiteType
}

export interface Database {
  public: {
    Tables: {
      brokers: { Row: Broker; Insert: Omit<Broker, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Broker, 'id'>> }
      tramite_types: { Row: TramiteType; Insert: Omit<TramiteType, 'id' | 'created_at'>; Update: Partial<Omit<TramiteType, 'id'>> }
      tramites: { Row: Tramite; Insert: Omit<Tramite, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Tramite, 'id'>> }
      tramite_status_history: { Row: TramiteStatusHistory; Insert: Omit<TramiteStatusHistory, 'id' | 'created_at'>; Update: never }
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at'>; Update: Partial<Pick<Message, 'read_at'>> }
      rewards: { Row: Reward; Insert: Omit<Reward, 'id' | 'created_at'>; Update: Partial<Omit<Reward, 'id'>> }
      price_match_requests: { Row: PriceMatchRequest; Insert: Omit<PriceMatchRequest, 'id' | 'created_at'>; Update: Partial<Omit<PriceMatchRequest, 'id'>> }
      cashout_requests: {
        Row: CashoutRequest
        Insert: Omit<CashoutRequest, 'id' | 'created_at'>
        Update: Partial<Omit<CashoutRequest, 'id' | 'broker_id' | 'created_at'>>
      }
    }
  }
}
