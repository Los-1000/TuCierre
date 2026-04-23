'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import StatusBadge from '@/components/tramites/StatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { Broker, BrokerTier, TramiteStatus } from '@/types/database'
import { Search, Loader2, X } from 'lucide-react'

type TierFilter = 'all' | BrokerTier

interface BrokerTramite {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  created_at: string
  tramite_types: { display_name: string } | null
}

// ─── Tier badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: BrokerTier }) {
  const styles: Record<BrokerTier, string> = {
    bronce: 'bg-[#C05621]/10 text-[#C05621] border border-[#C05621]/20',
    plata:  'bg-[#718096]/10 text-[#718096] border border-[#718096]/20',
    oro:    'bg-[#D69E2E]/10 text-[#D69E2E] border border-[#D69E2E]/20',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[tier]}`}>
      {tier}
    </span>
  )
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function AvatarInitials({ name, size = 10 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {initials}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminBrokersPage() {
  const supabase = createClient()

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
  const [activeTab, setActiveTab] = useState<'tramites' | 'ajustes'>('tramites')

  // Tier adjustment (inline in sheet)
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
    setNewTier(broker.tier)
    setTierReason('')
    setActiveTab('tramites')
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
      setSelectedBroker(prev => prev ? { ...prev, tier: newTier } : prev)
      fetchBrokers()
    } catch (err: unknown) {
      toast.error('Error al actualizar tier')
      console.error(err)
    } finally {
      setUpdatingTier(false)
    }
  }

  // Filtered brokers
  const filtered = brokers.filter(b => {
    if (tierFilter !== 'all' && b.tier !== tierFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!b.full_name.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#18181B]">Brokers</h1>
        <span className="text-xl font-medium text-[#18181B]/30">
          {loading ? '…' : `${filtered.length} activos`}
        </span>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#18181B]/40" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-[#18181B]/15 rounded-2xl h-11 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 bg-transparent text-[#18181B] placeholder:text-[#18181B]/40"
          />
        </div>

        {/* Tier filter */}
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value as TierFilter)}
          className="border border-[#18181B]/15 rounded-2xl h-11 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 bg-transparent text-[#18181B]"
        >
          <option value="all">Todos los tiers</option>
          {(Object.keys(TIER_CONFIG) as BrokerTier[]).map(tier => (
            <option key={tier} value={tier}>
              {TIER_CONFIG[tier].icon} {TIER_CONFIG[tier].label}
            </option>
          ))}
        </select>

        {/* Clear */}
        {(search || tierFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setTierFilter('all') }}
            className="text-[#2855E0] text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
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
            <tr className="bg-[#F0F3FF]">
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">Nombre</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">DNI</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">Tier</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">Trámites/mes</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">Total</th>
              <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50">Registrado</th>
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#18181B]/50 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#18181B]/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#18181B]/40">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Cargando brokers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#18181B]/40 text-sm">
                  No se encontraron brokers
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="hover:bg-[#F0F3FF]/60 transition-colors group cursor-pointer" onClick={() => openBrokerProfile(b)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#18181B]/8 flex items-center justify-center font-bold text-[#18181B] text-sm shrink-0">
                        {b.full_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#18181B] text-sm">{b.full_name}</p>
                        <p className="text-xs text-[#18181B]/50">{b.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-mono text-sm text-[#18181B]/60">{b.dni}</td>
                  <td className="px-6 py-6">
                    <TierBadge tier={b.tier} />
                  </td>
                  <td className="px-6 py-6 font-semibold text-sm text-[#18181B]">{b.total_tramites_month}</td>
                  <td className="px-6 py-6 text-sm text-[#18181B]/80">{b.total_tramites}</td>
                  <td className="px-6 py-6 text-sm text-[#18181B]/50">{formatDate(b.created_at)}</td>
                  <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      className="border border-[#18181B]/15 text-[#18181B] rounded-full px-4 py-1.5 text-xs font-semibold bg-transparent hover:bg-[#18181B]/5 transition-colors"
                      onClick={() => openBrokerProfile(b)}
                    >
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Broker Profile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[480px] p-0 flex flex-col bg-white border-l border-[#18181B]/8"
        >
          {selectedBroker && (
            <>
              {/* Drawer Header */}
              <div className="p-8 pb-4 flex items-start justify-between border-b border-[#18181B]/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#18181B] text-white flex items-center justify-center text-xl font-black shrink-0">
                    {selectedBroker.full_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#18181B] leading-tight">{selectedBroker.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TierBadge tier={selectedBroker.tier} />
                      <span className="text-xs text-[#18181B]/50">Desde {new Date(selectedBroker.created_at).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-2 hover:bg-[#18181B]/5 rounded-full transition-colors"
                >
                  <X size={18} className="text-[#18181B]/50" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#18181B]/5 px-8 gap-8">
                {(['tramites', 'ajustes'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-bold capitalize transition-all border-b-2 ${
                      activeTab === tab
                        ? 'text-[#18181B] border-[#2855E0]'
                        : 'text-[#18181B]/40 border-transparent hover:text-[#18181B]/70'
                    }`}
                  >
                    {tab === 'tramites' ? 'Trámites' : 'Ajustes'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">

                {/* TRÁMITES TAB */}
                {activeTab === 'tramites' && (
                  <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#F0F3FF] rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 mb-1">Este mes</p>
                        <p className="text-2xl font-black text-[#18181B]">{selectedBroker.total_tramites_month}</p>
                      </div>
                      <div className="bg-[#F0F3FF] rounded-2xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 mb-1">Total</p>
                        <p className="text-2xl font-black text-[#18181B]">{selectedBroker.total_tramites}</p>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#18181B] mb-3">Últimos trámites</h4>

                    {loadingTramites ? (
                      <div className="flex items-center gap-2 text-[#18181B]/40 text-sm py-8 justify-center">
                        <Loader2 size={16} className="animate-spin" />
                        Cargando trámites...
                      </div>
                    ) : brokerTramites.length === 0 ? (
                      <p className="text-sm text-[#18181B]/40 text-center py-8">Sin trámites registrados.</p>
                    ) : (
                      <div className="space-y-2">
                        {brokerTramites.map(t => {
                          const type = Array.isArray(t.tramite_types) ? t.tramite_types[0] : t.tramite_types
                          return (
                            <div
                              key={t.id}
                              className="flex items-center gap-3 p-3 border border-[#18181B]/8 rounded-2xl hover:bg-[#F0F3FF] transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono font-bold text-[#18181B]">{t.reference_code}</p>
                                <p className="text-xs text-[#18181B]/50">{type?.display_name ?? '—'}</p>
                              </div>
                              <StatusBadge status={t.status} size="sm" />
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-[#18181B]">{formatPrice(t.final_price)}</p>
                                <p className="text-xs text-[#18181B]/40">{formatDate(t.created_at)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* AJUSTES TAB */}
                {activeTab === 'ajustes' && (
                  <div className="p-8 space-y-8">
                    {/* Tier adjustment */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 mb-1">
                          Ajustar tier manualmente
                        </h4>
                        <p className="text-sm text-[#18181B]/60 leading-relaxed">
                          El sistema recalcula el tier automáticamente cada mes. Cambiarlo manualmente fijará el nivel hasta el próximo cierre.
                        </p>
                      </div>

                      {/* Tier radio group */}
                      <div className="grid grid-cols-1 gap-3">
                        {(Object.keys(TIER_CONFIG) as BrokerTier[]).map(tier => {
                          const isSelected = newTier === tier
                          const tierStyles: Record<BrokerTier, string> = {
                            bronce: 'text-[#C05621]',
                            plata:  'text-[#718096]',
                            oro:    'text-[#D69E2E]',
                          }
                          return (
                            <label
                              key={tier}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#2855E0] text-white border-[#2855E0]'
                                  : 'bg-white border-[#18181B]/10 hover:border-[#18181B]/20'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-lg ${isSelected ? '' : tierStyles[tier]}`}>
                                  {TIER_CONFIG[tier].icon}
                                </span>
                                <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#18181B]'}`}>
                                  {TIER_CONFIG[tier].label}
                                </span>
                              </div>
                              <input
                                type="radio"
                                name="tier_override"
                                value={tier}
                                checked={isSelected}
                                onChange={() => setNewTier(tier)}
                                className="w-4 h-4 accent-white"
                              />
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Motivo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#18181B]/50 uppercase tracking-wider">
                        Motivo del ajuste
                      </label>
                      <Textarea
                        placeholder="Ej: Ajuste por volumen proyectado para el trimestre Q4..."
                        value={tierReason}
                        onChange={e => setTierReason(e.target.value)}
                        rows={4}
                        className="border border-[#18181B]/15 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#2855E0]/30 resize-none text-sm"
                      />
                    </div>

                    {/* Warning */}
                    <div className="bg-[#D69E2E]/8 rounded-2xl p-4 flex gap-3">
                      <span className="text-[#D69E2E] text-lg shrink-0">⚠</span>
                      <p className="text-xs font-medium text-[#D69E2E] leading-relaxed">
                        Este cambio sobreescribirá el cálculo automático para este periodo. El cambio quedará registrado en el log de auditoría.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer action — only show in Ajustes tab */}
              {activeTab === 'ajustes' && (
                <div className="p-8 border-t border-[#18181B]/5">
                  <button
                    onClick={handleUpdateTier}
                    disabled={updatingTier}
                    className="w-full py-4 bg-[#18181B] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {updatingTier && <Loader2 size={16} className="animate-spin" />}
                    Guardar cambio →
                  </button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
