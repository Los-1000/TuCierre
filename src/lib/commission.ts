export interface MonthlyCommissionResult {
  count: number
  rate: number
  amount: number
  tier: 1 | 2 | 3
}

/**
 * Calculate commission for a broker in a given month.
 * @param tramites Array of { final_price: number } for completed tramites in that month
 *                 with commission_cashout_id IS NULL.
 * @returns Commission result. When count === 0, amount is always 0; callers should
 *          check count before displaying tier information to avoid misleading UI.
 */
export function calculateMonthlyCommission(
  tramites: { final_price: number }[]
): MonthlyCommissionResult {
  const count = tramites.length

  // No activity this month — amount is always 0, tier is 1 (lowest)
  if (count === 0) {
    return { count: 0, rate: 0.03, amount: 0, tier: 1 }
  }

  let rate: number
  let tier: 1 | 2 | 3

  if (count <= 3) {
    rate = 0.03
    tier = 1
  } else if (count <= 7) {
    rate = 0.05
    tier = 2
  } else {
    rate = 0.08
    tier = 3
  }

  const total = tramites.reduce((sum, t) => sum + t.final_price, 0)
  const amount = Math.round(total * rate * 100) / 100

  return { count, rate, amount, tier }
}

export const COMMISSION_TIER_CONFIG: Record<1 | 2 | 3, {
  label: string
  icon: string
  minClients: number
  maxClients: number | null
  ratePercent: number
}> = {
  1: { label: 'Nivel 1', icon: '🥉', minClients: 1,  maxClients: 3,    ratePercent: 3 },
  2: { label: 'Nivel 2', icon: '🥈', minClients: 4,  maxClients: 7,    ratePercent: 5 },
  3: { label: 'Nivel 3', icon: '🥇', minClients: 8,  maxClients: null, ratePercent: 8 },
}
