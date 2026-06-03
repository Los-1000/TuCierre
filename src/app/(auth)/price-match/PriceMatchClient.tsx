'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, PlusCircle, UploadCloud, FileText, ChevronRight, GitCompare } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { priceMatchFormSchema, type PriceMatchFormInput } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import type { PriceMatchRow } from './PriceMatchHistoryList'
import PriceMatchHistoryList from './PriceMatchHistoryList'

type FormValues = PriceMatchFormInput & { notes?: string }

const MOCK_TRAMITE_TYPES = [
  { id: 'compraventa', display_name: 'Compraventa' },
  { id: 'hipoteca', display_name: 'Hipoteca' },
  { id: 'donacion', display_name: 'Donación' },
  { id: 'sucesion', display_name: 'Sucesión' },
]

const MOCK_REQUESTS: PriceMatchRow[] = [
  {
    id: '1', broker_id: '1', tramite_type_id: 'compraventa', competitor_name: 'Notaría Gómez & Asociados',
    competitor_price: 950, our_matched_price: 900, status: 'approved', evidence_url: null,
    reviewed_at: '2024-05-18T15:00:00', created_at: '2024-05-15T10:00:00',
    tramite_types: { id: 'compraventa', display_name: 'Compraventa', name: 'COMPRAVENTA', base_price: 1200, estimated_days: 5, required_documents: [], is_active: true, created_at: '', description: null },
  },
  {
    id: '2', broker_id: '1', tramite_type_id: 'hipoteca', competitor_name: 'Notaría del Centro Lima',
    competitor_price: 800, our_matched_price: null, status: 'pending', evidence_url: null,
    reviewed_at: null, created_at: '2024-05-22T09:00:00',
    tramite_types: { id: 'hipoteca', display_name: 'Hipoteca', name: 'HIPOTECA', base_price: 900, estimated_days: 5, required_documents: [], is_active: true, created_at: '', description: null },
  },
]

function isMockMode() {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('mock-demo-token') || document.cookie.includes('mock-superadmin-token')
}

export default function PriceMatchClient() {
  const { broker: user, loading: authLoading } = useAuth()
  const [tramiteTypes, setTramiteTypes] = useState(MOCK_TRAMITE_TYPES)
  const [requests, setRequests] = useState<PriceMatchRow[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(priceMatchFormSchema) })

  useEffect(() => {
    if (isMockMode()) {
      setTramiteTypes(MOCK_TRAMITE_TYPES)
      setRequests(MOCK_REQUESTS)
      setRequestsLoading(false)
      return
    }
    const loadData = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: types } = await supabase.from('tramite_types').select('*').eq('is_active', true).order('display_name')
      setTramiteTypes((types ?? []) as any)
      if (user) {
        const { data: reqs } = await supabase
          .from('price_match_requests')
          .select('*, tramite_types(id, name, display_name, base_price, estimated_days, required_documents, is_active, created_at, description)')
          .eq('broker_id', user.id)
          .order('created_at', { ascending: false })
        setRequests((reqs ?? []) as PriceMatchRow[])
      }
      setRequestsLoading(false)
    }
    if (!authLoading) loadData()
  }, [user, authLoading, submitted])

  const onSubmit = async (values: FormValues) => {
    if (isMockMode()) {
      await new Promise(r => setTimeout(r, 800))
      toast.success('Solicitud enviada correctamente.')
      setSubmitted(true)
      reset()
      setEvidenceFile(null)
      setSelectedType('')
      return
    }
    if (!user) return
    let evidenceUrl: string | null = null
    if (evidenceFile) {
      setUploading(true)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const safeName = evidenceFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('price-match-evidence')
        .upload(`${user.id}/${Date.now()}-${safeName}`, evidenceFile, { upsert: false })
      setUploading(false)
      if (uploadError) { toast.error('Error al subir la evidencia.'); return }
      const { data: urlData } = supabase.storage.from('price-match-evidence').getPublicUrl(uploadData.path)
      evidenceUrl = urlData.publicUrl
    }
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.from('price_match_requests').insert({
      broker_id: user.id, tramite_type_id: values.tramite_type_id,
      competitor_name: values.competitor_name, competitor_price: values.competitor_price,
      evidence_url: evidenceUrl, status: 'pending', our_matched_price: null, reviewed_at: null,
    } as never)
    if (error) { toast.error('Error al enviar la solicitud.'); return }
    toast.success('Solicitud enviada correctamente.')
    setSubmitted(true)
    reset()
    setEvidenceFile(null)
    setSelectedType('')
  }

  const handleNewRequest = () => { setSubmitted(false); reset(); setEvidenceFile(null); setSelectedType('') }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-inter tracking-tight">Price Match</h1>
          <p className="text-navy-400 text-sm mt-0.5">¿Encontraste un precio más bajo? Lo igualamos en 24 h.</p>
        </div>
        <div className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-white border border-navy-100">
          <GitCompare size={18} style={{ color: '#2c4dfb' }} />
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-navy-100 p-5">
        <p className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-4">¿Cómo funciona?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {[
            { n: '1', title: 'Envía la cotización', desc: 'Compártenos el precio que encontraste y el nombre de la notaría.' },
            { n: '2', title: 'Lo verificamos', desc: 'Revisamos tu solicitud en máximo 24 horas hábiles.' },
            { n: '3', title: 'Aplicamos el precio', desc: 'Si procede, aplicamos el precio igualado a tu trámite.' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-start gap-3 flex-1">
              {i > 0 && <ChevronRight size={16} className="text-navy-200 mt-3.5 shrink-0 hidden sm:block" />}
              <div className="flex-1 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5" style={{ background: '#eff2ff', color: '#2c4dfb' }}>
                  {s.n}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">{s.title}</div>
                  <div className="text-xs text-navy-400 mt-0.5 leading-relaxed">{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-navy-100 p-5">
        <h2 className="text-sm font-bold text-navy-900 mb-5">Nueva solicitud</h2>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#eff2ff' }}>
              <CheckCircle2 size={28} style={{ color: '#2c4dfb' }} />
            </div>
            <h3 className="text-base font-bold text-navy-900 mb-1">¡Solicitud enviada!</h3>
            <p className="text-sm text-navy-400 max-w-xs mb-6">
              Revisaremos tu solicitud en máximo 24 horas. Te notificaremos cuando tengamos una respuesta.
            </p>
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-colors"
              style={{ background: '#2c4dfb' }}
            >
              <PlusCircle size={15} />
              Nueva solicitud
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tramite type */}
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Tipo de trámite <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setValue('tramite_type_id', e.target.value, { shouldValidate: true }) }}
                className="w-full h-9 px-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 outline-none focus:border-blue-400"
                style={errors.tramite_type_id ? { borderColor: '#dc2626' } : {}}
              >
                <option value="">Selecciona el tipo de trámite</option>
                {tramiteTypes.map((tt) => (
                  <option key={tt.id} value={tt.id}>{tt.display_name}</option>
                ))}
              </select>
              {errors.tramite_type_id && <p className="text-xs text-red-500 mt-1">{errors.tramite_type_id.message}</p>}
            </div>

            {/* Competitor name + price — 2 col */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Notaría competidora <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Notaría García"
                  {...register('competitor_name')}
                  className="w-full h-9 px-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 outline-none focus:border-blue-400"
                  style={errors.competitor_name ? { borderColor: '#dc2626' } : {}}
                />
                {errors.competitor_name && <p className="text-xs text-red-500 mt-1">{errors.competitor_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                  Precio cotizado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy-400 font-mono pointer-events-none">S/.</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full h-9 pl-9 pr-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 font-mono outline-none focus:border-blue-400"
                    style={errors.competitor_price ? { borderColor: '#dc2626' } : {}}
                    onChange={(e) => setValue('competitor_price', parseFloat(e.target.value) || 0, { shouldValidate: true })}
                  />
                </div>
                {errors.competitor_price && <p className="text-xs text-red-500 mt-1">{errors.competitor_price.message}</p>}
              </div>
            </div>

            {/* Evidence upload */}
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Evidencia <span className="text-navy-300 font-normal">(PDF o imagen, opcional)</span>
              </label>
              <div
                className="border border-dashed border-navy-200 rounded-lg p-4 text-center cursor-pointer transition-colors hover:bg-navy-50"
                style={evidenceFile ? { borderColor: '#2c4dfb', background: '#f5f7ff' } : {}}
                onClick={() => document.getElementById('evidence-input')?.click()}
              >
                <input
                  id="evidence-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                />
                {evidenceFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={16} style={{ color: '#2c4dfb' }} />
                    <span className="text-sm font-medium text-navy-900 truncate max-w-xs">{evidenceFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEvidenceFile(null) }}
                      className="text-xs text-navy-400 hover:text-red-500 ml-1"
                    >✕</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <UploadCloud size={20} className="text-navy-300" />
                    <span className="text-sm text-navy-500">Haz clic para subir la cotización</span>
                    <span className="text-xs text-navy-300">PDF, JPG, PNG — máx. 10 MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Notas adicionales <span className="text-navy-300 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Cualquier contexto adicional sobre la cotización..."
                {...register('notes')}
                className="w-full px-3 py-2 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-navy-400">Respondemos en máx. <span className="font-semibold text-navy-600">24 horas</span></p>
              <button
                type="submit"
                disabled={isSubmitting || uploading || authLoading}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white disabled:opacity-50 transition-colors"
                style={{ background: '#2c4dfb' }}
              >
                {isSubmitting || uploading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History */}
      <PriceMatchHistoryList requests={requests} requestsLoading={requestsLoading} />
    </div>
  )
}
