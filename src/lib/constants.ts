import type { TramiteStatus, BrokerTier } from '@/types/database'

export const TRAMITE_STATUS_CONFIG: Record<
  TramiteStatus,
  { label: string; bg: string; text: string; border: string; step: number }
> = {
  cotizado:              { label: 'Cotizado',          bg: 'bg-blue-100',    text: 'text-blue-900',    border: 'border-blue-300',   step: 1 },
  solicitado:            { label: 'Solicitado',         bg: 'bg-purple-100',  text: 'text-purple-900',  border: 'border-purple-300', step: 2 },
  documentos_pendientes: { label: 'Docs. Pendientes',   bg: 'bg-amber-100',   text: 'text-amber-900',   border: 'border-amber-400',  step: 3 },
  en_revision:           { label: 'En Revisión',        bg: 'bg-orange-100',  text: 'text-orange-900',  border: 'border-orange-400', step: 4 },
  en_firma:              { label: 'En Firma',           bg: 'bg-sky-100',     text: 'text-sky-900',     border: 'border-sky-400',    step: 5 },
  en_registro:           { label: 'En Registro',        bg: 'bg-green-100',   text: 'text-green-900',   border: 'border-green-400',  step: 6 },
  completado:            { label: 'Completado',         bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400', step: 7 },
  cancelado:             { label: 'Cancelado',          bg: 'bg-red-100',     text: 'text-red-900',     border: 'border-red-300',    step: -1 },
}

export const TRAMITE_STATUS_ORDER: TramiteStatus[] = [
  'cotizado', 'solicitado', 'documentos_pendientes',
  'en_revision', 'en_firma', 'en_registro', 'completado',
]

export const TIER_CONFIG: Record<
  BrokerTier,
  { label: string; minTramites: number; maxTramites: number; discount: number; color: string; bg: string; icon: string }
> = {
  bronce: { label: 'Bronce', minTramites: 0, maxTramites: 3, discount: 0, color: 'text-orange-700', bg: 'bg-orange-50',  icon: '🥉' },
  plata:  { label: 'Plata',  minTramites: 4, maxTramites: 7, discount: 0, color: 'text-gray-600',   bg: 'bg-gray-100',   icon: '🥈' },
  oro:    { label: 'Oro',    minTramites: 8, maxTramites: Infinity, discount: 0, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🥇' },
}

export const DOCUMENT_STATUS_CONFIG = {
  pending:  { label: 'Pendiente',  icon: 'clock',  color: 'text-gray-500' },
  uploaded: { label: 'Subido',     icon: 'upload', color: 'text-amber-600' },
  approved: { label: 'Aprobado',   icon: 'check',  color: 'text-green-600' },
  rejected: { label: 'Rechazado',  icon: 'x',      color: 'text-red-600' },
}

export const PERU_DISTRICTS = [
  'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja',
  'Barranco', 'Chorrillos', 'Magdalena', 'Pueblo Libre', 'Jesús María',
  'Lince', 'San Miguel', 'Breña', 'Rímac', 'Lima', 'Cercado de Lima',
  'Los Olivos', 'San Martín de Porres', 'Independencia', 'Comas',
  'Carabayllo', 'Puente Piedra', 'Ate', 'Santa Anita', 'El Agustino',
  'San Juan de Lurigancho', 'La Victoria', 'Surquillo', 'San Juan de Miraflores',
  'Villa María del Triunfo', 'Villa El Salvador', 'Lurín', 'Pachacámac',
  'Callao', 'Bellavista', 'La Perla', 'La Punta', 'Carmen de la Legua',
]

export const PARTY_ROLES = [
  { value: 'comprador', label: 'Comprador' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'otro', label: 'Otro' },
]
