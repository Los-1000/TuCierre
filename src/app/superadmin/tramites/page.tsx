import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/tramites/StatusBadge'
import Link from 'next/link'
import type { TramiteStatus } from '@/types/database'

interface TramiteRow {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  created_at: string
  tramite_types: { display_name: string } | null
  brokers: { full_name: string } | null
  notaria: { full_name: string; notaria_name: string | null } | null
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  cotizado: 'Cotizado',
  solicitado: 'Solicitado',
  documentos_pendientes: 'Docs. Pendientes',
  en_revision: 'En Revisión',
  en_firma: 'En Firma',
  en_registro: 'En Registro',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export default async function SuperAdminTramitesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const adminClient = createAdminClient()
  const currentStatus = searchParams.status ?? 'all'

  let query = adminClient
    .from('tramites')
    .select(
      'id, reference_code, status, final_price, created_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name), notaria:brokers!notaria_id(full_name, notaria_name)'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (currentStatus !== 'all') {
    query = query.eq('status', currentStatus)
  }

  const { data } = await query
  const tramites = (data ?? []) as unknown as TramiteRow[]

  const statuses = Object.keys(STATUS_LABELS)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trámites</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todos los trámites de la plataforma ({tramites.length})
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <Link
            key={s}
            href={
              s === 'all' ? '/superadmin/tramites' : `/superadmin/tramites?status=${s}`
            }
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              currentStatus === s
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {['Código', 'Broker', 'Tipo', 'Notaría', 'Estado', 'Monto', 'Fecha'].map(h => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tramites.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No hay trámites
                </td>
              </tr>
            ) : (
              tramites.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                      {t.reference_code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium text-xs">
                    {t.brokers?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {t.tramite_types?.display_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {t.notaria?.notaria_name ?? t.notaria?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 tabular-nums font-mono text-xs">
                    {formatPrice(t.final_price)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {formatDate(t.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
