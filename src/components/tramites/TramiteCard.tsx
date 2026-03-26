import Link from 'next/link'
import { ArrowRight, MapPin, Users } from 'lucide-react'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import type { Tramite } from '@/types/database'

interface TramiteCardProps {
  tramite: Tramite
}

export default function TramiteCard({ tramite }: TramiteCardProps) {
  const partyNames = tramite.parties?.slice(0, 2).map(p => p.name).join(', ')

  return (
    <Link
      href={`/tramites/${tramite.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <code className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {tramite.reference_code}
          </code>
          <h3 className="font-semibold text-slate-900 mt-1 text-sm">
            {tramite.tramite_types?.display_name ?? 'Trámite notarial'}
          </h3>
        </div>
        <StatusBadge status={tramite.status} size="sm" />
      </div>

      {partyNames && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <Users size={12} />
          <span className="truncate">{partyNames}</span>
        </div>
      )}

      {tramite.property_district && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin size={12} />
          <span>{tramite.property_district}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 tabular-nums">
          {formatPrice(tramite.final_price)}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{formatDate(tramite.created_at)}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
