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
import { UserPlus } from 'lucide-react'
import type { TramiteType } from '@/types/database'

const schema = z.object({
  tramite_type_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  final_price: z.number({ invalid_type_error: 'Ingresa un precio válido' }).positive('El precio debe ser mayor a 0'),
  client_dni: z.string().length(8, 'El DNI debe tener 8 dígitos').regex(/^\d{8}$/, 'Solo dígitos'),
  client_name: z.string().min(2, 'Ingresa el nombre del cliente'),
})

type FormValues = z.infer<typeof schema>

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedTypeId = watch('tramite_type_id')

  useEffect(() => {
    supabase
      .from('tramite_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name')
      .then(({ data }) => setTramiteTypes((data ?? []) as TramiteType[]))
  }, [])

  // Auto-fill price when type changes
  useEffect(() => {
    if (!selectedTypeId) return
    const type = tramiteTypes.find(t => t.id === selectedTypeId)
    if (type) setValue('final_price', type.base_price)
  }, [selectedTypeId, tramiteTypes])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('No autenticado'); return }

      // Generate reference code
      const refCode = 'TC-' + Math.random().toString(36).toUpperCase().slice(2, 8)

      const type = tramiteTypes.find(t => t.id === values.tramite_type_id)!
      const { data: tramite, error: tramiteError } = await supabase
        .from('tramites')
        .insert({
          broker_id: user.id,
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

      if (tramiteError) { toast.error(tramiteError.message); return }

      toast.success('Cliente registrado — trámite ' + refCode)
      router.push('/tramites/' + tramite.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <UserPlus size={22} /> Registrar cliente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Crea un trámite para tu cliente. Aparecerá en tu lista para seguimiento en tiempo real.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del trámite</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tipo de trámite */}
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
              {errors.tramite_type_id && (
                <p className="text-xs text-destructive">{errors.tramite_type_id.message}</p>
              )}
            </div>

            {/* Precio */}
            <div className="space-y-1.5">
              <Label>Precio (S/.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">S/.</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="pl-10"
                  placeholder="0.00"
                  {...register('final_price', { valueAsNumber: true })}
                />
              </div>
              {errors.final_price && (
                <p className="text-xs text-destructive">{errors.final_price.message}</p>
              )}
            </div>

            {/* DNI */}
            <div className="space-y-1.5">
              <Label>DNI del cliente</Label>
              <Input
                type="text"
                maxLength={8}
                placeholder="12345678"
                {...register('client_dni')}
              />
              {errors.client_dni && (
                <p className="text-xs text-destructive">{errors.client_dni.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label>Nombre del cliente</Label>
              <Input
                type="text"
                placeholder="Juan Pérez"
                {...register('client_name')}
              />
              {errors.client_name && (
                <p className="text-xs text-destructive">{errors.client_name.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand-navy text-parchment hover:bg-brand-navy-light" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
