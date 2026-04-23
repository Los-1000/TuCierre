'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Search, Loader2, Users, Gift, TrendingUp } from 'lucide-react'
import type { Broker } from '@/types/database'

interface BrokerWithReferrals extends Broker {
  referral_count: number
  referrer_name: string | null
}

export default function AdminReferidosPage() {
  const supabase = useMemo(() => createClient(), [])

  const [brokers, setBrokers] = useState<BrokerWithReferrals[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)

    const { data: allBrokers } = await supabase
      .from('brokers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!allBrokers) { setLoading(false); return }

    const brokerMap = new Map<string, string>()
    for (const b of allBrokers) brokerMap.set(b.id, b.full_name)

    const referralCounts = new Map<string, number>()
    for (const b of allBrokers) {
      if (b.referred_by) {
        referralCounts.set(b.referred_by, (referralCounts.get(b.referred_by) ?? 0) + 1)
      }
    }

    const enriched: BrokerWithReferrals[] = allBrokers.map((b) => ({
      ...b,
      referral_count: referralCounts.get(b.id) ?? 0,
      referrer_name: b.referred_by ? (brokerMap.get(b.referred_by) ?? null) : null,
    }))

    setBrokers(enriched)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = brokers.filter((b) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.full_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.referral_code ?? '').toLowerCase().includes(q)
    )
  })

  const totalReferrals = brokers.filter((b) => b.referred_by).length
  const topReferrers = brokers.filter((b) => b.referral_count > 0).length
  const totalBonuses = brokers.reduce((sum, b) => sum + b.referral_count * 50, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#18181B]">Referidos</h1>
        <span className="text-xl font-medium text-[#18181B]/30">
          {loading ? '…' : `${brokers.length} brokers`}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <div className="w-10 h-10 rounded-xl bg-[#2855E0]/10 flex items-center justify-center mb-4">
            <Users size={20} className="text-[#2855E0]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">Brokers referidos</p>
          <p className="text-2xl font-black text-[#18181B]">{loading ? '—' : totalReferrals}</p>
          <p className="text-xs text-[#18181B]/50 mt-1">Con código de referido aplicado</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <div className="w-10 h-10 rounded-xl bg-[#020952]/10 flex items-center justify-center mb-4">
            <TrendingUp size={20} className="text-[#020952]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">Referidores activos</p>
          <p className="text-2xl font-black text-[#18181B]">{loading ? '—' : topReferrers}</p>
          <p className="text-xs text-[#18181B]/50 mt-1">Brokers que han referido al menos 1</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
          <div className="w-10 h-10 rounded-xl bg-[#6B7A9A]/10 flex items-center justify-center mb-4">
            <Gift size={20} className="text-[#6B7A9A]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60 mb-1">Bonos generados</p>
          <p className="text-2xl font-black text-[#18181B]">
            {loading ? '—' : `S/. ${totalBonuses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-[#18181B]/50 mt-1">S/. 50 por referido registrado</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#18181B]/40" />
        <input
          type="text"
          placeholder="Buscar broker o código..."
          aria-label="Buscar broker o código"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#18181B]/15 rounded-2xl h-10 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 bg-white text-[#18181B] placeholder:text-[#18181B]/40"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-[#18181B]/60">Broker</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#18181B]/60">Código</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#18181B]/60 text-center">Referidos</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#18181B]/60">Referido por</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-[#18181B]/60">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18181B]/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#18181B]/40">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Cargando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#18181B]/40 text-sm">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-semibold text-[#18181B]">{b.full_name}</p>
                    <p className="text-xs text-[#18181B]/50">{b.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    {b.referral_code ? (
                      <code className="text-xs font-mono font-semibold bg-[#18181B]/5 px-2 py-0.5 rounded text-[#18181B] tracking-wider">
                        {b.referral_code}
                      </code>
                    ) : (
                      <span className="text-[#18181B]/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {b.referral_count > 0 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2855E0]/10 text-[#2855E0] text-xs font-bold">
                        {b.referral_count}
                      </span>
                    ) : (
                      <span className="text-[#18181B]/40 text-xs">0</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {b.referrer_name ? (
                      <span className="text-sm text-[#18181B]/80">{b.referrer_name}</span>
                    ) : (
                      <span className="text-[#18181B]/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-sm text-[#18181B]/50">{formatDate(b.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
