'use client'

import { useState, useEffect, useRef } from 'react'
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
import { UserPlus, Paperclip, X, FileText, Loader2 } from 'lucide-react'
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
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      .then(({ data, error }) => {
        if (error) { toast.error('Error al cargar tipos de trámite'); return }
        setTramiteTypes((data ?? []) as TramiteType[])
      })
  }, [])

  // Auto-fill price when type changes
  useEffect(() => {
    if (!selectedTypeId) return
    const type = tramiteTypes.find(t => t.id === selectedTypeId)
    if (type) setValue('final_price', type.base_price)
  }, [selectedTypeId, tramiteTypes])

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const oversized = picked.filter(f => f.size > 10 * 1024 * 1024)
    if (oversized.length > 0) {
      toast.error(`${oversized.length} archivo(s) superan 10 MB y no se agregaron.`)
    }
    const valid = picked.filter(f => f.size <= 10 * 1024 * 1024)
    setFiles(prev => [...prev, ...valid])
    // Reset input so the same file can be added again if needed
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('No autenticado'); return }

      const refCode = 'TC-' + Math.random().toString(36).toUpperCase().slice(2, 8)
      const type = tramiteTypes.find(t => t.id === values.tramite_type_id)
      if (!type) { toast.error('Tipo de trámite no encontrado'); return }

      // 1. Create tramite
      const { data: tramiteRaw, error: tramiteError } = await supabase
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
        } as never)
        .select('id')
        .single()
      const tramite = tramiteRaw as { id: string } | null

      if (tramiteError) { toast.error(tramiteError.message); return }

      // 2. Upload files if any
      if (files.length > 0) {
        const uploadedDocs: { name: string; url: string; uploaded_at: string; status: 'pending' }[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${tramite!.id}/doc-${i}-${safeName}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tramite-documents')
            .upload(path, file, { upsert: true })
          if (uploadError) {
            toast.error(`Error al subir "${file.name}": ${uploadError.message}`)
            continue
          }
          const { data: urlData } = supabase.storage
            .from('tramite-documents')
            .getPublicUrl(uploadData.path)
          uploadedDocs.push({
            name: file.name,
            url: urlData.publicUrl,
            uploaded_at: new Date().toISOString(),
            status: 'pending',
          })
        }

        // 3. Update tramite with documents
        if (uploadedDocs.length > 0) {
          await supabase
            .from('tramites')
            .update({ documents: uploadedDocs } as never)
            .eq('id', tramite!.id)
        }
      }

      toast.success('Cliente registrado — trámite ' + refCode)
      router.push('/tramites/' + tramite!.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-2">
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

            {/* Documentos */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label>Documentos <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-[#18181B] hover:text-[#2D2D30] font-medium transition-colors"
                >
                  <Paperclip size={13} />
                  Adjuntar
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={handleFilePick}
              />

              {files.length > 0 ? (
                <ul className="space-y-1.5">
                  {files.map((file, i) => (
                    <li key={i} className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                      <FileText size={14} className="text-muted-foreground shrink-0" />
                      <span className="text-sm text-[#18181B] truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        aria-label="Quitar documento"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:border-[#18181B]/40 hover:text-[#18181B] transition-colors"
                >
                  Haz clic para adjuntar documentos
                </button>
              )}
            </div>

            <Button type="submit" className="w-full bg-[#18181B] text-white hover:bg-[#2D2D30]" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
              {loading ? 'Registrando...' : 'Registrar cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
