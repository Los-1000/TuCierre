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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Fetch tramite types and existing requests
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

    // Upload evidence file if provided
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
        <h1 className="text-2xl font-bold text-slate-900">Price Match</h1>
        <p className="text-slate-500 text-sm mt-1">
          Encontraste un precio más bajo? Lo igualamos.
        </p>
      </div>

      {/* ── Section 1: How it works banner ── */}
      <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
        <p className="text-sm text-slate-700 font-medium mb-4">
          Encuentra un precio más bajo en otra notaría? Lo igualamos. Envíanos la cotización y
          respondemos en máximo{' '}
          <span className="font-semibold text-accent">2 horas</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-accent">{s.step}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
              </div>
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <ChevronRight
                  size={16}
                  className="text-slate-400 mx-1 hidden sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Request form or success state ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nueva solicitud de price match</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Solicitud enviada
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Responderemos en máximo 2 horas. Recibirás una notificación cuando revisemos tu
                solicitud.
              </p>
              <Button
                variant="default"
                className="bg-accent hover:bg-accent/90"
                onClick={handleNewRequest}
              >
                <PlusCircle size={16} />
                Crear nueva solicitud
              </Button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Tramite type */}
              <div className="space-y-1.5">
                <Label htmlFor="tramite_type_id">
                  Tipo de trámite <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) =>
                    setValue('tramite_type_id', val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="tramite_type_id" className={cn(errors.tramite_type_id && 'border-red-400')}>
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
                <Label htmlFor="competitor_name">
                  Nombre de la notaría competidora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="competitor_name"
                  placeholder="Ej: Notaría García y Asociados"
                  {...register('competitor_name')}
                  className={cn(errors.competitor_name && 'border-red-400')}
                />
                {errors.competitor_name && (
                  <p className="text-xs text-red-500">{errors.competitor_name.message}</p>
                )}
              </div>

              {/* Competitor price */}
              <div className="space-y-1.5">
                <Label htmlFor="competitor_price">
                  Precio cotizado (S/.) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono pointer-events-none">
                    S/.
                  </span>
                  <Input
                    id="competitor_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={cn('pl-10 font-mono tabular-nums', errors.competitor_price && 'border-red-400')}
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
                <Label htmlFor="evidence">
                  Evidencia{' '}
                  <span className="text-slate-400 text-xs font-normal">(PDF o imagen, opcional)</span>
                </Label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer hover:bg-slate-50',
                    evidenceFile ? 'border-accent/50 bg-accent/5' : 'border-slate-200'
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
                      <FileText size={18} className="text-accent shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate max-w-xs">
                        {evidenceFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud size={24} className="text-slate-400" />
                      <span className="text-sm text-slate-500">
                        Haz clic para subir la cotización
                      </span>
                      <span className="text-xs text-slate-400">PDF, JPG, PNG — máx. 10 MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">
                  Notas adicionales{' '}
                  <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Cualquier contexto adicional sobre la cotización..."
                  rows={3}
                  {...register('notes')}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || uploading || authLoading}
                className="w-full sm:w-auto"
              >
                {isSubmitting || uploading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Mis solicitudes previas ── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Mis solicitudes previas</h2>

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
                <Card key={req.id} className="shadow-sm border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">
                          {req.tramite_types?.display_name ?? 'Trámite notarial'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
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

                    {/* Approved price */}
                    {req.status === 'approved' && req.our_matched_price != null && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-green-600 font-medium mb-0.5">
                            Precio igualado
                          </div>
                          <div className="text-xl font-bold text-green-700 tabular-nums font-mono">
                            {formatPrice(req.our_matched_price)}
                          </div>
                        </div>
                        <CheckCircle2 size={28} className="text-green-400 shrink-0" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Notaría competidora</span>
                        <div className="font-medium text-slate-700 mt-0.5">
                          {req.competitor_name}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Precio cotizado</span>
                        <div className="font-semibold text-slate-900 tabular-nums font-mono mt-0.5">
                          {formatPrice(req.competitor_price)}
                        </div>
                      </div>
                      {req.reviewed_at && (
                        <div>
                          <span className="text-slate-400">Revisado</span>
                          <div className="font-medium text-slate-700 mt-0.5">
                            {formatDate(req.reviewed_at)}
                          </div>
                        </div>
                      )}
                      {req.evidence_url && (
                        <div>
                          <span className="text-slate-400">Evidencia</span>
                          <div className="mt-0.5">
                            <a
                              href={req.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                            >
                              Ver documento
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
