import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { BrokerTier } from '@/types/database'

interface BrokerRow {
  id: string
  full_name: string
  email: string
  phone: string
  company_name: string | null
  tier: BrokerTier
  total_tramites: number
  total_tramites_month: number
  created_at: string
}

export default async function SuperAdminBrokersPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('brokers')
    .select(
      'id, full_name, email, phone, company_name, tier, total_tramites, total_tramites_month, created_at'
    )
    .eq('is_admin', false)
    .eq('is_superadmin', false)
    .order('created_at', { ascending: false })

  const brokers = (data ?? []) as BrokerRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
        <p className="text-sm text-gray-500 mt-1">
          {brokers.length} broker{brokers.length !== 1 ? 's' : ''} registrado
          {brokers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Broker',
                'Email',
                'Teléfono',
                'Tier',
                'Trámites',
                'Este mes',
                'Registrado',
              ].map(h => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {brokers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No hay brokers registrados
                </td>
              </tr>
            ) : (
              brokers.map(b => {
                const tierConf = TIER_CONFIG[b.tier]
                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{b.full_name}</div>
                      {b.company_name && (
                        <div className="text-xs text-slate-400">{b.company_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.email}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{b.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tierConf.bg} ${tierConf.color}`}
                      >
                        {tierConf.icon} {tierConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {b.total_tramites}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {b.total_tramites_month}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(b.created_at)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
