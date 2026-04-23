'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, FileText, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import StatusBadge from '@/components/tramites/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import type { Tramite, TramiteStatus } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'

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

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setDateRange('todos')
  }

  const hasActiveFilters = search || statusFilter !== 'all' || dateRange !== 'todos'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-white tracking-tight">Mis Trámites</h1>
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm font-bold">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cotizar"
            className="flex items-center gap-2 bg-[#2855E0] hover:bg-[#1E46C7] text-white rounded-full px-6 py-3 font-semibold text-sm transition-all motion-reduce:transition-none"
          >
            <Plus size={15} />
            Nueva cotización
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#18181B]/40 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="tramites-search" className="sr-only">Buscar trámites</label>
            <input
              id="tramites-search"
              type="text"
              placeholder="Buscar por código, tipo o parte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-[#18181B]/15 bg-white text-sm text-[#18181B] placeholder:text-[#6B7A9A] focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 focus:border-[#2855E0] transition-colors"
            />
          </div>

          {/* Status select */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | TramiteStatus)}
          >
            <SelectTrigger aria-label="Filtrar por estado" className="w-full sm:w-48 h-11 rounded-2xl border-[#18181B]/15 text-sm">
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
            <SelectTrigger aria-label="Filtrar por período" className="w-full sm:w-44 h-11 rounded-2xl border-[#18181B]/15 text-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="esta_semana">Esta semana</SelectItem>
              <SelectItem value="este_mes">Este mes</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-[#2855E0] text-sm font-semibold hover:underline underline-offset-4 px-2 whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table / Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-10">
          <EmptyState
            icon={<FileText size={28} className="text-[#6B7A9A]" />}
            title={
              hasActiveFilters
                ? 'Sin resultados'
                : 'Aún no tienes trámites'
            }
            description={
              hasActiveFilters
                ? 'Intenta ajustar los filtros para encontrar lo que buscas.'
                : 'Empieza cotizando tu primer trámite notarial en minutos.'
            }
            actionLabel="Cotizar ahora"
            actionHref="/cotizar"
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#18181B]/8">
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A]">Código</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A]">Tipo</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A]">Estado</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A] hidden md:table-cell">Fecha</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A] text-right hidden sm:table-cell">Monto</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6B7A9A] text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/5">
                {filtered.map((tramite) => (
                  <tr key={tramite.id} className="hover:bg-[#18181B]/3 transition-colors motion-reduce:transition-none group">
                    <td className="px-6 py-4">
                      <code className="font-mono text-xs bg-[#18181B]/6 text-[#18181B]/70 px-2.5 py-1 rounded-full font-semibold">
                        {tramite.reference_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#18181B]/70 font-medium">
                      {tramite.tramite_types?.display_name ?? 'Trámite notarial'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tramite.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6B7A9A] hidden md:table-cell">
                      {formatDate(tramite.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#18181B] text-sm tabular-nums hidden sm:table-cell">
                      {formatPrice(tramite.final_price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/tramites/${tramite.id}`}
                        className="inline-flex items-center gap-1.5 text-[#18181B]/60 border border-[#18181B]/15 rounded-full px-3.5 py-1.5 text-xs font-semibold hover:border-[#2855E0]/30 hover:text-[#2855E0] transition-all motion-reduce:transition-none group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                      >
                        Ver <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
