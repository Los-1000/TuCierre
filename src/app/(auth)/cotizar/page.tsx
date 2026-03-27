'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Loader2, Building2, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Notaría' },
  { number: 2, label: 'Trámite' },
  { number: 3, label: 'Confirmar' },
]

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
              current === s.number && 'bg-brand-navy text-parchment',
              current > s.number && 'bg-brand-emerald text-white',
              current < s.number && 'bg-muted text-muted-foreground',
            )}>
              {current > s.number ? <CheckCircle2 size={16} /> : s.number}
            </div>
            <span className={cn(
              'text-xs font-medium whitespace-nowrap',
              current === s.number ? 'text-ink' : 'text-muted-foreground',
            )}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'h-px flex-1 mx-2 mb-5 transition-colors',
              current > s.number ? 'bg-brand-emerald' : 'bg-muted',
            )} />
          )}
        </div>
      ))}
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
        const { data: brokerResult } = await supabase
          .from('brokers')
          .select('tier')
          .eq('id', user.id)
          .single()
        const broker = brokerResult as { tier: string } | null
        if (broker) setBrokerTier((broker as { tier: string }).tier as BrokerTier)
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
      const { quoted, discount, final } = calculateFinalPrice(selectedType.base_price, brokerTier)
      const tierConfig = TIER_CONFIG[brokerTier]

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
        discount_applied: tierConfig.discount,
        final_price: final,
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
        <Loader2 size={32} className="animate-spin text-brand-navy" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Nueva cotización</h1>
        <p className="text-muted-foreground text-sm mt-1">Solicita tu trámite notarial en 3 pasos.</p>
      </div>

      <StepBar current={step} />

      {/* ── STEP 1: Select notaria ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-ink">¿Con qué notaría quieres trabajar?</h2>

          {notarias.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center">
              <Building2 size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
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
                    'w-full text-left bg-white border rounded-xl p-4 transition-all hover:shadow-sm',
                    selectedNotaria?.id === n.id
                      ? 'border-brand-navy ring-1 ring-brand-navy/20'
                      : 'border-border hover:border-brand-gold/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      selectedNotaria?.id === n.id
                        ? 'bg-brand-navy text-parchment'
                        : 'bg-muted text-muted-foreground',
                    )}>
                      <Building2 size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink text-sm">
                        {n.notaria_name ?? n.full_name}
                      </div>
                      {n.notaria_address && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {n.notaria_address}
                        </div>
                      )}
                    </div>
                    {selectedNotaria?.id === n.id && (
                      <CheckCircle2 size={18} className="text-brand-navy flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => {
                if (!selectedNotaria) { toast.error('Selecciona una notaría'); return }
                setStep(2)
              }}
              disabled={!selectedNotaria}
              className="w-full sm:w-auto"
            >
              Continuar <ArrowRight size={16} />
            </Button>
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
            <h2 className="font-semibold text-ink mb-3">¿Qué trámite necesitas?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tramiteTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'text-left bg-white border rounded-xl p-3.5 transition-all hover:shadow-sm',
                    selectedType?.id === type.id
                      ? 'border-brand-navy ring-1 ring-brand-navy/20'
                      : 'border-border hover:border-brand-gold/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-ink text-sm leading-snug">{type.display_name}</div>
                    {selectedType?.id === type.id && (
                      <CheckCircle2 size={15} className="text-brand-navy flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatPrice(type.base_price)} · {type.estimated_days} días
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Property data */}
          <div className="space-y-4">
            <h2 className="font-semibold text-ink">Datos del inmueble</h2>

            <div>
              <Label htmlFor="property_address">
                Dirección <span className="text-red-500">*</span>
              </Label>
              <Input
                id="property_address"
                placeholder="Av. Javier Prado 1234, Piso 5"
                className="mt-1.5 bg-white border-border focus:border-brand-gold h-11"
                {...form.register('property_address')}
              />
              {form.formState.errors.property_address && (
                <p className="text-destructive text-xs mt-1">
                  {form.formState.errors.property_address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_district">
                  Distrito <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.watch('property_district')}
                  onValueChange={(val) => form.setValue('property_district', val)}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-border h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERU_DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.property_district && (
                  <p className="text-destructive text-xs mt-1">
                    {form.formState.errors.property_district.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="property_value">Valor del inmueble (S/.)</Label>
                <Input
                  id="property_value"
                  type="number"
                  placeholder="350,000"
                  min="0"
                  step="1000"
                  className="mt-1.5 bg-white border-border h-11"
                  {...form.register('property_value', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Anterior
            </Button>
            <Button type="submit" disabled={!selectedType}>
              Continuar <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      )}

      {/* ── STEP 3: Summary & submit ── */}
      {step === 3 && selectedType && selectedNotaria && (
        <div className="space-y-4">
          <h2 className="font-semibold text-ink">Resumen del trámite</h2>

          {/* Notaria */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1.5">Notaría seleccionada</div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-navy/10 flex items-center justify-center">
                <Building2 size={16} className="text-brand-navy" />
              </div>
              <div>
                <div className="font-semibold text-ink text-sm">
                  {selectedNotaria.notaria_name ?? selectedNotaria.full_name}
                </div>
                {selectedNotaria.notaria_address && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {selectedNotaria.notaria_address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">Tipo de trámite</div>
            <div className="font-semibold text-ink">{selectedType.display_name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">
              ~{selectedType.estimated_days} días hábiles
            </div>
          </div>

          {/* Property */}
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">Inmueble</div>
            <div className="font-medium text-ink">{form.watch('property_address')}</div>
            <div className="text-sm text-muted-foreground">{form.watch('property_district')}</div>
            {form.watch('property_value') ? (
              <div className="text-sm text-muted-foreground">
                Valor: {formatPrice(form.watch('property_value')!)}
              </div>
            ) : null}
          </div>

          {/* Price */}
          <PriceBreakdown basePrice={selectedType.base_price} tier={brokerTier} />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPriceMatchOpen(true)}
              className="text-sm text-brand-navy underline-offset-2 hover:underline order-2 sm:order-1"
            >
              Tengo una cotización más baja
            </button>
            <div className="flex gap-3 order-1 sm:order-2 sm:ml-auto">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Anterior
              </Button>
              <Button onClick={handleSubmitTramite} disabled={submitting}>
                {submitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
                {submitting ? 'Solicitando...' : 'Solicitar trámite'}
              </Button>
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
