'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import type { TramiteStatus } from '@/types/database'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Loader2 } from 'lucide-react'
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

// Supabase can return joined rows as object OR single-item array depending on the FK direction
function unwrap<T>(val: T | T[] | null): T | null {
  if (!val) return null
  if (Array.isArray(val)) return val[0] ?? null
  return val
}

// ─── Status badge (inline, no crash if unknown status) ───────────────────────

function StatusCell({ status }: { status: string }) {
  const cfg = TRAMITE_STATUS_CONFIG[status as TramiteStatus]
  if (!cfg) return <Badge variant="outline">{status}</Badge>
  return (
    <span className={`inline-flex items-center rounded-full border font-medium px-2 py-0.5 text-xs ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

// ─── Sort icon (extracted to avoid new component type on each render) ─────────

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown size={13} className="ml-1 opacity-40" />
  return sortDir === 'asc'
    ? <ArrowUp size={13} className="ml-1 text-brand-navy" />
    : <ArrowDown size={13} className="ml-1 text-brand-navy" />
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

  // ── Filtering & sorting ──────────────────────────────────────────────────

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

  // ── Handlers ────────────────────────────────────────────────────────────

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trámites</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} de {tramites.length} trámite{tramites.length !== 1 ? 's' : ''}
          </p>
        </div>
        {selected.size > 0 && (
          <Button variant="outline" size="sm" onClick={() => openDialog(Array.from(selected))}>
            Cambiar estado ({selected.size})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por código o broker..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ALL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{TRAMITE_STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <button className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  onClick={() => handleSort('reference_code')}>
                  Código <SortIcon field="reference_code" sortField={sortField} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Broker</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</TableHead>
              <TableHead>
                <button className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  onClick={() => handleSort('final_price')}>
                  Precio <SortIcon field="final_price" sortField={sortField} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
                  onClick={() => handleSort('created_at')}>
                  Fecha <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                  {tramites.length === 0
                    ? 'No hay trámites registrados aún.'
                    : 'No hay trámites con ese filtro.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(t => {
                const broker = unwrap(t.brokers)
                const type = unwrap(t.tramite_types)
                return (
                  <TableRow key={t.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-gray-700">
                        {t.reference_code || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">{broker?.full_name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{broker?.email ?? ''}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{type?.display_name ?? '—'}</TableCell>
                    <TableCell><StatusCell status={t.status} /></TableCell>
                    <TableCell className="text-sm font-semibold text-gray-800">
                      {formatPrice(t.final_price ?? 0)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {t.created_at ? formatDate(t.created_at) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/tramites/${t.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            Ver <ExternalLink size={12} />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="h-7 text-xs"
                          onClick={() => openDialog([t.id])}>
                          Estado
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Change Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialogTarget.length > 1 && (
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                Se actualizarán <strong>{dialogTarget.length}</strong> trámites.
              </p>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nuevo estado</label>
              <Select value={newStatus} onValueChange={v => setNewStatus(v as TramiteStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{TRAMITE_STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Nota para el broker <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <Textarea
                placeholder="Escribe una nota..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
