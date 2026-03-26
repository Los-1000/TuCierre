import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import { Building2, Mail } from 'lucide-react'

interface NotariaRow {
  id: string
  full_name: string
  email: string
  notaria_name: string | null
  notaria_address: string | null
  created_at: string
  total_tramites: number
  total_tramites_month: number
}

export default async function SuperAdminNotariasPage() {
  const adminClient = createAdminClient()

  const { data: notarias } = await adminClient
    .from('brokers')
    .select(
      'id, full_name, email, notaria_name, notaria_address, created_at, total_tramites, total_tramites_month'
    )
    .eq('is_admin', true)
    .order('total_tramites', { ascending: false })

  const rows = (notarias ?? []) as NotariaRow[]

  // Income per notaría from completed tramites
  const notariaIds = rows.map(n => n.id)
  const { data: tramiteAgg } = notariaIds.length
    ? await adminClient
        .from('tramites')
        .select('notaria_id, final_price, status')
        .in('notaria_id', notariaIds)
    : { data: [] }

  const aggByNotaria = (tramiteAgg ?? []).reduce<
    Record<string, { total: number; income: number }>
  >((acc, t: any) => {
    if (!t.notaria_id) return acc
    if (!acc[t.notaria_id]) acc[t.notaria_id] = { total: 0, income: 0 }
    acc[t.notaria_id].total++
    if (t.status === 'completado') acc[t.notaria_id].income += t.final_price || 0
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notarías</h1>
        <p className="text-sm text-gray-500 mt-1">
          {rows.length} notaría{rows.length !== 1 ? 's' : ''} registrada
          {rows.length !== 1 ? 's' : ''} en la plataforma
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400 text-sm">
            No hay notarías registradas
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map(n => {
            const agg = aggByNotaria[n.id] ?? { total: 0, income: 0 }
            return (
              <Card
                key={n.id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {n.notaria_name ?? n.full_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Mail size={11} />
                        <span className="truncate">{n.email}</span>
                      </div>
                      {n.notaria_address && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {n.notaria_address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-slate-900">{agg.total}</div>
                      <div className="text-xs text-slate-500">Trámites</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-slate-900">
                        {n.total_tramites_month}
                      </div>
                      <div className="text-xs text-slate-500">Este mes</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="text-sm font-bold text-emerald-700 tabular-nums">
                        {formatPrice(agg.income)}
                      </div>
                      <div className="text-xs text-slate-500">Ingresos</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Registrada {formatDate(n.created_at)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
