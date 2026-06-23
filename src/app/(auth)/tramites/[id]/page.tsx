'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Info, Users, FileText, Upload, CheckCircle2, Clock, XCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/lib/api'
import { useTramiteStatusRealtime } from '@/hooks/useRealtime'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { ApiTramiteDetail, ApiUploadedDocument } from '@/types/api'

const STATUS_LABELS: Record<string, string> = {
  SOLICITADO: 'Solicitado', COTIZADO: 'Cotizado', DOCS_PENDIENTES: 'Docs. Pendientes',
  EN_REVISION: 'En Revisión', EN_FIRMA: 'En Firma', EN_REGISTRO: 'En Registro',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SOLICITADO: { bg: '#eff2ff', text: '#2c4dfb' }, COTIZADO: { bg: '#eff2ff', text: '#2c4dfb' },
  DOCS_PENDIENTES: { bg: '#fef9ee', text: '#b2832e' }, EN_REVISION: { bg: '#fff7ed', text: '#c2410c' },
  EN_FIRMA: { bg: '#ecfdf5', text: '#059669' }, EN_REGISTRO: { bg: '#f0fdf4', text: '#15803d' },
  COMPLETADO: { bg: '#f0fdf4', text: '#15803d' }, CANCELADO: { bg: '#fef2f2', text: '#dc2626' },
}

const STEPS = ['SOLICITADO', 'COTIZADO', 'DOCS_PENDIENTES', 'EN_REVISION', 'EN_FIRMA', 'EN_REGISTRO', 'COMPLETADO']

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export default function TramiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tramite, setTramite] = useState<ApiTramiteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'parties'>('info')
  const [docs, setDocs] = useState<ApiUploadedDocument[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [showRejection, setShowRejection] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingDocName = useRef<string | null>(null)

  useEffect(() => {
    const isMock = document.cookie.includes('mock-demo-token')
    if (isMock) {
      import('@/lib/server-api').then(({ getTramiteById }) =>
        getTramiteById('mock-demo-token', id)
      ).then((t) => {
        setTramite(t)
        setDocs(t?.documents ?? [])
      }).finally(() => setLoading(false))
      return
    }
    api.tramites.getById(Number(id)).then((t) => {
      setTramite(t)
      setDocs(t?.documents ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  useTramiteStatusRealtime(Number(id), (status) => {
    setTramite((prev) => prev ? { ...prev, statusTramite: status as any } : null)
    toast.info(`Estado actualizado: ${STATUS_LABELS[status] ?? status}`)
  })

  const triggerDocUpload = (docName: string) => {
    pendingDocName.current = docName
    fileInputRef.current?.click()
  }

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const docName = pendingDocName.current
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file || !docName) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10 MB.')
      return
    }
    setUploadingDoc(docName)
    try {
      const uploaded = await api.tramites.uploadDocument(Number(id), docName, file)
      setDocs((prev) => [...prev.filter((d) => d.name !== docName), uploaded])
      toast.success(`"${docName}" subido. Pendiente de revisión.`)
    } catch {
      toast.error('No se pudo subir el documento. Inténtalo de nuevo.')
    } finally {
      setUploadingDoc(null)
      pendingDocName.current = null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-navy-300" />
      </div>
    )
  }

  if (!tramite) return (
    <div className="text-center py-16">
      <p className="text-navy-400">Trámite no encontrado.</p>
      <Link href="/tramites" className="text-sm font-semibold mt-2 inline-block" style={{ color: '#2c4dfb' }}>Volver</Link>
    </div>
  )

  const colors = STATUS_COLORS[tramite.statusTramite] ?? { bg: '#f4f6fb', text: '#4a6da8' }
  const currentStep = STEPS.indexOf(tramite.statusTramite)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tramites" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-navy-100 text-navy-500 hover:bg-navy-50 transition-colors shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-navy-900 font-inter truncate">{tramite.tramiteType}</h1>
          <p className="text-xs text-navy-400 truncate">{tramite.propertyAddress ?? tramite.propertyDistrictAddress}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0" style={{ background: colors.bg, color: colors.text }}>
          {STATUS_LABELS[tramite.statusTramite] ?? tramite.statusTramite}
        </span>
      </div>

      {/* Progress stepper */}
      {tramite.statusTramite !== 'CANCELADO' && (
        <div className="bg-white rounded-xl border border-navy-100 px-4 py-4">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              const c = STATUS_COLORS[step] ?? { bg: '#f4f6fb', text: '#4a6da8' }
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={done ? { background: '#2c4dfb', color: 'white' } : active ? { background: c.bg, color: c.text, border: `2px solid ${c.text}` } : { background: '#f4f6fb', color: '#97aed4' }}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="text-[11px] text-navy-300 mt-1 text-center leading-tight hidden sm:block">
                      {STATUS_LABELS[step]?.split(' ')[0]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="h-px flex-1 mx-1" style={{ background: done ? '#2c4dfb' : '#e1e7f3' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-navy-100 rounded-xl p-1">
        {[
          { key: 'info', label: 'Información', icon: Info },
          { key: 'docs', label: 'Documentos', icon: FileText },
          { key: 'parties', label: 'Partes', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-colors"
            style={activeTab === key ? { background: '#0f1d3d', color: 'white' } : { color: '#4a6da8' }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-navy-100 p-5 space-y-3">
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">Detalles</h3>
            {[
              { label: 'Tipo', value: tramite.tramiteType },
              { label: 'Dirección', value: tramite.propertyAddress ?? '—' },
              { label: 'Distrito', value: tramite.propertyDistrictAddress ?? '—' },
              { label: 'Valor del inmueble', value: tramite.quotedPriceProperty != null ? formatPrice(tramite.quotedPriceProperty, tramite.currency) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 border-b border-navy-50 last:border-0">
                <span className="text-xs text-navy-400">{label}</span>
                <span className="text-xs font-medium text-navy-900">{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-navy-100 p-5 space-y-3">
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">Honorarios</h3>
            {[
              { label: 'Tarifa base', value: tramite.baseFee != null ? formatPrice(tramite.baseFee, tramite.currency) : '—' },
              { label: 'Adicional', value: tramite.additionalFee != null ? formatPrice(tramite.additionalFee, tramite.currency) : '—' },
              { label: 'Total final', value: tramite.finalFee != null ? formatPrice(tramite.finalFee, tramite.currency) : '—', bold: true },
            ].map(({ label, value, bold }) => (
              <div key={label} className={`flex justify-between py-1 border-b border-navy-50 last:border-0 ${bold ? 'pt-2 mt-1 border-t border-navy-100' : ''}`}>
                <span className={`text-xs ${bold ? 'font-semibold text-navy-700' : 'text-navy-400'}`}>{label}</span>
                <span className={`text-xs ${bold ? 'font-bold text-navy-900' : 'font-medium text-navy-900'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'docs' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleDocFileChange}
            aria-label="Subir documento"
          />
          {(tramite.requiredDocuments ?? []).length === 0 ? (
            <div className="bg-white rounded-xl border border-navy-100 p-8 text-center">
              <FileText size={26} className="text-navy-200 mx-auto mb-2" />
              <p className="text-navy-400 text-sm">Este trámite no requiere documentos.</p>
            </div>
          ) : (
            (tramite.requiredDocuments ?? []).map((req) => {
              const uploaded = docs.find((d) => d.name === req.name)
              const status = uploaded?.status
              const isUploading = uploadingDoc === req.name
              const cfg = !status
                ? { Icon: Circle, color: '#97aed4', label: 'Sin documento' }
                : status === 'approved'
                ? { Icon: CheckCircle2, color: '#059669', label: 'Aprobado' }
                : status === 'rejected'
                ? { Icon: XCircle, color: '#dc2626', label: 'Rechazado' }
                : { Icon: Clock, color: '#b2832e', label: 'Pendiente de revisión' }
              const StatusIcon = cfg.Icon
              const btnLabel = !status ? 'Subir' : status === 'rejected' ? 'Re-subir' : 'Reemplazar'

              return (
                <div key={req.name} className="bg-white rounded-xl border border-navy-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5" style={{ color: cfg.color }}>
                      <StatusIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{req.name}</p>
                      {req.description && (
                        <p className="text-xs text-navy-400 mt-0.5 leading-snug">{req.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                        {uploaded?.uploaded_at && status !== 'rejected' && (
                          <span className="text-[11px] text-navy-300">· {formatDay(uploaded.uploaded_at)}</span>
                        )}
                      </div>
                      {status === 'rejected' && uploaded?.rejection_note && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setShowRejection((v) => v === req.name ? null : req.name)}
                            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium"
                          >
                            {showRejection === req.name ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {showRejection === req.name ? 'Ocultar motivo' : 'Ver motivo de rechazo'}
                          </button>
                          {showRejection === req.name && (
                            <p className="mt-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 leading-relaxed">
                              {uploaded.rejection_note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {status !== 'approved' && (
                        <button
                          onClick={() => triggerDocUpload(req.name)}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition-opacity"
                          style={{ background: status === 'rejected' ? '#dc2626' : '#2c4dfb' }}
                        >
                          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          {isUploading ? 'Subiendo...' : btnLabel}
                        </button>
                      )}
                      {uploaded?.url && (
                        <a
                          href={uploaded.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: '#2c4dfb' }}
                        >
                          <FileText size={12} /> Ver
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Parties tab */}
      {activeTab === 'parties' && (
        <div className="bg-white rounded-xl border border-navy-100 p-5">
          <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-4">Partes del trámite</h3>
          {tramite.parties.length === 0 ? (
            <p className="text-navy-400 text-sm">No hay partes registradas.</p>
          ) : (
            <div className="space-y-3">
              {tramite.parties.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: '#2c4dfb' }}>
                    {p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-navy-900">{p.fullName}</div>
                    <div className="text-xs text-navy-400 capitalize">{p.role} · {p.idDocumentNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
