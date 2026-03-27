'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Search, CheckCircle2 } from 'lucide-react'
import type { TramiteType } from '@/types/database'

const schema = z.object({
  referral_code: z.string().min(1, 'Ingresa el código de referido'),
  tramite_type_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  final_price: z.number({ invalid_type_error: 'Precio inválido' }).positive(),
  client_dni: z.string().length(8, 'DNI: 8 dígitos').regex(/^\d{8}$/),
  client_name: z.string().min(2, 'Ingresa el nombre'),
})

type FormValues = z.infer<typeof schema>

interface BrokerResult {
  id: string
  full_name: string
  email: string
}

export default function NuevoBrokerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [foundBroker, setFoundBroker] = useState<BrokerResult | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedTypeId = watch('tramite_type_id')
  const referralCode = watch('referral_code')

  useEffect(() => {
    supabase
      .from('tramite_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name')
      .then(({ data, error }) => {
        if (error) { toast.error('Error al cargar tipos de trámite'); return }
        setTramiteTypes((data ?? []) as TramiteType[])
      })
  }, [])

  useEffect(() => {
    if (!selectedTypeId) return
    const type = tramiteTypes.find(t => t.id === selectedTypeId)
    if (type) setValue('final_price', type.base_price)
  }, [selectedTypeId, tramiteTypes])

  const lookupBroker = async () => {
    if (!referralCode) return
    setLookingUp(true)
    setFoundBroker(null)
    const { data, error } = await supabase
      .from('brokers')
      .select('id, full_name, email')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .single()
    setLookingUp(false)
    if (error || !data) {
      toast.error('Código de broker no encontrado')
      return
    }
    setFoundBroker(data as BrokerResult)
  }

  const onSubmit = async (values: FormValues) => {
    if (!foundBroker) { toast.error('Busca el código de broker primero'); return }
    setSubmitting(true)
    try {
      const refCode = 'TC-' + Math.random().toString(36).toUpperCase().slice(2, 8)
      const type = tramiteTypes.find(t => t.id === values.tramite_type_id)
      if (!type) { toast.error('Tipo de trámite no encontrado'); return }

      const { data: tramite, error } = await supabase
        .from('tramites')
        .insert({
          broker_id: foundBroker.id,
          tramite_type_id: values.tramite_type_id,
          reference_code: refCode,
          status: 'solicitado',
          quoted_price: type.base_price,
          discount_applied: 0,
          final_price: values.final_price,
          price_matched: false,
          parties: [{
            name: values.client_name,
            dni: values.client_dni,
            role: 'comprador',
            email: '',
            phone: '',
          }],
          documents: [],
          commission_cashout_id: null,
        })
        .select('id')
        .single()

      if (error) { toast.error(error.message); return }
      toast.success('Trámite creado para broker ' + foundBroker.full_name + ' — ' + refCode)
      router.push('/admin/tramites/' + tramite.id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar trámite de broker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Para clientes que llegan a la notaría con un código de broker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Código de referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="TC-ABC123"
              {...register('referral_code')}
              className="uppercase"
            />
            <Button type="button" variant="outline" onClick={lookupBroker} disabled={lookingUp}>
              <Search size={15} className="mr-1" />
              {lookingUp ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {errors.referral_code && (
            <p className="text-xs text-destructive">{errors.referral_code.message}</p>
          )}
          {foundBroker && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={15} />
              <span><strong>{foundBroker.full_name}</strong> — {foundBroker.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del trámite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Tipo de trámite</Label>
              <Select onValueChange={v => setValue('tramite_type_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tramiteTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.display_name} — {formatPrice(t.base_price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tramite_type_id && <p className="text-xs text-destructive">{errors.tramite_type_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Precio (S/.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/.</span>
                <Input type="number" min={0} step={0.01} className="pl-10" {...register('final_price', { valueAsNumber: true })} />
              </div>
              {errors.final_price && <p className="text-xs text-destructive">{errors.final_price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>DNI del cliente</Label>
              <Input type="text" maxLength={8} placeholder="12345678" {...register('client_dni')} />
              {errors.client_dni && <p className="text-xs text-destructive">{errors.client_dni.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Nombre del cliente</Label>
              <Input type="text" placeholder="Juan Pérez" {...register('client_name')} />
              {errors.client_name && <p className="text-xs text-destructive">{errors.client_name.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-navy text-parchment hover:bg-brand-navy-light"
              disabled={submitting || !foundBroker}
            >
              {submitting ? 'Registrando...' : 'Registrar trámite'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
