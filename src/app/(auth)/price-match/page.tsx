'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
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
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonCard'
import type { TramiteType, PriceMatchRequest, PriceMatchStatus } from '@/types/database'

const STATUS_CONFIG: Record<PriceMatchStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Aprobado',   className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rechazado',  className: 'bg-red-50 text-red-700 border-red-200' },
}

const HOW_IT_WORKS_STEPS = [
  { step: '1', label: 'Envía cotización' },
  { step: '2', label: 'Verificamos' },
  { step: '3', label: 'Aplicamos el precio' },
]

type FormValues = PriceMatchFormInput & { notes?: string }

type PriceMatchRow = PriceMatchRequest & {
  tramite_types?: TramiteType | null
}

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
      const filePath = `${user.id}/${timestamp}-${evidenceFile.name}`
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
        <h1 className="text-2xl font-bold text-[#18181B]">Price Match</h1>
        <p className="text-[#18181B]/50 text-sm mt-1">
          ¿Encontraste un precio más bajo? Lo igualamos.
        </p>
      </div>

      {/* ── How it works banner ── */}
      <div className="bg-[#18181B]/5 rounded-3xl p-5">
        <p className="text-sm text-[#18181B] font-medium mb-4">
          Encuentra un precio más bajo en otra notaría. Lo igualamos. Envíanos la cotización y
          respondemos en máximo{' '}
          <span className="font-semibold text-[#D47151]">2 horas</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#D47151]/20 border border-[#D47151]/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#D47151]">{s.step}</span>
                </div>
                <span className="text-sm font-medium text-[#18181B]">{s.label}</span>
              </div>
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <ChevronRight
                  size={16}
                  className="text-[#18181B]/30 mx-1 hidden sm:block"
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
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D47151]/10 border border-[#D47151]/20 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#D47151]" />
            </div>
            <h3 className="text-lg font-semibold text-[#18181B] mb-1">
              Solicitud enviada
            </h3>
            <p className="text-sm text-[#18181B]/50 max-w-sm mb-6">
              Responderemos en máximo 2 horas. Recibirás una notificación cuando revisemos tu
              solicitud.
            </p>
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 bg-[#D47151] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#A6553A] transition-colors"
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]/40 font-mono pointer-events-none">
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
                <span className="text-[#18181B]/40 text-xs font-normal">(PDF o imagen, opcional)</span>
              </Label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer hover:bg-[#18181B]/3',
                  evidenceFile ? 'border-[#D47151]/40 bg-[#D47151]/5' : 'border-[#18181B]/15'
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
                    <FileText size={18} className="text-[#D47151] shrink-0" />
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
                    <span className="text-xs text-[#18181B]/30">PDF, JPG, PNG — máx. 10 MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[#18181B] font-medium">
                Notas adicionales{' '}
                <span className="text-[#18181B]/40 text-xs font-normal">(opcional)</span>
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
              className="inline-flex items-center gap-2 bg-[#18181B] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#18181B]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || uploading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>

      {/* ── Mis solicitudes previas ── */}
      <div>
        <h2 className="text-lg font-semibold text-[#18181B] mb-4">Mis solicitudes previas</h2>

        {requestsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Sin solicitudes aún"
            description="Cuando envíes una solicitud de price match, aparecerá aquí con su estado actual."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusConf = STATUS_CONFIG[req.status]
              return (
                <div key={req.id} className="rounded-3xl border border-[#18181B]/8 bg-white p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-[#18181B] text-sm truncate">
                        {req.tramite_types?.display_name ?? 'Trámite notarial'}
                      </div>
                      <div className="text-xs text-[#18181B]/40 mt-0.5">
                        Enviado {formatDate(req.created_at)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border shrink-0',
                        statusConf.className
                      )}
                    >
                      {statusConf.label}
                    </span>
                  </div>

                  {req.status === 'approved' && req.our_matched_price != null && (
                    <div className="bg-[#D47151]/8 border border-[#D47151]/20 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[#D47151] font-medium mb-0.5">
                          Precio igualado
                        </div>
                        <div className="text-xl font-bold text-[#D47151] tabular-nums font-mono">
                          {formatPrice(req.our_matched_price)}
                        </div>
                      </div>
                      <CheckCircle2 size={28} className="text-[#D47151] shrink-0" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#18181B]/60">
                    <div>
                      <span className="text-[#18181B]/40">Notaría competidora</span>
                      <div className="font-medium text-[#18181B] mt-0.5">
                        {req.competitor_name}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#18181B]/40">Precio cotizado</span>
                      <div className="font-semibold text-[#18181B] tabular-nums font-mono mt-0.5">
                        {formatPrice(req.competitor_price)}
                      </div>
                    </div>
                    {req.reviewed_at && (
                      <div>
                        <span className="text-[#18181B]/40">Revisado</span>
                        <div className="font-medium text-[#18181B] mt-0.5">
                          {formatDate(req.reviewed_at)}
                        </div>
                      </div>
                    )}
                    {req.evidence_url && (
                      <div>
                        <span className="text-[#18181B]/40">Evidencia</span>
                        <div className="mt-0.5">
                          <a
                            href={req.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#D47151] hover:underline font-medium"
                          >
                            Ver documento
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
