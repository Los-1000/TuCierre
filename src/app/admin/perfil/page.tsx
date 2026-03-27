'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Building2, MapPin, User, Mail, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  notaria_name: z.string().min(2, 'Nombre de notaría requerido'),
  notaria_address: z.string().min(5, 'Dirección requerida'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AdminPerfilPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')

      const { data: brokerRaw } = await supabase
        .from('brokers')
        .select('full_name, notaria_name, notaria_address, phone')
        .eq('id', user.id)
        .single()
      const broker = brokerRaw as { full_name: string; notaria_name: string | null; notaria_address: string | null; phone: string } | null

      if (broker) {
        reset({
          full_name: broker.full_name ?? '',
          notaria_name: broker.notaria_name ?? '',
          notaria_address: broker.notaria_address ?? '',
          phone: broker.phone ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('brokers')
      .update({
        full_name: data.full_name,
        notaria_name: data.notaria_name,
        notaria_address: data.notaria_address,
        phone: data.phone ?? null,
      } as never)
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      toast.error('Error al guardar los cambios')
    } else {
      toast.success('Perfil de notaría actualizado')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-brand-navy" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil de Notaría</h1>
        <p className="text-sm text-gray-500 mt-1">
          Esta información aparecerá cuando los brokers seleccionen una notaría al crear un trámite.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email (read-only) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User size={15} /> Cuenta
          </h2>
          <div>
            <Label className="text-sm text-gray-600">
              <Mail size={13} className="inline mr-1.5 opacity-60" />
              Email
            </Label>
            <Input
              value={email}
              disabled
              className="mt-1.5 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Personal */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User size={15} /> Datos personales
          </h2>
          <div>
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              className="mt-1.5"
              placeholder="Juan Pérez García"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              className="mt-1.5"
              placeholder="+51 999 123 456"
              {...register('phone')}
            />
          </div>
        </div>

        {/* Notaria info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Building2 size={15} /> Información de la notaría
          </h2>
          <div>
            <Label htmlFor="notaria_name">
              Nombre de la notaría <span className="text-red-500">*</span>
            </Label>
            <Input
              id="notaria_name"
              className="mt-1.5"
              placeholder="Notaría García & Asociados"
              {...register('notaria_name')}
            />
            {errors.notaria_name && (
              <p className="text-red-500 text-xs mt-1">{errors.notaria_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="notaria_address">
              <MapPin size={13} className="inline mr-1 opacity-60" />
              Dirección <span className="text-red-500">*</span>
            </Label>
            <Input
              id="notaria_address"
              className="mt-1.5"
              placeholder="Av. Javier Prado Este 1234, San Isidro, Lima"
              {...register('notaria_address')}
            />
            {errors.notaria_address && (
              <p className="text-red-500 text-xs mt-1">{errors.notaria_address.message}</p>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Esta dirección será visible para los brokers que seleccionen tu notaría.
          </p>
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving
            ? <><Loader2 size={14} className="animate-spin mr-2" /> Guardando...</>
            : <><Save size={14} className="mr-2" /> Guardar cambios</>
          }
        </Button>
      </form>
    </div>
  )
}
