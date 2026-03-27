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
export type CashoutType = 'referral_bonus' | 'commission'

export type BankTransferDetails = {
  banco: string
  cci: string
  titular: string
  tipo_cuenta: 'ahorros' | 'corriente'
}

export type WalletDetails = {
  titular: string
  telefono: string
}

export type CashoutRequest = {
  id: string
  broker_id: string
  amount: number
  method: CashoutMethod
  payment_details: BankTransferDetails | WalletDetails
  status: CashoutStatus
  admin_notes: string | null
  created_at: string
  processed_at: string | null
  cashout_type: CashoutType
}

export type Broker = {
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
  bank_cci: string | null
  bank_name: string | null
  bank_titular: string | null
  created_at: string
  updated_at: string
}

export type TramiteType = {
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

export type RequiredDocument = {
  name: string
  description: string
}

export type TramiteParty = {
  name: string
  dni: string
  role: PartyRole
  email: string
  phone: string
}

export type TramiteDocument = {
  name: string
  url: string | null
  uploaded_at: string | null
  status: DocumentStatus
  rejection_note?: string
}

export type Tramite = {
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
  commission_cashout_id: string | null
  created_at: string
  updated_at: string
  tramite_types?: TramiteType
}

export type TramiteStatusHistory = {
  id: string
  tramite_id: string
  status: TramiteStatus
  changed_by: string | null
  notes: string | null
  created_at: string
}

export type MessageAttachment = {
  name: string
  url: string
  type: string
}

export type Message = {
  id: string
  tramite_id: string
  sender_type: SenderType
  sender_id: string | null
  content: string
  attachments: MessageAttachment[]
  read_at: string | null
  created_at: string
}

export type Reward = {
  id: string
  broker_id: string
  type: RewardType
  description: string
  amount: number
  tramite_id: string | null
  applied: boolean
  created_at: string
}

export type PriceMatchRequest = {
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
  tramite_types?: TramiteType | null
}

export type Database = {
  public: {
    Tables: {
      brokers: {
        Row: Broker
        Insert: Omit<Broker, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Broker, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'brokers_referred_by_fkey'
            columns: ['referred_by']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
        ]
      }
      tramite_types: {
        Row: TramiteType
        Insert: Omit<TramiteType, 'id' | 'created_at'>
        Update: Partial<Omit<TramiteType, 'id'>>
        Relationships: []
      }
      tramites: {
        Row: Tramite
        Insert: Omit<Tramite, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tramite, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'tramites_broker_id_fkey'
            columns: ['broker_id']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tramites_notaria_id_fkey'
            columns: ['notaria_id']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tramites_tramite_type_id_fkey'
            columns: ['tramite_type_id']
            isOneToOne: false
            referencedRelation: 'tramite_types'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tramites_commission_cashout_id_fkey'
            columns: ['commission_cashout_id']
            isOneToOne: false
            referencedRelation: 'cashout_requests'
            referencedColumns: ['id']
          },
        ]
      }
      tramite_status_history: {
        Row: TramiteStatusHistory
        Insert: Omit<TramiteStatusHistory, 'id' | 'created_at'>
        Update: never
        Relationships: [
          {
            foreignKeyName: 'tramite_status_history_tramite_id_fkey'
            columns: ['tramite_id']
            isOneToOne: false
            referencedRelation: 'tramites'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Pick<Message, 'read_at'>>
        Relationships: [
          {
            foreignKeyName: 'messages_tramite_id_fkey'
            columns: ['tramite_id']
            isOneToOne: false
            referencedRelation: 'tramites'
            referencedColumns: ['id']
          },
        ]
      }
      rewards: {
        Row: Reward
        Insert: Omit<Reward, 'id' | 'created_at'>
        Update: Partial<Omit<Reward, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'rewards_broker_id_fkey'
            columns: ['broker_id']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
        ]
      }
      price_match_requests: {
        Row: PriceMatchRequest
        Insert: Omit<PriceMatchRequest, 'id' | 'created_at'>
        Update: Partial<Omit<PriceMatchRequest, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'price_match_requests_broker_id_fkey'
            columns: ['broker_id']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'price_match_requests_tramite_type_id_fkey'
            columns: ['tramite_type_id']
            isOneToOne: false
            referencedRelation: 'tramite_types'
            referencedColumns: ['id']
          },
        ]
      }
      cashout_requests: {
        Row: CashoutRequest
        Insert: Omit<CashoutRequest, 'id' | 'created_at'>
        Update: Partial<Omit<CashoutRequest, 'id' | 'broker_id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'cashout_requests_broker_id_fkey'
            columns: ['broker_id']
            isOneToOne: false
            referencedRelation: 'brokers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
