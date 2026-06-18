import { Check, FileText, Home, Building2, Key, Landmark, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import type { TramiteType } from '@/types/database'

const TRAMITE_ICONS: Record<string, LucideIcon> = {
  compraventa: Home,
  hipoteca: Landmark,
  poder: Key,
  constitucion_empresa: Building2,
  levantamiento_hipoteca: TrendingDown,
  arrendamiento: FileText,
}

interface TramiteTypeCardProps {
  tramiteType: TramiteType
  selected: boolean
  onSelect: (id: string) => void
}

export default function TramiteTypeCard({ tramiteType, selected, onSelect }: TramiteTypeCardProps) {
  const Icon = TRAMITE_ICONS[tramiteType.name] ?? FileText

  return (
    <button
      type="button"
      onClick={() => onSelect(tramiteType.id)}
      role="radio"
      aria-checked={selected}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30',
        selected
          ? 'border-navy-900 bg-navy-900/5 shadow-md'
          : 'border-navy-200 bg-white hover:border-navy-900/40 hover:shadow-sm'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            selected ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600'
          )}
        >
          <Icon size={20} />
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>
      <h3 className={cn('font-semibold text-sm mb-1', selected ? 'text-navy-900' : 'text-navy-900')}>
        {tramiteType.display_name}
      </h3>
      {tramiteType.description && (
        <p className="text-xs text-navy-500 leading-relaxed mb-2 line-clamp-2">
          {tramiteType.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-400">Desde</span>
        <span className={cn('text-sm font-bold tabular-nums', selected ? 'text-brand-green' : 'text-navy-700')}>
          {formatPrice(tramiteType.base_price)}
        </span>
      </div>
      <div className="text-xs text-navy-400 text-right">~{tramiteType.estimated_days} días hábiles</div>
    </button>
  )
}
