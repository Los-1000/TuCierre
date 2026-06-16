// TuCierre cashback model (flat, no tiers):
//   • 5% cashback on every completed trámite you do.
//   • 1% extra on every completed trámite done by one of your referrals.
export const CASHBACK_RATE = 0.05
export const REFERRAL_RATE = 0.01

export interface MonthlyCommissionResult {
  count: number
  rate: number
  amount: number
  /** Kept for backward compatibility with existing UI. Always 1 — there are no levels. */
  tier: 1 | 2 | 3
}

/**
 * Flat 5% cashback for a broker's completed trámites in a month.
 * @param tramites Array of { final_price } for completed tramites (commission_cashout_id IS NULL).
 */
export function calculateMonthlyCommission(
  tramites: { final_price: number }[]
): MonthlyCommissionResult {
  const count = tramites.length
  const total = tramites.reduce((sum, t) => sum + t.final_price, 0)
  const amount = Math.round(total * CASHBACK_RATE * 100) / 100
  return { count, rate: CASHBACK_RATE, amount, tier: 1 }
}

/**
 * 1% referral cashback on trámites completed by referred brokers.
 * @param tramites Array of { final_price } for completed tramites of your referrals.
 */
export function calculateReferralCashback(
  tramites: { final_price: number }[]
): number {
  const total = tramites.reduce((sum, t) => sum + t.final_price, 0)
  return Math.round(total * REFERRAL_RATE * 100) / 100
}

// Backward-compat shim for screens that still index by the old tier number.
// Collapsed to the single flat cashback rate — no levels.
export const COMMISSION_TIER_CONFIG: Record<1 | 2 | 3, {
  label: string
  icon: string
  minClients: number
  maxClients: number | null
  ratePercent: number
}> = {
  1: { label: 'Cashback', icon: '', minClients: 0, maxClients: null, ratePercent: 5 },
  2: { label: 'Cashback', icon: '', minClients: 0, maxClients: null, ratePercent: 5 },
  3: { label: 'Cashback', icon: '', minClients: 0, maxClients: null, ratePercent: 5 },
}
