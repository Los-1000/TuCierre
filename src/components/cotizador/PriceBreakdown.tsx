import { formatPrice } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { BrokerTier } from '@/types/database'

interface PriceBreakdownProps {
  basePrice: number
  tier: BrokerTier
  propertyValue?: number
}

function calculateFinalPrice(basePrice: number, tier: BrokerTier): { quoted: number; discount: number; final: number } {
  const tierConfig = TIER_CONFIG[tier]
  const discount = (basePrice * tierConfig.discount) / 100
  return { quoted: basePrice, discount, final: basePrice - discount }
}

export default function PriceBreakdown({ basePrice, tier, propertyValue }: PriceBreakdownProps) {
  const { quoted, discount, final } = calculateFinalPrice(basePrice, tier)
  const tierConfig = TIER_CONFIG[tier]

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900 mb-4">Resumen de precio</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-600">Precio base</span>
          <span className="text-sm font-medium tabular-nums">{formatPrice(quoted)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-600">
              Descuento {tierConfig.label} ({tierConfig.discount}%)
            </span>
            <span className="text-sm font-medium text-brand-green tabular-nums">
              - {formatPrice(discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-slate-300 pt-3 mt-1">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-2xl font-bold text-brand-green tabular-nums">
            {formatPrice(final)}
          </span>
        </div>
      </div>
      {tierConfig.discount === 0 && (
        <p className="text-xs text-slate-500 mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          💡 Completa 4+ trámites este mes para obtener 5% de descuento en nivel Plata.
        </p>
      )}
    </div>
  )
}

export { calculateFinalPrice }
