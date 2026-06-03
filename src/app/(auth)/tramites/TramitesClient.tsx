'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import type { ApiTramiteListItem, ApiTramiteStatus } from '@/types/api'

const STATUS_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Solicitado', value: 'SOLICITADO' },
  { label: 'En proceso', value: 'EN_REVISION' },
  { label: 'En firma', value: 'EN_FIRMA' },
  { label: 'Completado', value: 'COMPLETADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SOLICITADO:       { bg: '#eff2ff', text: '#2c4dfb' },
  COTIZADO:         { bg: '#eff2ff', text: '#2c4dfb' },
  DOCS_PENDIENTES:  { bg: '#fef9ee', text: '#b2832e' },
  EN_REVISION:      { bg: '#fff7ed', text: '#c2410c' },
  EN_FIRMA:         { bg: '#ecfdf5', text: '#059669' },
  EN_REGISTRO:      { bg: '#f0fdf4', text: '#15803d' },
  COMPLETADO:       { bg: '#f0fdf4', text: '#15803d' },
  CANCELADO:        { bg: '#fef2f2', text: '#dc2626' },
}

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado', COTIZADO: 'Cotizado', DOCS_PENDIENTES: 'Docs. Pendientes',
  EN_REVISION: 'En Revisión', EN_FIRMA: 'En Firma', EN_REGISTRO: 'En Registro',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

interface Props {
  initialTramites: ApiTramiteListItem[]
}

export default function TramitesClient({ initialTramites }: Props) {
  const [tramites, setTramites] = useState(initialTramites)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const applyFilter = useCallback(async (status: string) => {
    setActiveFilter(status)
    setLoading(true)
    try {
      const result = await api.tramites.list({ status: status || undefined, size: 50 })
      setTramites(result?.content ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  const filtered = search
    ? tramites.filter(t =>
        t.tramiteType.toLowerCase().includes(search.toLowerCase()) ||
        t.propertyAddress?.toLowerCase().includes(search.toLowerCase()) ||
        t.propertyDistrictAddress?.toLowerCase().includes(search.toLowerCase())
      )
    : tramites

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900 font-inter tracking-tight">Mis Trámites</h1>
        <Link
          href="/cotizar"
          className="flex items-center gap-2 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
          style={{ background: '#2c4dfb' }}
        >
          <Plus size={15} />
          Nuevo
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl border border-navy-100 p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            type="text"
            placeholder="Buscar por tipo, dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 placeholder:text-navy-300 outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => applyFilter(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={
                activeFilter === f.value
                  ? { background: '#0f1d3d', color: 'white' }
                  : { background: '#f4f6fb', color: '#4a6da8' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-navy-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-navy-400 text-sm">No hay trámites que coincidan.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_1fr_140px_100px_40px] gap-4 px-5 py-3 border-b border-navy-50 bg-navy-50">
              {['Tipo', 'Dirección', 'Estado', 'Monto', ''].map((h) => (
                <span key={h} className="text-xs font-bold text-navy-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-navy-50">
              {filtered.map((t) => {
                const colors = STATUS_COLORS[t.statusTramite] ?? { bg: '#f4f6fb', text: '#4a6da8' }
                return (
                  <Link
                    key={t.id}
                    href={`/tramites/${t.id}`}
                    className="flex md:grid md:grid-cols-[1fr_1fr_140px_100px_40px] items-center gap-4 px-5 py-4 hover:bg-navy-50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-navy-900">{t.tramiteType}</div>
                      <div className="text-xs text-navy-400 mt-0.5 md:hidden">{t.propertyDistrictAddress ?? '—'}</div>
                    </div>
                    <div className="hidden md:block text-sm text-navy-500 truncate">
                      {t.propertyAddress ?? t.propertyDistrictAddress ?? '—'}
                    </div>
                    <div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {STATUS_LABELS[t.statusTramite] ?? t.statusTramite}
                      </span>
                    </div>
                    <div className="hidden md:block text-sm font-semibold text-navy-900 tabular-nums">
                      {t.finalFee != null ? formatPrice(t.finalFee) : '—'}
                    </div>
                    <div className="flex justify-end">
                      <ChevronRight size={15} className="text-navy-300" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
