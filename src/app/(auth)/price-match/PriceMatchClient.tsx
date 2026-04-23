'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CardSkeleton } from '@/components/shared/SkeletonCard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  PlusCircle,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { priceMatchFormSchema, type PriceMatchFormInput } from '@/lib/validations'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { TramiteType, PriceMatchStatus } from '@/types/database'
import { type PriceMatchRow } from './PriceMatchHistoryList'

const PriceMatchHistoryList = dynamic(() => import('./PriceMatchHistoryList'), {
  loading: () => (
    <div className="space-y-3">
      {[1, 2].map((i) => <CardSkeleton key={i} />)}
    </div>
  ),
})

const HOW_IT_WORKS_STEPS = [
  { step: '1', label: 'Envía cotización' },
  { step: '2', label: 'Verificamos' },
  { step: '3', label: 'Aplicamos el precio' },
]

type FormValues = PriceMatchFormInput & { notes?: string }

export default function PriceMatchPage() {
  const { user, loading: authLoading } = useAuth()
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [requests, setRequests] = useState<PriceMatchRow[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(priceMatchFormSchema),
  })

  useEffect(() => {
    const fetchTramiteTypes = async () => {
      const { data } = await supabase
        .from('tramite_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name')
      setTramiteTypes((data ?? []) as TramiteType[])
    }
    fetchTramiteTypes()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchRequests = async () => {
      setRequestsLoading(true)
      const { data } = await supabase
        .from('price_match_requests')
        .select('*, tramite_types(id, name, display_name, base_price, estimated_days, required_documents, is_active, created_at, description)')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false })
      setRequests((data ?? []) as PriceMatchRow[])
      setRequestsLoading(false)
    }
    fetchRequests()
  }, [user, submitted])

  const onSubmit = async (values: FormValues) => {
    if (!user) return

    let evidenceUrl: string | null = null

    if (evidenceFile) {
      setUploading(true)
      const timestamp = Date.now()
      const safeName = evidenceFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${user.id}/${timestamp}-${safeName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('price-match-evidence')
        .upload(filePath, evidenceFile, { upsert: false })

      setUploading(false)

      if (uploadError) {
        toast.error('Error al subir la evidencia. Intenta de nuevo.')
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('price-match-evidence')
        .getPublicUrl(uploadData.path)
      evidenceUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('price_match_requests').insert({
      broker_id: user.id,
      tramite_type_id: values.tramite_type_id,
      competitor_name: values.competitor_name,
      competitor_price: values.competitor_price,
      evidence_url: evidenceUrl,
      status: 'pending' as PriceMatchStatus,
      our_matched_price: null,
      reviewed_at: null,
    } as never)

    if (error) {
      toast.error('Error al enviar la solicitud. Intenta de nuevo.')
      return
    }

    toast.success('Solicitud enviada correctamente.')
    setSubmitted(true)
    reset()
    setEvidenceFile(null)
  }

  const handleNewRequest = () => {
    setSubmitted(false)
    reset()
    setEvidenceFile(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-white tracking-tight">Price Match</h1>
        <p className="text-white/50 text-sm mt-1">
          ¿Encontraste un precio más bajo? Lo igualamos.
        </p>
      </div>

      {/* ── How it works banner ── */}
      <div className="bg-white/7 rounded-2xl p-5 border border-white/8">
        <p className="text-sm text-white/75 font-medium mb-4">
          Encuentra un precio más bajo en otra notaría. Lo igualamos. Envíanos la cotización y
          respondemos en máximo{' '}
          <span className="font-semibold text-[#2855E0]">24 horas</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white/70">{s.step}</span>
                </div>
                <span className="text-sm font-medium text-white/80">{s.label}</span>
              </div>
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <ChevronRight
                  size={16}
                  className="text-white/25 mx-1 hidden sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Request form ── */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-6">
        <h2 className="text-base font-semibold text-[#18181B] mb-5">Nueva solicitud de price match</h2>

        {submitted ? (
          <div aria-live="polite" aria-atomic="true" className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2855E0]/10 border border-[#2855E0]/20 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#2855E0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#18181B] mb-1">
              Solicitud enviada
            </h3>
            <p className="text-sm text-[#18181B]/50 max-w-sm mb-6">
              Responderemos en máximo 24 horas. Recibirás una notificación cuando revisemos tu
              solicitud.
            </p>
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 bg-[#2855E0] text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-[#1E46C7] transition-colors motion-reduce:transition-none"
            >
              <PlusCircle size={16} />
              Crear nueva solicitud
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tramite type */}
            <div className="space-y-1.5">
              <Label htmlFor="tramite_type_id" className="text-[#18181B] font-medium">
                Tipo de trámite <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(val) =>
                  setValue('tramite_type_id', val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="tramite_type_id" className={cn('rounded-xl border-[#18181B]/15', errors.tramite_type_id && 'border-red-400')}>
                  <SelectValue placeholder="Selecciona el tipo de trámite" />
                </SelectTrigger>
                <SelectContent>
                  {tramiteTypes.length === 0 ? (
                    <SelectItem value="__loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    tramiteTypes.map((tt) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        {tt.display_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.tramite_type_id && (
                <p className="text-xs text-red-500">{errors.tramite_type_id.message}</p>
              )}
            </div>

            {/* Competitor name */}
            <div className="space-y-1.5">
              <Label htmlFor="competitor_name" className="text-[#18181B] font-medium">
                Nombre de la notaría competidora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="competitor_name"
                placeholder="Ej: Notaría García y Asociados"
                {...register('competitor_name')}
                className={cn('rounded-xl border-[#18181B]/15', errors.competitor_name && 'border-red-400')}
              />
              {errors.competitor_name && (
                <p className="text-xs text-red-500">{errors.competitor_name.message}</p>
              )}
            </div>

            {/* Competitor price */}
            <div className="space-y-1.5">
              <Label htmlFor="competitor_price" className="text-[#18181B] font-medium">
                Precio cotizado (S/.) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7A9A] font-mono pointer-events-none">
                  S/.
                </span>
                <Input
                  id="competitor_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={cn('pl-10 font-mono tabular-nums rounded-xl border-[#18181B]/15', errors.competitor_price && 'border-red-400')}
                  onChange={(e) =>
                    setValue('competitor_price', parseFloat(e.target.value) || 0, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>
              {errors.competitor_price && (
                <p className="text-xs text-red-500">{errors.competitor_price.message}</p>
              )}
            </div>

            {/* Evidence file */}
            <div className="space-y-1.5">
              <Label htmlFor="evidence" className="text-[#18181B] font-medium">
                Evidencia{' '}
                <span className="text-[#6B7A9A] text-xs font-normal">(PDF o imagen, opcional)</span>
              </Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer hover:bg-[#18181B]/3',
                  evidenceFile ? 'border-[#2855E0]/40 bg-[#2855E0]/5' : 'border-[#18181B]/15'
                )}
                onClick={() => document.getElementById('evidence-input')?.click()}
              >
                <input
                  id="evidence-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setEvidenceFile(file)
                  }}
                />
                {evidenceFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={18} className="text-[#2855E0] shrink-0" />
                    <span className="text-sm font-medium text-[#18181B] truncate max-w-xs">
                      {evidenceFile.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <UploadCloud size={24} className="text-[#18181B]/30" />
                    <span className="text-sm text-[#18181B]/50">
                      Haz clic para subir la cotización
                    </span>
                    <span className="text-xs text-[#6B7A9A]">PDF, JPG, PNG — máx. 10 MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[#18181B] font-medium">
                Notas adicionales{' '}
                <span className="text-[#6B7A9A] text-xs font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Cualquier contexto adicional sobre la cotización..."
                rows={3}
                {...register('notes')}
                className="resize-none rounded-xl border-[#18181B]/15"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || uploading || authLoading}
              className="inline-flex items-center gap-2 bg-[#2855E0] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#1E46C7] transition-colors motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || uploading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>

      {/* ── Mis solicitudes previas ── */}
      <PriceMatchHistoryList requests={requests} requestsLoading={requestsLoading} />
    </div>
  )
}
