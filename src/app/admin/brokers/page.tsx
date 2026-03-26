'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/tramites/StatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { Broker, BrokerTier, TramiteStatus } from '@/types/database'
import { Search, Loader2, User } from 'lucide-react'

type TierFilter = 'all' | BrokerTier

interface BrokerTramite {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  created_at: string
  tramite_types: { display_name: string } | null
}

export default function AdminBrokersPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')

  // Profile sheet
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [brokerTramites, setBrokerTramites] = useState<BrokerTramite[]>([])
  const [loadingTramites, setLoadingTramites] = useState(false)

  // Tier dialog
  const [tierDialogOpen, setTierDialogOpen] = useState(false)
  const [newTier, setNewTier] = useState<BrokerTier>('bronce')
  const [tierReason, setTierReason] = useState('')
  const [updatingTier, setUpdatingTier] = useState(false)

  const fetchBrokers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error al cargar brokers')
    } else {
      setBrokers((data ?? []) as Broker[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchBrokers()
  }, [fetchBrokers])

  async function openBrokerProfile(broker: Broker) {
    setSelectedBroker(broker)
    setSheetOpen(true)
    setLoadingTramites(true)
    setBrokerTramites([])

    const { data } = await supabase
      .from('tramites')
      .select('id, reference_code, status, final_price, created_at, tramite_types(display_name)')
      .eq('broker_id', broker.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setBrokerTramites((data ?? []) as unknown as BrokerTramite[])
    setLoadingTramites(false)
  }

  function openTierDialog() {
    if (!selectedBroker) return
    setNewTier(selectedBroker.tier)
    setTierReason('')
    setTierDialogOpen(true)
  }

  async function handleUpdateTier() {
    if (!selectedBroker) return
    setUpdatingTier(true)

    try {
      const { error } = await supabase
        .from('brokers')
        .update({ tier: newTier, updated_at: new Date().toISOString() })
        .eq('id', selectedBroker.id)

      if (error) throw error

      toast.success(`Tier actualizado a ${TIER_CONFIG[newTier].label}`)
      setTierDialogOpen(false)
      setSelectedBroker((prev) => prev ? { ...prev, tier: newTier } : prev)
      fetchBrokers()
    } catch (err: unknown) {
      toast.error('Error al actualizar tier')
      console.error(err)
    } finally {
      setUpdatingTier(false)
    }
  }

  // Filtered brokers
  const filtered = brokers.filter((b) => {
    if (tierFilter !== 'all' && b.tier !== tierFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!b.full_name.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  function TierBadge({ tier }: { tier: BrokerTier }) {
    const config = TIER_CONFIG[tier]
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color} border-current/20`}
      >
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Cargando...' : `${filtered.length} broker${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as TierFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tiers</SelectItem>
            {(Object.keys(TIER_CONFIG) as BrokerTier[]).map((tier) => (
              <SelectItem key={tier} value={tier}>
                {TIER_CONFIG[tier].icon} {TIER_CONFIG[tier].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">DNI</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tier</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Trámites/mes</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Registrado</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Cargando brokers...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No se encontraron brokers
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        {b.avatar_url ? (
                          <img src={b.avatar_url} alt={b.full_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User size={14} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{b.full_name}</p>
                        <p className="text-xs text-gray-400">{b.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-gray-600">{b.dni}</TableCell>
                  <TableCell>
                    <TierBadge tier={b.tier} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 font-semibold">{b.total_tramites_month}</TableCell>
                  <TableCell className="text-sm text-gray-700">{b.total_tramites}</TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(b.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => openBrokerProfile(b)}
                    >
                      Ver perfil
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Broker Profile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedBroker && (
            <>
              <SheetHeader className="pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {selectedBroker.avatar_url ? (
                      <img
                        src={selectedBroker.avatar_url}
                        alt={selectedBroker.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <SheetTitle className="text-lg">{selectedBroker.full_name}</SheetTitle>
                    <p className="text-sm text-gray-500">{selectedBroker.email}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="py-5 space-y-6">
                {/* Broker info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Tier actual</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-gray-800">
                        {TIER_CONFIG[selectedBroker.tier].icon} {TIER_CONFIG[selectedBroker.tier].label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">DNI</p>
                    <p className="text-sm font-mono text-gray-700">{selectedBroker.dni}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Teléfono</p>
                    <p className="text-sm text-gray-700">{selectedBroker.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Empresa</p>
                    <p className="text-sm text-gray-700">{selectedBroker.company_name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Trámites este mes</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedBroker.total_tramites_month}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Total trámites</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedBroker.total_tramites}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Código de referido</p>
                    {selectedBroker.referral_code ? (
                      <code className="text-sm font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-brand-navy tracking-wider">
                        {selectedBroker.referral_code}
                      </code>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </div>

                <div>
                  <Button variant="outline" size="sm" onClick={openTierDialog} className="text-sm">
                    Ajustar tier
                  </Button>
                </div>

                {/* Last tramites */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Últimos 10 trámites</h3>
                  {loadingTramites ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                      <Loader2 size={16} className="animate-spin" />
                      Cargando trámites...
                    </div>
                  ) : brokerTramites.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin trámites registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {brokerTramites.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono font-semibold text-gray-700">{t.reference_code}</p>
                            <p className="text-xs text-gray-400">{t.tramite_types?.display_name ?? '—'}</p>
                          </div>
                          <StatusBadge status={t.status} size="sm" />
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-800">{formatPrice(t.final_price)}</p>
                            <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Adjust Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustar tier</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nuevo tier</label>
              <Select value={newTier} onValueChange={(v) => setNewTier(v as BrokerTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIER_CONFIG) as BrokerTier[]).map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {TIER_CONFIG[tier].icon} {TIER_CONFIG[tier].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Razón <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <Textarea
                placeholder="Motivo del cambio de tier..."
                value={tierReason}
                onChange={(e) => setTierReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTierDialogOpen(false)} disabled={updatingTier}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTier} disabled={updatingTier}>
              {updatingTier && <Loader2 size={14} className="animate-spin mr-2" />}
              Actualizar tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
