'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn, formatPrice, generateInitials } from '@/lib/utils'
import { cancelTramite } from './actions'
import { useTramite } from '@/hooks/useTramites'
import { useTramiteStatusRealtime } from '@/hooks/useRealtime'
import { CardSkeleton } from '@/components/shared/SkeletonCard'
import StatusBadge from '@/components/tramites/StatusBadge'
import TramiteTimeline from '@/components/tramites/TramiteTimeline'
import DocumentUpload from '@/components/tramites/DocumentUpload'
import ChatWindow from '@/components/chat/ChatWindow'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, ExternalLink, Loader2, ChevronRight } from 'lucide-react'
import type { TramiteDocument, TramiteStatus } from '@/types/database'

export default function TramiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { tramite, history, loading, refresh } = useTramite(id)
  const [liveStatus, setLiveStatus] = useState<TramiteStatus | null>(null)

  // Subscribe to real-time status updates
  useTramiteStatusRealtime(id, (newStatus) => {
    setLiveStatus(newStatus)
    refresh()
  })

  const effectiveStatus = (liveStatus ?? tramite?.status) as TramiteStatus | undefined

  const handleCancelTramite = () => {
    if (!tramite) return
    startTransition(async () => {
      const result = await cancelTramite(tramite.id)
      if (result.error) { toast.error(result.error); return }
      toast.success('Trámite cancelado.')
      router.push('/tramites')
    })
  }

  const handleDocumentUpload = (
    index: number,
    docData: { name: string; url: string; uploaded_at: string; status: 'pending' }
  ) => {
    refresh()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (!tramite) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[#18181B]/50">Trámite no encontrado.</p>
        <Link
          href="/tramites"
          className="mt-4 inline-flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#18181B]/5 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a Mis Trámites
        </Link>
      </div>
    )
  }

  const requiredDocs = tramite.tramite_types?.required_documents ?? []
  const currentDocs = tramite.documents ?? []
  const isCancelled = effectiveStatus === 'cancelado'
  const isCompleted = effectiveStatus === 'completado'

  // --- Sub-sections ---

  const TimelineSection = (
    <section aria-labelledby="timeline-heading" className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
      <h2 id="timeline-heading" className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40 mb-6">
        Estado del proceso
      </h2>
      {effectiveStatus && (
        <TramiteTimeline
          currentStatus={effectiveStatus}
          statusHistory={history}
          estimatedCompletion={tramite.estimated_completion}
        />
      )}
    </section>
  )

  const DocumentsSection = (
    <section aria-labelledby="docs-heading" className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 id="docs-heading" className="text-base font-semibold text-[#18181B]">
            Documentación
          </h2>
          <p className="text-sm text-[#18181B]/50 mt-0.5">
            {currentDocs.filter(d => d.status === 'approved').length} de {requiredDocs.length} documentos aprobados
          </p>
        </div>
      </div>
      {requiredDocs.length === 0 ? (
        <p className="text-sm text-[#18181B]/40">No se requieren documentos para este trámite.</p>
      ) : (
        <div className="space-y-2">
          {requiredDocs.map((req, i) => {
            const uploaded = currentDocs.find((d) => d.name === req.name) ?? null
            return (
              <DocumentUpload
                key={i}
                tramiteId={tramite.id}
                documentName={req.name}
                documentIndex={i}
                currentDoc={
                  uploaded
                    ? {
                        name: uploaded.name,
                        url: uploaded.url ?? '',
                        uploaded_at: uploaded.uploaded_at ?? new Date().toISOString(),
                        status: uploaded.status as 'pending' | 'approved' | 'rejected',
                        rejection_note: (uploaded as any).rejection_note,
                      }
                    : null
                }
                onUploadComplete={(docData) => handleDocumentUpload(i, docData)}
              />
            )
          })}
        </div>
      )}
    </section>
  )

  const PartesSection = (
    <section aria-labelledby="partes-heading" className="space-y-3">
      <h2 id="partes-heading" className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40">
        Partes
      </h2>
      {tramite.parties?.length === 0 ? (
        <p className="text-sm text-[#18181B]/40">No hay partes registradas.</p>
      ) : (
        <div className="space-y-2">
          {tramite.parties?.map((party, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-[#F0F3FF] rounded-2xl border border-[#18181B]/8"
            >
              <div className="w-9 h-9 rounded-full bg-[#2855E0]/10 text-[#2855E0] font-semibold text-sm flex items-center justify-center shrink-0">
                {generateInitials(party.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#18181B] truncate">
                    {party.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#18181B]/10 bg-white px-2 py-0.5 text-xs text-[#18181B]/60 font-medium capitalize">
                    {party.role}
                  </span>
                </div>
                <p className="text-xs text-[#18181B]/50 mt-0.5">DNI: {party.dni}</p>
                {party.email && (
                  <p className="text-xs text-[#18181B]/40 truncate">{party.email}</p>
                )}
                {party.phone && (
                  <p className="text-xs text-[#18181B]/40">{party.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  const DetallesSection = (
    <section aria-labelledby="detalles-heading" className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
      <h2 id="detalles-heading" className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40 mb-5">
        Detalles Financieros
      </h2>
      <div className="space-y-0">
        {[
          { label: 'Tipo', value: tramite.tramite_types?.display_name ?? 'Trámite notarial' },
          { label: 'Precio base', value: formatPrice(tramite.quoted_price), mono: true },
          ...(tramite.discount_applied > 0 ? [{
            label: `Descuento (${tramite.discount_applied}%)`,
            value: `-${formatPrice(tramite.quoted_price * (tramite.discount_applied / 100))}`,
            green: true,
            mono: true,
          }] : []),
          ...(tramite.property_address ? [{ label: 'Inmueble', value: tramite.property_address }] : []),
          ...(tramite.property_district ? [{ label: 'Distrito', value: tramite.property_district }] : []),
        ].map((row, i, arr) => (
          <div key={i} className={cn('flex justify-between items-center py-3', i < arr.length - 1 && 'border-b border-[#18181B]/6')}>
            <span className="text-sm text-[#18181B]/60">{row.label}</span>
            <span className={cn(
              'text-sm font-semibold',
              (row as any).green ? 'text-emerald-600' : 'text-[#18181B]',
              (row as any).mono && 'font-mono tabular-nums',
            )}>
              {row.value}
            </span>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between items-center pt-4 mt-1 border-t-2 border-[#18181B]/10">
          <span className="font-bold text-[#18181B]">Total</span>
          <span className="text-2xl font-bold text-[#18181B] tabular-nums font-mono">
            {formatPrice(tramite.final_price)}
          </span>
        </div>

        {/* Commission highlight */}
        {tramite.discount_applied > 0 && (
          <div className="mt-4 p-4 bg-[#2855E0]/5 rounded-2xl border border-[#2855E0]/15 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2855E0]">
                Tu Comisión ({tramite.discount_applied}%)
              </p>
              <p className="text-xl font-bold text-[#2855E0] tabular-nums">
                {formatPrice(tramite.final_price * (tramite.discount_applied / 100))}
              </p>
            </div>
          </div>
        )}

        {tramite.price_matched && tramite.price_match_reference?.startsWith('https://') && (
          <div className="pt-2">
            <a
              href={tramite.price_match_reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#2855E0] hover:underline font-medium"
            >
              <ExternalLink size={12} />
              Ver cotización igualada
            </a>
          </div>
        )}
      </div>
    </section>
  )

  const ChatSection = (
    <section aria-labelledby="chat-heading" className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] mt-4 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#18181B]/8">
        <h2 id="chat-heading" className="text-sm font-semibold text-[#18181B]">
          Chat con Notaría
        </h2>
      </div>
      <ChatWindow tramiteId={tramite.id} senderType="broker" />
    </section>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#18181B]/50">
        <Link href="/tramites" className="hover:text-[#2855E0] transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Mis Trámites
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#18181B] font-medium">{tramite.reference_code}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <code className="font-mono text-xs bg-[#18181B]/6 text-[#18181B]/70 px-3 py-1.5 rounded-full font-semibold">
                {tramite.reference_code}
              </code>
              {effectiveStatus && <StatusBadge status={effectiveStatus} />}
            </div>
            <h1 className="text-2xl font-bold text-[#18181B] tracking-tight leading-none">
              {tramite.tramite_types?.display_name ?? 'Trámite notarial'}
            </h1>
            {tramite.parties && tramite.parties.length > 0 && (
              <div className="flex items-center gap-2 text-[#18181B]/60 text-sm flex-wrap">
                {tramite.parties.slice(0, 2).map((p, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-[#18181B]/30 mx-1">→</span>}
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cancel button */}
          {!isCancelled && !isCompleted && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="border border-red-200 text-red-600 rounded-full px-5 py-2 text-sm font-semibold hover:bg-red-50 transition-colors shrink-0">
                  Cancelar trámite
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar este trámite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El trámite{' '}
                    <strong>{tramite.reference_code}</strong> quedará cancelado y no podrá
                    reactivarse.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelTramite}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 rounded-full"
                  >
                    {isPending ? <><Loader2 size={14} className="animate-spin mr-1.5" />Cancelando...</> : 'Sí, cancelar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* ─── Desktop layout: 7:5 two-column grid ─── */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Left column (7) */}
        <div className="col-span-7 space-y-0">
          {TimelineSection}
          {DocumentsSection}
          <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6 mt-4">
            {PartesSection}
          </div>
        </div>

        {/* Right column (5) */}
        <div className="col-span-5">
          <div className="sticky top-6 space-y-0">
            {DetallesSection}
            {ChatSection}
          </div>
        </div>
      </div>

      {/* ─── Mobile layout: Tabs ─── */}
      <div className="lg:hidden">
        <Tabs defaultValue="seguimiento">
          <TabsList className="w-full grid grid-cols-4 h-auto bg-[#F0F3FF] rounded-2xl p-1">
            <TabsTrigger value="seguimiento" className="text-xs py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Seguimiento
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Chat
            </TabsTrigger>
            <TabsTrigger value="detalles" className="text-xs py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Detalles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seguimiento" className="mt-4 space-y-4">
            {TimelineSection}
            <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_4px_24px_rgba(18,18,27,0.06)] p-6">
              {PartesSection}
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4">
            {DocumentsSection}
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            {ChatSection}
          </TabsContent>

          <TabsContent value="detalles" className="mt-4">
            {DetallesSection}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
