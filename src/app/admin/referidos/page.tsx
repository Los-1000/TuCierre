'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Search, Loader2, Users, Gift, TrendingUp } from 'lucide-react'
import type { Broker } from '@/types/database'

interface BrokerWithReferrals extends Broker {
  referral_count: number
  referrer_name: string | null
}

export default function AdminReferidosPage() {
  const supabase = createClient()

  const [brokers, setBrokers] = useState<BrokerWithReferrals[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Fetch all brokers
    const { data: allBrokers } = await supabase
      .from('brokers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!allBrokers) { setLoading(false); return }

    // Build referrer name map: id → full_name
    const brokerMap = new Map<string, string>()
    for (const b of allBrokers) brokerMap.set(b.id, b.full_name)

    // Count referrals per broker (how many brokers have referred_by = this broker's id)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referidos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona los códigos de referido y el programa de bonos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="p-2 bg-purple-50 rounded-lg w-fit mb-3">
              <Users size={20} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Brokers referidos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : totalReferrals}</p>
            <p className="text-xs text-gray-400 mt-1">Con código de referido aplicado</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="p-2 bg-blue-50 rounded-lg w-fit mb-3">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Referidores activos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : topReferrers}</p>
            <p className="text-xs text-gray-400 mt-1">Brokers que han referido al menos 1</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-3">
              <Gift size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Bonos generados</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '—' : `S/. ${totalBonuses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">S/. 50 por referido registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar broker o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Broker</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Código</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Referidos</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Referido por</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">{b.full_name}</p>
                    <p className="text-xs text-gray-400">{b.email}</p>
                  </TableCell>
                  <TableCell>
                    {b.referral_code ? (
                      <code className="text-xs font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-[#18181B] tracking-wider">
                        {b.referral_code}
                      </code>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {b.referral_count > 0 ? (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                        {b.referral_count}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {b.referrer_name ? (
                      <span className="text-sm text-gray-700">{b.referrer_name}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(b.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
