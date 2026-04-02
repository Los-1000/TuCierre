'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice, formatDate } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import type { TramiteStatus } from '@/types/database'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Loader2, UserPlus, AlertTriangle, Search, X } from 'lucide-react'
import { updateTramiteStatus } from './actions'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TramiteRow {
  id: string
  reference_code: string
  status: string
  final_price: number
  created_at: string
  updated_at: string
  tramite_types: { display_name: string } | { display_name: string }[] | null
  brokers: { full_name: string; email: string } | { full_name: string; email: string }[] | null
}

type SortField = 'reference_code' | 'created_at' | 'final_price'
type SortDir = 'asc' | 'desc'

const ALL_STATUSES = Object.keys(TRAMITE_STATUS_CONFIG) as TramiteStatus[]

function unwrap<T>(val: T | T[] | null): T | null {
  if (!val) return null
  if (Array.isArray(val)) return val[0] ?? null
  return val
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusCell({ status }: { status: string }) {
  const cfg = TRAMITE_STATUS_CONFIG[status as TramiteStatus]
  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-tight border border-gray-200">
        {status}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  )
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown size={13} className="ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="ml-1 text-[#D47151]" />
    : <ArrowDown size={13} className="ml-1 text-[#D47151]" />
}

// ─── Main client component ────────────────────────────────────────────────────

export default function TramitesClient({
  initialTramites,
  initialStatus = 'all',
}: {
  initialTramites: TramiteRow[]
  initialStatus?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [tramites, setTramites] = useState<TramiteRow[]>(initialTramites)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTarget, setDialogTarget] = useState<string[]>([])
  const [newStatus, setNewStatus] = useState<TramiteStatus>('solicitado')
  const [notes, setNotes] = useState('')

  // ── Derived ──────────────────────────────────────────────────────────────

  const sinAsignar = tramites.filter(t => t.status === 'solicitado').length

  const filtered = tramites
    .filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const code = (t.reference_code ?? '').toLowerCase()
        const broker = unwrap(t.brokers)
        const name = (broker?.full_name ?? '').toLowerCase()
        if (!code.includes(q) && !name.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'reference_code') cmp = (a.reference_code ?? '').localeCompare(b.reference_code ?? '')
      else if (sortField === 'created_at') cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '')
      else if (sortField === 'final_price') cmp = (a.final_price ?? 0) - (b.final_price ?? 0)
      return sortDir === 'asc' ? cmp : -cmp
    })

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }, [sortField])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelected(s => s.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id)))
  }, [filtered])

  function openDialog(ids: string[]) {
    setDialogTarget(ids)
    setNewStatus('solicitado')
    setNotes('')
    setDialogOpen(true)
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
  }

  async function handleUpdateStatus() {
    if (!newStatus || dialogTarget.length === 0) return
    startTransition(async () => {
      const result = await updateTramiteStatus(dialogTarget, newStatus, notes.trim() || null)
      if (result.error) { toast.error('Error: ' + result.error); return }

      setTramites(prev =>
        prev.map(t =>
          dialogTarget.includes(t.id)
            ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
            : t
        )
      )
      toast.success(`Estado → "${TRAMITE_STATUS_CONFIG[newStatus]?.label ?? newStatus}"`)
      setDialogOpen(false)
      setSelected(new Set())
      router.refresh()
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#18181B]">Todos los trámites</h1>
          <span className="px-3 py-1 bg-[#18181B]/8 rounded-full text-xs font-bold text-[#18181B]/60">
            {tramites.length}
          </span>
        </div>
        <Link href="/admin/tramites/nuevo-broker">
          <button className="bg-[#18181B] text-white rounded-full px-6 py-2.5 font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
            <UserPlus size={16} />
            Trámite de broker
          </button>
        </Link>
      </div>

      {/* Amber alert banner for unassigned */}
      {sinAsignar > 0 && (
        <div className="bg-[#D69E2E]/10 border-l-4 border-[#D69E2E] rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-[#D69E2E] shrink-0" />
            <p className="text-sm font-semibold text-[#D69E2E]">
              {sinAsignar} trámite{sinAsignar !== 1 ? 's' : ''} sin notaría asignada — requieren acción
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('solicitado')}
            className="border border-[#D69E2E]/40 text-[#D69E2E] rounded-full px-5 py-1.5 text-xs font-semibold bg-transparent hover:bg-[#D69E2E]/10 transition-colors shrink-0"
          >
            Ver ahora
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#18181B]/40" />
          <input
            type="text"
            placeholder="Buscar por código o broker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#18181B]/15 rounded-2xl h-11 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D47151]/30 bg-transparent text-[#18181B] placeholder:text-[#18181B]/40"
          />
        </div>

        {/* Status select */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-[#18181B]/15 rounded-2xl h-11 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D47151]/30 bg-transparent text-[#18181B]"
        >
          <option value="all">Todos los estados</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{TRAMITE_STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        {/* Clear button — only when filters active */}
        {(search || statusFilter !== 'all') && (
          <button
            onClick={clearFilters}
            className="text-[#D47151] text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F9F8]">
              <th className="py-4 pl-6 w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                <button className="flex items-center hover:text-[#18181B] transition-colors" onClick={() => handleSort('reference_code')}>
                  Código <SortIcon field="reference_code" sortField={sortField} sortDir={sortDir} />
                </button>
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                Broker
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                Tipo
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                <button className="flex items-center hover:text-[#18181B] transition-colors" onClick={() => handleSort('created_at')}>
                  Fecha <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
                </button>
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                Estado
              </th>
              <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                <button className="flex items-center hover:text-[#18181B] transition-colors" onClick={() => handleSort('final_price')}>
                  Precio <SortIcon field="final_price" sortField={sortField} sortDir={sortDir} />
                </button>
              </th>
              <th className="py-4 pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#18181B]/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-[#18181B]/40 text-sm">
                  {tramites.length === 0
                    ? 'No hay trámites registrados aún.'
                    : 'No hay trámites con ese filtro.'}
                </td>
              </tr>
            ) : (
              filtered.map(t => {
                const broker = unwrap(t.brokers)
                const type = unwrap(t.tramite_types)
                const isUnassigned = t.status === 'solicitado'
                return (
                  <tr key={t.id} className="hover:bg-[#F9F9F8]/60 transition-colors">
                    <td className="py-5 pl-6">
                      <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                    </td>
                    <td className="py-5 px-4">
                      <span className="font-mono text-xs font-bold text-[#18181B]">
                        {t.reference_code || '—'}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-sm font-bold text-[#18181B]">{broker?.full_name ?? '—'}</p>
                      <p className="text-xs text-[#18181B]/50">{broker?.email ?? ''}</p>
                    </td>
                    <td className="py-5 px-4 text-sm text-[#18181B]/70">
                      {type?.display_name ?? '—'}
                    </td>
                    <td className="py-5 px-4 text-sm text-[#18181B]/60">
                      {t.created_at ? formatDate(t.created_at) : '—'}
                    </td>
                    <td className="py-5 px-4">
                      {isUnassigned ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D69E2E]/10 text-[#D69E2E] text-[11px] font-bold border border-[#D69E2E]/30">
                          ⚠ Asignar
                        </span>
                      ) : (
                        <StatusCell status={t.status} />
                      )}
                    </td>
                    <td className="py-5 px-4 text-sm font-semibold text-[#18181B]">
                      {formatPrice(t.final_price ?? 0)}
                    </td>
                    <td className="py-5 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/tramites/${t.id}`}>
                          <button className="border border-[#18181B]/15 text-[#18181B] rounded-full px-4 py-1.5 text-xs font-semibold bg-transparent hover:bg-[#18181B]/5 transition-colors flex items-center gap-1">
                            Ver <ExternalLink size={11} />
                          </button>
                        </Link>
                        <button
                          onClick={() => openDialog([t.id])}
                          className="bg-[#18181B] text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Estado
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer row */}
        <div className="px-6 py-4 border-t border-[#18181B]/5 flex items-center justify-between">
          <p className="text-xs text-[#18181B]/50 font-medium">
            Mostrando {filtered.length} de {tramites.length} trámite{tramites.length !== 1 ? 's' : ''}
          </p>
          {selected.size > 0 && (
            <button
              onClick={() => openDialog(Array.from(selected))}
              className="bg-[#18181B] text-white rounded-full px-5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Cambiar estado ({selected.size} seleccionados)
            </button>
          )}
        </div>
      </div>

      {/* Change Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#18181B]">
                Cambiar estado
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Summary */}
              {dialogTarget.length > 0 && (
                <div className="p-4 bg-[#F9F9F8] rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D47151]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#D47151] text-lg">📁</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#18181B]/50 uppercase tracking-wider">
                      {dialogTarget.length > 1 ? `${dialogTarget.length} trámites seleccionados` : 'Trámite seleccionado'}
                    </p>
                    <p className="text-sm font-bold text-[#18181B]">
                      {dialogTarget.length === 1
                        ? filtered.find(t => t.id === dialogTarget[0])?.reference_code ?? '—'
                        : 'Actualización en lote'}
                    </p>
                  </div>
                </div>
              )}

              {/* New status */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50 mb-2">
                  Nuevo Estado
                </label>
                <Select value={newStatus} onValueChange={v => setNewStatus(v as TramiteStatus)}>
                  <SelectTrigger className="border border-[#18181B]/15 rounded-2xl h-11 px-4 focus:ring-2 focus:ring-[#D47151]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${TRAMITE_STATUS_CONFIG[s]?.bg ?? 'bg-gray-300'}`} />
                          {TRAMITE_STATUS_CONFIG[s].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50 mb-2">
                  Mensaje para el broker
                </label>
                <Textarea
                  placeholder="Escribe un mensaje explicando el cambio o los siguientes pasos..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="border border-[#18181B]/15 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#D47151]/30 resize-none text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                  className="flex-1 border border-[#18181B]/15 text-[#18181B] rounded-full px-6 py-3 font-semibold bg-transparent hover:bg-[#18181B]/5 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isPending}
                  className="flex-[1.5] bg-[#18181B] text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Actualizar estado →
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-[#F9F9F8] px-8 py-3 border-t border-[#18181B]/5">
            <p className="text-[10px] text-center text-[#18181B]/40 font-medium uppercase tracking-widest">
              Se notificará automáticamente al broker vía email
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
