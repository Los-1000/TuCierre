'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import ChatWindow from '@/components/chat/ChatWindow'
import TramiteTimeline from '@/components/tramites/TramiteTimeline'
import { TRAMITE_STATUS_CONFIG } from '@/lib/constants'
import { formatPrice, formatDate, formatDateTime, generateInitials } from '@/lib/utils'
import { updateTramiteStatus, updateDocumentStatus } from '../actions'
import type { TramiteStatus } from '@/types/database'
import {
  ArrowLeft, Loader2, User, MapPin, FileText, CheckCircle2,
  XCircle, Clock, Building2, Phone, Mail, Award, ExternalLink,
  ChevronRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminTramite {
  id: string
  reference_code: string
  status: string
  quoted_price: number
  discount_applied: number
  final_price: number
  property_address: string | null
  property_district: string | null
  property_value: number | null
  parties: { name: string; dni: string; role: string; email?: string; phone?: string }[]
  documents: { name: string; url: string | null; uploaded_at: string | null; status: string; rejection_note?: string }[]
  notes: string | null
  estimated_completion: string | null
  created_at: string
  updated_at: string
  price_matched: boolean
  price_match_reference: string | null
  tramite_types: {
    display_name: string
    base_price: number
    estimated_days: number
    required_documents: { name: string; description?: string }[]
  } | null
  brokers: {
    id: string
    full_name: string
    email: string
    phone: string
    tier: string
    company_name: string | null
    total_tramites: number
    referral_code: string | null
  } | null
  tramite_status_history: {
    id: string
    status: string
    changed_by: string | null
    notes: string | null
    created_at: string
  }[]
}

const ALL_STATUSES = Object.keys(TRAMITE_STATUS_CONFIG) as TramiteStatus[]

const TIER_COLORS: Record<string, string> = {
  oro: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  plata: 'text-gray-600 bg-gray-100 border-gray-200',
  bronce: 'text-orange-700 bg-orange-50 border-orange-200',
}

const DOC_STATUS_CONFIG = {
  pending:  { label: 'Sin subir',  icon: Clock,        className: 'text-[#18181B]/30' },
  uploaded: { label: 'Recibido',   icon: CheckCircle2, className: 'text-blue-600' },
  approved: { label: 'Aprobado',   icon: CheckCircle2, className: 'text-[#D47151]' },
  rejected: { label: 'Rechazado',  icon: XCircle,      className: 'text-red-600' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(val: T | T[] | null): T | null {
  if (!val) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#18181B]/5 last:border-0">
      <span className="text-xs font-medium text-[#18181B]/40 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-[#18181B] text-right">{value}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminTramiteClient({
  tramite: raw,
  adminName,
}: {
  tramite: AdminTramite
  adminName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tramite, setTramite] = useState(raw)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<TramiteStatus>(tramite.status as TramiteStatus)
  const [statusNote, setStatusNote] = useState('')

  const [rejectDoc, setRejectDoc] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [docPending, startDocTransition] = useTransition()

  const broker = unwrap(tramite.brokers as any)
  const tramiteType = unwrap(tramite.tramite_types as any)
  const history = Array.isArray(tramite.tramite_status_history)
    ? tramite.tramite_status_history
    : []

  const statusCfg = TRAMITE_STATUS_CONFIG[tramite.status as TramiteStatus]

  function handleOpenStatusDialog() {
    setNewStatus(tramite.status as TramiteStatus)
    setStatusNote('')
    setDialogOpen(true)
  }

  function handleUpdateStatus() {
    startTransition(async () => {
      const result = await updateTramiteStatus([tramite.id], newStatus, statusNote.trim() || null)
      if (result.error) { toast.error(result.error); return }
      setTramite(t => ({ ...t, status: newStatus }))
      toast.success(`Estado → "${TRAMITE_STATUS_CONFIG[newStatus]?.label}"`)
      setDialogOpen(false)
      router.refresh()
    })
  }

  function handleApproveDoc(docName: string) {
    startDocTransition(async () => {
      const result = await updateDocumentStatus(tramite.id, docName, 'approved')
      if (result.error) { toast.error(result.error); return }
      setTramite(t => ({
        ...t,
        documents: t.documents.map(d => d.name === docName ? { ...d, status: 'approved' } : d),
      }))
      toast.success('Documento aprobado')
    })
  }

  function handleRejectDoc() {
    if (!rejectDoc) return
    const name = rejectDoc
    startDocTransition(async () => {
      const result = await updateDocumentStatus(tramite.id, name, 'rejected', rejectNote.trim() || undefined)
      if (result.error) { toast.error(result.error); return }
      setTramite(t => ({
        ...t,
        documents: t.documents.map(d =>
          d.name === name ? { ...d, status: 'rejected', rejection_note: rejectNote.trim() || undefined } : d
        ),
      }))
      toast.success('Documento rechazado')
      setRejectDoc(null)
      setRejectNote('')
    })
  }

  // ── Sections ─────────────────────────────────────────────────────────────

  const SolicitudTab = (
    <div className="space-y-4">
      {/* Broker card */}
      <div className="rounded-2xl border border-[#18181B]/8 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-[#F9F9F8] border-b border-[#18181B]/6 flex items-center gap-2">
          <User size={14} className="text-[#18181B]/40" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#18181B]/40">Broker</span>
        </div>
        <div className="p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#18181B] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {generateInitials(broker?.full_name ?? '?')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#18181B]">{broker?.full_name ?? '—'}</p>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-xs text-[#18181B]/50">
                <Mail size={11} />{broker?.email ?? '—'}
              </span>
              {broker?.phone && (
                <span className="flex items-center gap-1 text-xs text-[#18181B]/50">
                  <Phone size={11} />{broker.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {broker?.tier && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${TIER_COLORS[broker.tier] ?? ''}`}>
                  <Award size={10} />{broker.tier}
                </span>
              )}
              {broker?.company_name && (
                <span className="flex items-center gap-1 text-xs text-[#18181B]/50">
                  <Building2 size={11} />{broker.company_name}
                </span>
              )}
              {broker?.total_tramites !== undefined && (
                <span className="text-xs text-[#18181B]/30">{broker.total_tramites} trámites</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property card */}
      {(tramite.property_address || tramite.property_district || tramite.property_value) && (
        <div className="rounded-2xl border border-[#18181B]/8 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-[#F9F9F8] border-b border-[#18181B]/6 flex items-center gap-2">
            <MapPin size={14} className="text-[#18181B]/40" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#18181B]/40">Inmueble</span>
          </div>
          <div className="p-4 space-y-0">
            {tramite.property_address && <InfoRow label="Dirección" value={tramite.property_address} />}
            {tramite.property_district && <InfoRow label="Distrito" value={tramite.property_district} />}
            {tramite.property_value && (
              <InfoRow label="Valor" value={<span className="font-semibold">{formatPrice(tramite.property_value)}</span>} />
            )}
          </div>
        </div>
      )}

      {/* Price card */}
      <div className="rounded-2xl border border-[#18181B]/8 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-[#F9F9F8] border-b border-[#18181B]/6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#18181B]/40">Precio</span>
        </div>
        <div className="p-4 space-y-0">
          <InfoRow label="Tipo" value={tramiteType?.display_name ?? '—'} />
          <InfoRow label="Precio base" value={formatPrice(tramite.quoted_price)} />
          {tramite.discount_applied > 0 && (
            <InfoRow
              label={`Descuento (${tramite.discount_applied}%)`}
              value={<span className="text-[#D47151]">−{formatPrice(tramite.quoted_price * tramite.discount_applied / 100)}</span>}
            />
          )}
          <InfoRow
            label="Total"
            value={<span className="text-base font-bold text-[#18181B]">{formatPrice(tramite.final_price)}</span>}
          />
          {tramite.price_matched && tramite.price_match_reference?.startsWith('https://') && (
            <div className="pt-2">
              <a href={tramite.price_match_reference} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#D47151] hover:underline">
                <ExternalLink size={11} /> Ver cotización igualada
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="rounded-2xl border border-[#18181B]/8 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-[#F9F9F8] border-b border-[#18181B]/6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#18181B]/40">Fechas</span>
        </div>
        <div className="p-4 space-y-0">
          <InfoRow label="Solicitado" value={formatDate(tramite.created_at)} />
          <InfoRow label="Último cambio" value={formatDate(tramite.updated_at)} />
          {tramite.estimated_completion && (
            <InfoRow label="Entrega estimada" value={
              <span className="font-medium text-[#D47151]">
                {new Date(tramite.estimated_completion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            } />
          )}
        </div>
      </div>

      {tramite.notes && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Notas</p>
          <p className="text-sm text-amber-900">{tramite.notes}</p>
        </div>
      )}
    </div>
  )

  const DocumentosTab = (
    <div className="space-y-3">
      {(tramiteType?.required_documents ?? []).length === 0 ? (
        <p className="text-sm text-[#18181B]/40 py-8 text-center">Este tipo de trámite no requiere documentos.</p>
      ) : (
        (tramiteType?.required_documents ?? []).map((req: { name: string; description?: string }) => {
          const uploaded = tramite.documents.find(d => d.name === req.name)
          const docStatus = (uploaded?.status as keyof typeof DOC_STATUS_CONFIG) ?? 'pending'
          const cfg = DOC_STATUS_CONFIG[docStatus] ?? DOC_STATUS_CONFIG.pending
          const Icon = cfg.icon

          return (
            <div key={req.name} className="rounded-2xl border border-[#18181B]/8 bg-white overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className={`shrink-0 ${cfg.className}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#18181B] truncate">{req.name}</p>
                  {req.description && (
                    <p className="text-xs text-[#18181B]/40 mt-0.5 line-clamp-1">{req.description}</p>
                  )}
                  {uploaded?.uploaded_at && (
                    <p className="text-xs text-[#18181B]/40 mt-0.5">
                      Subido {formatDate(uploaded.uploaded_at)}
                    </p>
                  )}
                  {uploaded?.rejection_note && docStatus === 'rejected' && (
                    <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded-lg">
                      Motivo: {uploaded.rejection_note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {uploaded?.url && (
                    <a href={uploaded.url} target="_blank" rel="noopener noreferrer">
                      <button className="inline-flex items-center gap-1 text-xs text-[#D47151] hover:underline font-medium px-2 py-1">
                        <FileText size={12} /> Ver
                      </button>
                    </a>
                  )}
                  {docStatus === 'uploaded' && (
                    <>
                      <button
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 border border-emerald-200 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                        disabled={docPending}
                        onClick={() => handleApproveDoc(req.name)}
                      >
                        {docPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Aprobar
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-xs text-red-600 border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                        disabled={docPending}
                        onClick={() => { setRejectDoc(req.name); setRejectNote('') }}
                      >
                        <XCircle size={12} /> Rechazar
                      </button>
                    </>
                  )}
                  {docStatus !== 'uploaded' && (
                    <span className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  const PartesTab = (
    <div className="space-y-3">
      {(tramite.parties ?? []).length === 0 ? (
        <p className="text-sm text-[#18181B]/40 py-8 text-center">No hay partes registradas en este trámite.</p>
      ) : (
        tramite.parties.map((party, i) => (
          <div key={i} className="rounded-2xl border border-[#18181B]/8 bg-white p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#18181B]/8 text-[#18181B] flex items-center justify-center text-sm font-bold shrink-0">
              {generateInitials(party.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[#18181B]">{party.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#18181B]/5 border border-[#18181B]/8 text-xs text-[#18181B]/60 font-medium capitalize">
                  {party.role}
                </span>
              </div>
              <p className="text-xs text-[#18181B]/50 mt-0.5">DNI: {party.dni}</p>
              {party.email && <p className="text-xs text-[#18181B]/40">{party.email}</p>}
              {party.phone && <p className="text-xs text-[#18181B]/40">{party.phone}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  )

  const HistorialTab = (
    <TramiteTimeline
      currentStatus={tramite.status as TramiteStatus}
      statusHistory={history}
      estimatedCompletion={tramite.estimated_completion}
    />
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Link
            href="/admin/tramites"
            className="inline-flex items-center gap-1.5 text-sm text-[#18181B]/50 hover:text-[#D47151] transition-colors -ml-1"
          >
            <ArrowLeft size={15} />
            Todos los trámites
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-sm bg-[#18181B]/5 text-[#18181B]/70 px-2 py-0.5 rounded-lg border border-[#18181B]/8">
              {tramite.reference_code}
            </code>
            <ChevronRight size={14} className="text-[#18181B]/30" />
            <span className="text-base font-semibold text-[#18181B]">
              {tramiteType?.display_name ?? 'Trámite notarial'}
            </span>
          </div>
          {statusCfg && (
            <span className={`inline-flex items-center rounded-full border font-medium px-2.5 py-0.5 text-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {statusCfg.label}
            </span>
          )}
        </div>

        <button
          onClick={handleOpenStatusDialog}
          className="inline-flex items-center gap-2 bg-[#D47151] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#A6553A] transition-colors shrink-0"
        >
          Cambiar estado
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left — tabs */}
        <div className="lg:col-span-7">
          <Tabs defaultValue="solicitud">
            <TabsList className="w-full grid grid-cols-4 mb-4 bg-[#F9F9F8] rounded-2xl p-1">
              <TabsTrigger value="solicitud" className="text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Solicitud</TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">
                Documentos
                {tramite.documents.filter(d => d.status === 'uploaded').length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#D47151] text-white text-[10px] font-bold">
                    {tramite.documents.filter(d => d.status === 'uploaded').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="partes" className="text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Partes</TabsTrigger>
              <TabsTrigger value="historial" className="text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-sm">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="solicitud">{SolicitudTab}</TabsContent>
            <TabsContent value="documentos">{DocumentosTab}</TabsContent>
            <TabsContent value="partes">{PartesTab}</TabsContent>
            <TabsContent value="historial">{HistorialTab}</TabsContent>
          </Tabs>
        </div>

        {/* Right — chat */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <div className="rounded-3xl border border-[#18181B]/8 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-[#F9F9F8] border-b border-[#18181B]/6 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#18181B]/40">
                  Chat con {broker?.full_name?.split(' ')[0] ?? 'broker'}
                </span>
                <span className="text-[10px] h-4 px-1.5 inline-flex items-center border border-[#D47151]/20 text-[#D47151] bg-[#D47151]/8 rounded-full font-medium">
                  Notaría
                </span>
              </div>
              <ChatWindow tramiteId={tramite.id} senderType="notaria" />
            </div>
          </div>
        </div>
      </div>

      {/* Change status dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#18181B]">Cambiar estado del trámite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#18181B]">Nuevo estado</label>
              <Select value={newStatus} onValueChange={v => setNewStatus(v as TramiteStatus)}>
                <SelectTrigger className="rounded-xl border-[#18181B]/15"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{TRAMITE_STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#18181B]">
                Nota para el broker <span className="text-[#18181B]/40 font-normal">(opcional)</span>
              </label>
              <Textarea
                placeholder="Ej: Falta el DNI del vendedor..."
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                rows={3}
                className="rounded-xl border-[#18181B]/15 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
              className="inline-flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#18181B]/5 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={isPending}
              className="inline-flex items-center gap-2 bg-[#D47151] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#A6553A] transition-colors disabled:opacity-40"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Actualizar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject document dialog */}
      <Dialog open={!!rejectDoc} onOpenChange={open => { if (!open) setRejectDoc(null) }}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#18181B]">Rechazar documento</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-[#18181B]/60">
              Documento: <strong className="text-[#18181B]">{rejectDoc}</strong>
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#18181B]">
                Motivo <span className="text-[#18181B]/40 font-normal">(opcional)</span>
              </label>
              <Textarea
                placeholder="Ej: El documento no es legible..."
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={3}
                className="rounded-xl border-[#18181B]/15 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setRejectDoc(null)}
              disabled={docPending}
              className="inline-flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#18181B]/5 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleRejectDoc}
              disabled={docPending}
              className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              {docPending && <Loader2 size={14} className="animate-spin" />}
              Rechazar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
