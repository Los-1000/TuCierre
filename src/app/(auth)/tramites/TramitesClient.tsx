'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import TramiteCard from '@/components/tramites/TramiteCard'
import EmptyState from '@/components/shared/EmptyState'
import type { Tramite, TramiteStatus } from '@/types/database'

type DateRange = 'todos' | 'esta_semana' | 'este_mes'

interface TramitesClientProps {
  initialTramites: Tramite[]
}

export default function TramitesClient({ initialTramites }: TramitesClientProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | TramiteStatus>('all')
  const [dateRange, setDateRange] = useState<DateRange>('todos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return initialTramites.filter((t) => {
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false

      // Date range filter
      if (dateRange !== 'todos') {
        const created = new Date(t.created_at)
        if (dateRange === 'esta_semana' && created < startOfWeek) return false
        if (dateRange === 'este_mes' && created < startOfMonth) return false
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesRef = t.reference_code.toLowerCase().includes(q)
        const matchesType = t.tramite_types?.display_name?.toLowerCase().includes(q) ?? false
        const matchesParty = t.parties?.some((p) =>
          p.name.toLowerCase().includes(q)
        ) ?? false
        const matchesDistrict = t.property_district?.toLowerCase().includes(q) ?? false
        if (!matchesRef && !matchesType && !matchesParty && !matchesDistrict) return false
      }

      return true
    })
  }, [initialTramites, statusFilter, dateRange, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Mis Trámites</h1>
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {filtered.length}
          </span>
        </div>
        <Button asChild>
          <Link href="/cotizar">
            <Plus size={16} />
            Nueva cotización
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Buscar por código, tipo o parte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status select */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as 'all' | TramiteStatus)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {(Object.keys(TRAMITE_STATUS_CONFIG) as TramiteStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {TRAMITE_STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range select */}
        <Select
          value={dateRange}
          onValueChange={(v) => setDateRange(v as DateRange)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="esta_semana">Esta semana</SelectItem>
            <SelectItem value="este_mes">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} className="text-slate-400" />}
          title={
            search || statusFilter !== 'all' || dateRange !== 'todos'
              ? 'Sin resultados'
              : 'Aún no tienes trámites'
          }
          description={
            search || statusFilter !== 'all' || dateRange !== 'todos'
              ? 'Intenta ajustar los filtros para encontrar lo que buscas.'
              : 'Empieza cotizando tu primer trámite notarial en minutos.'
          }
          actionLabel="Cotizar ahora"
          actionHref="/cotizar"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tramite) => (
            <TramiteCard key={tramite.id} tramite={tramite} />
          ))}
        </div>
      )}
    </div>
  )
}
