import { formatPrice } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { BrokerTier } from '@/types/database'

interface PriceBreakdownProps {
  basePrice: number
  tier: BrokerTier
  propertyValue?: number
  matchedPrice?: number
}

function calculateFinalPrice(basePrice: number, tier: BrokerTier): { quoted: number; discount: number; final: number } {
  const tierConfig = TIER_CONFIG[tier]
  const discount = (basePrice * tierConfig.discount) / 100
  return { quoted: basePrice, discount, final: basePrice - discount }
}

export default function PriceBreakdown({ basePrice, tier, propertyValue, matchedPrice }: PriceBreakdownProps) {
  const { quoted, discount, final } = calculateFinalPrice(basePrice, tier)
  const tierConfig = TIER_CONFIG[tier]

  // Price match approved — show special price, ignore tier discount
  if (matchedPrice !== undefined) {
    return (
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40 mb-5">Resumen de precio</h3>
        <div className="space-y-0">
          <div className="flex justify-between items-center py-3 border-b border-[#18181B]/6">
            <span className="text-sm text-[#18181B]/60">Precio base</span>
            <span className="text-sm font-semibold tabular-nums font-mono text-[#18181B] line-through opacity-40">
              {formatPrice(basePrice)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#18181B]/6">
            <span className="text-sm text-emerald-700 font-medium">Precio especial aprobado</span>
            <span className="text-sm font-semibold text-emerald-600 tabular-nums font-mono">
              {formatPrice(matchedPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="font-bold text-[#18181B]">Total</span>
            <span className="text-2xl font-bold text-[#18181B] tabular-nums font-mono">
              {formatPrice(matchedPrice)}
            </span>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              Precio match activo
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Este precio fue aprobado por el super administrador exclusivamente para ti.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40 mb-5">Resumen de precio</h3>
      <div className="space-y-0">
        <div className="flex justify-between items-center py-3 border-b border-[#18181B]/6">
          <span className="text-sm text-[#18181B]/60">Precio base</span>
          <span className="text-sm font-semibold tabular-nums font-mono text-[#18181B]">{formatPrice(quoted)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center py-3 border-b border-[#18181B]/6">
            <span className="text-sm text-[#18181B]/60">
              Descuento {tierConfig.label} ({tierConfig.discount}%)
            </span>
            <span className="text-sm font-semibold text-emerald-600 tabular-nums font-mono">
              - {formatPrice(discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4">
          <span className="font-bold text-[#18181B]">Total</span>
          <span className="text-2xl font-bold text-[#18181B] tabular-nums font-mono">
            {formatPrice(final)}
          </span>
        </div>

        {/* Commission highlight */}
        {discount > 0 && (
          <div className="mt-4 p-4 bg-[#D47151]/5 rounded-2xl border border-[#D47151]/15 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D47151]">
                Tu Comisión ({tierConfig.discount}%)
              </p>
              <p className="text-lg font-bold text-[#D47151] tabular-nums font-mono">
                {formatPrice(discount)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { calculateFinalPrice }
