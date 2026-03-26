'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { approveCashout, rejectCashout, completeCashout } from './actions'
import { Check, X, Banknote, ChevronDown, ChevronUp } from 'lucide-react'
import type { CashoutStatus, CashoutMethod } from '@/types/database'
import type { CashoutRow } from './page'

const STATUS_CONFIG: Record<CashoutStatus, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:  { label: 'Aprobado',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected:  { label: 'Rechazado',  className: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completado', className: 'bg-green-50 text-green-700 border-green-200' },
}

const METHOD_LABEL: Record<CashoutMethod, string> = {
  bank_transfer: '🏦 Transferencia',
  yape:          '💜 Yape',
  plin:          '💚 Plin',
  otros:         '📱 Otros',
}

function PaymentDetails({
  method,
  details,
}: {
  method: CashoutMethod
  details: Record<string, string>
}) {
  if (method === 'bank_transfer') {
    return (
      <div className="text-xs text-slate-600 space-y-0.5">
        <div><span className="text-slate-400">Banco:</span> {details.banco}</div>
        <div><span className="text-slate-400">CCI:</span> <span className="font-mono">{details.cci}</span></div>
        <div><span className="text-slate-400">Titular:</span> {details.titular}</div>
        <div><span className="text-slate-400">Tipo:</span> {details.tipo_cuenta}</div>
      </div>
    )
  }
  return (
    <div className="text-xs text-slate-600 space-y-0.5">
      <div><span className="text-slate-400">Titular:</span> {details.titular}</div>
      <div><span className="text-slate-400">Teléfono:</span> <span className="font-mono">{details.telefono}</span></div>
    </div>
  )
}

export default function CashoutsClient({
  initialCashouts,
}: {
  initialCashouts: CashoutRow[]
}) {
  const [cashouts, setCashouts] = useState(initialCashouts)
  const [filterStatus, setFilterStatus] = useState<CashoutStatus | 'all'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered =
    filterStatus === 'all' ? cashouts : cashouts.filter(c => c.status === filterStatus)

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    const result = await approveCashout(id)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    setCashouts(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: 'approved', processed_at: new Date().toISOString() } : c
      )
    )
    toast.success('Cashout aprobado')
  }

  const handleReject = async (id: string) => {
    if (!rejectNotes.trim()) { toast.error('Agrega una nota de rechazo'); return }
    setLoadingId(id)
    const result = await rejectCashout(id, rejectNotes)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    setCashouts(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: 'rejected', admin_notes: rejectNotes, processed_at: new Date().toISOString() }
          : c
      )
    )
    setRejectingId(null)
    setRejectNotes('')
    toast.success('Cashout rechazado')
  }

  const handleComplete = async (id: string) => {
    setLoadingId(id)
    const result = await completeCashout(id)
    setLoadingId(null)
    if (result.error) { toast.error(result.error); return }
    setCashouts(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: 'completed', processed_at: new Date().toISOString() } : c
      )
    )
    toast.success('Cashout marcado como completado')
  }

  const statusCounts = cashouts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cashouts de referidos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las solicitudes de retiro de los brokers
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['pending', 'approved', 'completed', 'rejected'] as CashoutStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
            className={cn(
              'p-3 rounded-xl border-2 text-left transition-all',
              filterStatus === s
                ? 'border-brand-navy bg-brand-navy/5'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <div className="text-xl font-bold text-slate-900">{statusCounts[s] ?? 0}</div>
            <div className="text-xs text-slate-500">{STATUS_CONFIG[s].label}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            No hay cashouts
            {filterStatus !== 'all'
              ? ` con estado "${STATUS_CONFIG[filterStatus as CashoutStatus].label}"`
              : ''}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const statusConf = STATUS_CONFIG[c.status]
            const isExpanded = expandedId === c.id
            const isRejecting = rejectingId === c.id
            const isLoading = loadingId === c.id

            return (
              <Card key={c.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">
                          {c.brokers?.full_name ?? '—'}
                        </span>
                        <span className="text-xs text-slate-400">{c.brokers?.email}</span>
                        <span
                          className={cn(
                            'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
                            statusConf.className
                          )}
                        >
                          {statusConf.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-slate-500">
                        <span>{METHOD_LABEL[c.method]}</span>
                        <span>·</span>
                        <span>Solicitado {formatDate(c.created_at)}</span>
                        {c.processed_at && (
                          <>
                            <span>·</span>
                            <span>Procesado {formatDate(c.processed_at)}</span>
                          </>
                        )}
                      </div>
                      {c.admin_notes && (
                        <p className="text-xs text-red-500 mt-1">Nota: {c.admin_notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-slate-900 tabular-nums font-mono">
                        {formatPrice(c.amount)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? 'Ocultar datos de pago' : 'Ver datos de pago'}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <PaymentDetails method={c.method} details={c.payment_details} />
                    </div>
                  )}

                  {c.status === 'pending' && !isRejecting && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleApprove(c.id)}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-8 text-xs"
                      >
                        <Check size={13} />
                        {isLoading ? 'Procesando...' : 'Aprobar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => setRejectingId(c.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 h-8 text-xs"
                      >
                        <X size={13} />
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {c.status === 'pending' && isRejecting && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Motivo del rechazo (requerido)..."
                        rows={2}
                        value={rejectNotes}
                        onChange={e => setRejectNotes(e.target.value)}
                        className="resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleReject(c.id)}
                          className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                        >
                          {isLoading ? 'Procesando...' : 'Confirmar rechazo'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setRejectingId(null); setRejectNotes('') }}
                          className="h-8 text-xs"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {c.status === 'approved' && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleComplete(c.id)}
                        className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5 h-8 text-xs"
                      >
                        <Banknote size={13} />
                        {isLoading ? 'Procesando...' : 'Marcar como pagado'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
