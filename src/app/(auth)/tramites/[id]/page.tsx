'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatPrice, generateInitials } from '@/lib/utils'
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
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { TramiteDocument, TramiteStatus } from '@/types/database'

export default function TramiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)

  const { tramite, history, loading, refresh } = useTramite(id)
  const [liveStatus, setLiveStatus] = useState<TramiteStatus | null>(null)

  // Subscribe to real-time status updates
  useTramiteStatusRealtime(id, (newStatus) => {
    setLiveStatus(newStatus)
    refresh()
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const effectiveStatus = (liveStatus ?? tramite?.status) as TramiteStatus | undefined

  const handleCancelTramite = async () => {
    if (!tramite) return
    setCancelling(true)
    try {
      const { error } = await supabase
        .from('tramites')
        .update({ status: 'cancelado' })
        .eq('id', tramite.id)

      if (error) throw error
      toast.success('Trámite cancelado.')
      router.push('/tramites')
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudo cancelar el trámite.')
      setCancelling(false)
    }
  }

  // Update a document in the local tramite documents array
  const handleDocumentUpload = (
    index: number,
    docData: { name: string; url: string; uploaded_at: string; status: 'pending' }
  ) => {
    // Trigger a re-fetch to sync with DB (parent handles optimistic updates via refresh)
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
        <p className="text-slate-500">Trámite no encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/tramites">
            <ArrowLeft size={16} />
            Volver a Mis Trámites
          </Link>
        </Button>
      </div>
    )
  }

  const requiredDocs = tramite.tramite_types?.required_documents ?? []
  const currentDocs = tramite.documents ?? []
  const isCancelled = effectiveStatus === 'cancelado'
  const isCompleted = effectiveStatus === 'completado'

  // --- Sub-sections ---

  const TimelineSection = (
    <section aria-labelledby="timeline-heading" className="space-y-4">
      <h2 id="timeline-heading" className="text-base font-semibold text-slate-900">
        Seguimiento
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
    <section aria-labelledby="docs-heading" className="space-y-3">
      <h2 id="docs-heading" className="text-base font-semibold text-slate-900">
        Documentos
      </h2>
      {requiredDocs.length === 0 ? (
        <p className="text-sm text-slate-400">No se requieren documentos para este trámite.</p>
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
      <h2 id="partes-heading" className="text-base font-semibold text-slate-900">
        Partes
      </h2>
      {tramite.parties?.length === 0 ? (
        <p className="text-sm text-slate-400">No hay partes registradas.</p>
      ) : (
        <div className="space-y-2">
          {tramite.parties?.map((party, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200"
            >
              {/* Initials avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center shrink-0">
                {generateInitials(party.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {party.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 font-medium capitalize">
                    {party.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">DNI: {party.dni}</p>
                {party.email && (
                  <p className="text-xs text-slate-400 truncate">{party.email}</p>
                )}
                {party.phone && (
                  <p className="text-xs text-slate-400">{party.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  const DetallesSection = (
    <section aria-labelledby="detalles-heading" className="space-y-3">
      <h2 id="detalles-heading" className="text-base font-semibold text-slate-900">
        Precio
      </h2>
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Precio base</span>
          <span className="tabular-nums">{formatPrice(tramite.quoted_price)}</span>
        </div>
        {tramite.discount_applied > 0 && (
          <div className="flex items-center justify-between text-sm text-green-700">
            <span>Descuento ({tramite.discount_applied}%)</span>
            <span className="tabular-nums">
              -{formatPrice(tramite.quoted_price * (tramite.discount_applied / 100))}
            </span>
          </div>
        )}
        <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-base font-bold text-accent tabular-nums">
            {formatPrice(tramite.final_price)}
          </span>
        </div>
        {tramite.price_matched && tramite.price_match_reference && (
          <div className="pt-1">
            <a
              href={tramite.price_match_reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <ExternalLink size={12} />
              Ver cotización igualada
            </a>
          </div>
        )}
      </div>

      {tramite.property_address && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inmueble</p>
          <p className="text-sm text-slate-900">{tramite.property_address}</p>
          {tramite.property_district && (
            <p className="text-xs text-slate-500">{tramite.property_district}</p>
          )}
          {tramite.property_value && (
            <p className="text-xs text-slate-500">
              Valor: {formatPrice(tramite.property_value)}
            </p>
          )}
        </div>
      )}
    </section>
  )

  const ChatSection = (
    <section aria-labelledby="chat-heading" className="space-y-3">
      <h2 id="chat-heading" className="text-base font-semibold text-slate-900">
        Chat con Notaría
      </h2>
      <ChatWindow tramiteId={tramite.id} senderType="broker" />
    </section>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2 text-slate-500">
              <Link href="/tramites">
                <ArrowLeft size={16} />
                Mis Trámites
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {tramite.reference_code}
            </code>
            <span className="text-slate-300">—</span>
            <span className="text-base font-semibold text-slate-900">
              {tramite.tramite_types?.display_name ?? 'Trámite notarial'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tramite.parties?.slice(0, 2).map((p) => p.name).join(' → ') && (
              <span className="text-sm text-slate-500">
                {tramite.parties.slice(0, 2).map((p) => p.name).join(' → ')}
              </span>
            )}
            {tramite.final_price > 0 && (
              <span className="text-sm text-slate-500">
                · {formatPrice(tramite.final_price)}
              </span>
            )}
            {effectiveStatus && <StatusBadge status={effectiveStatus} size="sm" />}
          </div>
        </div>

        {/* Cancel button */}
        {!isCancelled && !isCompleted && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                Cancelar trámite
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar este trámite?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El trámite{' '}
                  <strong>{tramite.reference_code}</strong> quedará cancelado y no podrá
                  reactivarse.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelTramite}
                  disabled={cancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* ─── Desktop layout: 7:5 two-column grid ─── */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Left column (7) */}
        <div className="col-span-7 space-y-8">
          {TimelineSection}
          <div className="border-t border-slate-100 pt-6">{DocumentsSection}</div>
          <div className="border-t border-slate-100 pt-6">{PartesSection}</div>
          <div className="border-t border-slate-100 pt-6">{DetallesSection}</div>
        </div>

        {/* Right column (5) */}
        <div className="col-span-5">
          <div className="sticky top-6">{ChatSection}</div>
        </div>
      </div>

      {/* ─── Mobile layout: Tabs ─── */}
      <div className="lg:hidden">
        <Tabs defaultValue="seguimiento">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="seguimiento" className="text-xs py-2">
              Seguimiento
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs py-2">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs py-2">
              Chat
            </TabsTrigger>
            <TabsTrigger value="detalles" className="text-xs py-2">
              Detalles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seguimiento" className="mt-4 space-y-6">
            {TimelineSection}
            <div className="border-t border-slate-100 pt-4">{PartesSection}</div>
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
