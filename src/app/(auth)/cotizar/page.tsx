'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Loader2, Building2, MapPin, Check } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { PERU_DISTRICTS, TIER_CONFIG } from '@/lib/constants'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from 'sonner'
import PriceBreakdown, { calculateFinalPrice } from '@/components/cotizador/PriceBreakdown'
import PriceMatchModal from '@/components/cotizador/PriceMatchModal'
import type { TramiteType, BrokerTier } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notaria {
  id: string
  full_name: string
  notaria_name: string | null
  notaria_address: string | null
}

const datosSchema = z.object({
  property_address: z.string().min(5, 'Ingresa la dirección del inmueble'),
  property_district: z.string().min(1, 'Selecciona el distrito'),
  property_value: z.number().positive().optional(),
})

type DatosInput = z.infer<typeof datosSchema>

// ─── Step bar ───────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Notaría' },
  { number: 2, label: 'Trámite' },
  { number: 3, label: 'Confirmar' },
]

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const isCompleted = current > s.number
        const isActive = current === s.number
        return (
          <div key={s.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                isCompleted && 'bg-[#2855E0] text-white',
                isActive && 'bg-[#2855E0] text-white ring-4 ring-[#2855E0]/20',
                !isCompleted && !isActive && 'bg-white/8 border-2 border-white/20 text-white/55',
              )}>
                {isCompleted ? <Check size={15} /> : s.number}
              </div>
              <span className={cn(
                'text-xs font-semibold whitespace-nowrap',
                isActive ? 'text-white font-bold' : isCompleted ? 'text-[#2855E0]' : 'text-white/55',
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-[2px] flex-1 mx-3 mb-5 transition-colors rounded-full',
                current > s.number ? 'bg-[#2855E0]' : 'bg-white/12',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CotizarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [notarias, setNotarias] = useState<Notaria[]>([])
  const [selectedNotaria, setSelectedNotaria] = useState<Notaria | null>(null)
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [selectedType, setSelectedType] = useState<TramiteType | null>(null)
  const [brokerTier, setBrokerTier] = useState<BrokerTier>('bronce')
  const [approvedPriceMatches, setApprovedPriceMatches] = useState<Record<string, { id: string; our_matched_price: number }>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [priceMatchOpen, setPriceMatchOpen] = useState(false)

  const form = useForm<DatosInput>({
    resolver: zodResolver(datosSchema),
  })

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: types },
        { data: admins },
        { data: { user } },
      ] = await Promise.all([
        supabase.from('tramite_types').select('*').eq('is_active', true).order('display_name'),
        supabase
          .from('brokers')
          .select('id, full_name, notaria_name, notaria_address')
          .eq('is_admin', true)
          .not('notaria_name', 'is', null),
        supabase.auth.getUser(),
      ])
      setTramiteTypes(types ?? [])
      setNotarias((admins ?? []) as Notaria[])
      if (user) {
        const [{ data: brokerResult }, { data: priceMatches }] = await Promise.all([
          supabase.from('brokers').select('tier').eq('id', user.id).single(),
          supabase
            .from('price_match_requests')
            .select('id, tramite_type_id, our_matched_price')
            .eq('broker_id', user.id)
            .eq('status', 'approved')
            .not('our_matched_price', 'is', null),
        ])
        const broker = brokerResult as { tier: string } | null
        if (broker) setBrokerTier((broker as { tier: string }).tier as BrokerTier)
        if (priceMatches) {
          const map: Record<string, { id: string; our_matched_price: number }> = {}
          for (const pm of priceMatches as { id: string; tramite_type_id: string; our_matched_price: number }[]) {
            map[pm.tramite_type_id] = { id: pm.id, our_matched_price: pm.our_matched_price }
          }
          setApprovedPriceMatches(map)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubmitTramite = async () => {
    if (!selectedType || !selectedNotaria) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Sesión expirada'); return }

      const formData = form.getValues()
      const activePriceMatch = approvedPriceMatches[selectedType.id]
      const { quoted, discount, final } = calculateFinalPrice(selectedType.base_price, brokerTier)
      const tierConfig = TIER_CONFIG[brokerTier]

      const finalPrice = activePriceMatch ? activePriceMatch.our_matched_price : final
      const discountApplied = activePriceMatch ? 0 : tierConfig.discount

      const documents = selectedType.required_documents.map(doc => ({
        name: doc.name,
        url: null,
        uploaded_at: null,
        status: 'pending' as const,
      }))

      const { data: tramiteRaw, error } = await supabase.from('tramites').insert({
        broker_id: user.id,
        notaria_id: selectedNotaria.id,
        tramite_type_id: selectedType.id,
        reference_code: '',
        status: 'solicitado',
        property_address: formData.property_address,
        property_district: formData.property_district,
        property_value: formData.property_value ?? null,
        parties: [],
        quoted_price: quoted,
        discount_applied: discountApplied,
        final_price: finalPrice,
        price_matched: activePriceMatch ? true : false,
        price_match_reference: activePriceMatch ? activePriceMatch.id : null,
        documents,
        estimated_completion: new Date(
          Date.now() + selectedType.estimated_days * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0],
      } as never).select().single()
      const tramite = tramiteRaw as { id: string } | null

      if (error) throw error

      toast.success('¡Trámite solicitado exitosamente!')
      router.push(`/tramites/${tramite!.id}`)
    } catch (err) {
      toast.error('Error al solicitar el trámite. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2855E0]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Nueva cotización</h1>
        <p className="text-white/50 text-sm mt-1">Solicita tu trámite notarial en 3 pasos.</p>
      </div>

      <StepBar current={step} />

      {/* ── STEP 1: Select notaria ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-white">¿Con qué notaría quieres trabajar?</h2>

          {notarias.length === 0 ? (
            <div className="bg-white border border-[#18181B]/10 rounded-2xl p-8 text-center">
              <Building2 size={32} className="mx-auto text-[#18181B]/30 mb-3" />
              <p className="text-sm text-[#18181B]/50">
                No hay notarías disponibles en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notarias.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNotaria(n)}
                  className={cn(
                    'w-full text-left border-2 rounded-2xl p-4 transition-all',
                    selectedNotaria?.id === n.id
                      ? 'border-[#2855E0] bg-white shadow-sm'
                      : 'border-[#18181B]/10 hover:border-[#2855E0]/40 bg-white hover:bg-white',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      selectedNotaria?.id === n.id
                        ? 'bg-[#2855E0] text-white'
                        : 'bg-[#18181B]/6 text-[#18181B]/50',
                    )}>
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-semibold text-sm transition-colors',
                        selectedNotaria?.id === n.id ? 'text-[#18181B]' : 'text-[#18181B]',
                      )}>
                        {n.notaria_name ?? n.full_name}
                      </div>
                      {n.notaria_address && (
                        <div className="text-xs text-[#18181B]/50 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {n.notaria_address}
                        </div>
                      )}
                    </div>
                    {selectedNotaria?.id === n.id && (
                      <div className="w-5 h-5 rounded-full bg-[#2855E0] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                if (!selectedNotaria) { toast.error('Selecciona una notaría'); return }
                setStep(2)
              }}
              className="flex items-center gap-2 bg-[#18181B] text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-[#18181B]/90 transition-colors disabled:opacity-50"
            >
              Continuar <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Tramite type + datos ── */}
      {step === 2 && (
        <form
          onSubmit={form.handleSubmit(() => {
            if (!selectedType) { toast.error('Selecciona el tipo de trámite'); return }
            setStep(3)
          })}
          className="space-y-6"
        >
          {/* Type selection */}
          <div>
            <h2 className="font-semibold text-white mb-3">¿Qué trámite necesitas?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tramiteTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'text-left border-2 rounded-2xl p-4 transition-all',
                    selectedType?.id === type.id
                      ? 'border-[#2855E0] bg-white shadow-sm'
                      : 'border-[#18181B]/10 hover:border-[#2855E0]/40 bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={cn(
                      'font-semibold text-[#18181B] text-sm leading-snug',
                      selectedType?.id === type.id && 'text-[#18181B]',
                    )}>
                      {type.display_name}
                    </div>
                    {selectedType?.id === type.id && (
                      <div className="w-5 h-5 rounded-full bg-[#2855E0] flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[#18181B]/50">
                    {formatPrice(type.base_price)} · {type.estimated_days} días
                  </div>
                </button>
              ))}
            </div>

            {/* Price preview bar */}
            {selectedType && (() => {
              const activePm = approvedPriceMatches[selectedType.id]
              const displayPrice = activePm
                ? activePm.our_matched_price
                : calculateFinalPrice(selectedType.base_price, brokerTier).final
              return (
                <div className="mt-4 bg-[#2855E0]/6 border border-[#2855E0]/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2855E0]">
                    {activePm ? 'Precio especial aprobado:' : 'Precio estimado con tu descuento:'}
                  </span>
                  <span className="text-lg font-bold text-[#2855E0] tabular-nums">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
              )
            })()}
          </div>

          {/* Property data */}
          <div className="space-y-4">
            <h2 className="font-semibold text-white">Datos del inmueble</h2>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                placeholder="Av. Javier Prado 1234, Piso 5"
                className="w-full h-11 px-4 rounded-2xl border border-[#18181B]/15 bg-white text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 focus:border-[#2855E0] transition-colors placeholder:text-[#18181B]/30"
                {...form.register('property_address')}
              />
              {form.formState.errors.property_address && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.property_address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
                  Distrito <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.watch('property_district')}
                  onValueChange={(val) => form.setValue('property_district', val)}
                >
                  <SelectTrigger className="h-11 rounded-2xl border-[#18181B]/15">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERU_DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.property_district && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.property_district.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
                  Valor del inmueble (S/.)
                </label>
                <input
                  type="number"
                  placeholder="350,000"
                  min="0"
                  step="1000"
                  className="w-full h-11 px-4 rounded-2xl border border-[#18181B]/15 bg-white text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 focus:border-[#2855E0] transition-colors placeholder:text-[#18181B]/30"
                  {...form.register('property_value', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] rounded-full px-5 py-2.5 font-semibold text-sm hover:bg-[#18181B]/5 transition-colors"
            >
              <ArrowLeft size={15} /> Anterior
            </button>
            <button
              type="submit"
              disabled={!selectedType}
              className="flex items-center gap-2 bg-[#18181B] text-white rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-[#18181B]/90 transition-colors disabled:opacity-40"
            >
              Continuar <ArrowRight size={15} />
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: Summary & submit ── */}
      {step === 3 && selectedType && selectedNotaria && (
        <div className="space-y-4">
          <h2 className="font-semibold text-white">Resumen del trámite</h2>

          {/* Notaria */}
          <div className="bg-white border border-[#18181B]/10 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 mb-2">Notaría seleccionada</div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181B]/6 flex items-center justify-center">
                <Building2 size={16} className="text-[#18181B]/60" />
              </div>
              <div>
                <div className="font-semibold text-[#18181B] text-sm">
                  {selectedNotaria.notaria_name ?? selectedNotaria.full_name}
                </div>
                {selectedNotaria.notaria_address && (
                  <div className="text-xs text-[#18181B]/50 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {selectedNotaria.notaria_address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="bg-white border border-[#18181B]/10 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 mb-1">Tipo de trámite</div>
            <div className="font-semibold text-[#18181B]">{selectedType.display_name}</div>
            <div className="text-sm text-[#18181B]/50 mt-0.5">
              ~{selectedType.estimated_days} días hábiles
            </div>
          </div>

          {/* Property */}
          <div className="bg-white border border-[#18181B]/10 rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/40 mb-1">Inmueble</div>
            <div className="font-medium text-[#18181B]">{form.watch('property_address')}</div>
            <div className="text-sm text-[#18181B]/50">{form.watch('property_district')}</div>
            {form.watch('property_value') ? (
              <div className="text-sm text-[#18181B]/50">
                Valor: {formatPrice(form.watch('property_value')!)}
              </div>
            ) : null}
          </div>

          {/* Price */}
          <PriceBreakdown
            basePrice={selectedType.base_price}
            tier={brokerTier}
            matchedPrice={approvedPriceMatches[selectedType.id]?.our_matched_price}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPriceMatchOpen(true)}
              className="text-sm text-[#18181B]/50 hover:text-[#2855E0] underline-offset-4 hover:underline order-2 sm:order-1 transition-colors"
            >
              Tengo una cotización más baja
            </button>
            <div className="flex gap-3 order-1 sm:order-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] rounded-full px-5 py-2.5 font-semibold text-sm hover:bg-[#18181B]/5 transition-colors"
              >
                <ArrowLeft size={15} /> Anterior
              </button>
              <button
                onClick={handleSubmitTramite}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#2855E0] hover:bg-[#1E46C7] text-white rounded-full px-6 py-2.5 font-semibold text-sm transition-all disabled:opacity-70"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Solicitando...' : 'Solicitar trámite →'}
              </button>
            </div>
          </div>

          <PriceMatchModal
            open={priceMatchOpen}
            onClose={() => setPriceMatchOpen(false)}
            tramiteTypeId={selectedType.id}
          />
        </div>
      )}
    </div>
  )
}
