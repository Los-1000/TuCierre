# Cashout de Referidos + SuperAdmin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cashout module for referral rewards on the user side, and a SuperAdmin platform dashboard at `/superadmin` for `carlos@notaryos.com`.

**Architecture:** Nueva tabla `cashout_requests` con saldo calculado al vuelo (SUM referral_bonus rewards − SUM cashouts no rechazados). Módulo de usuario añade sección a `/recompensas`. SuperAdmin es un route group separado con auth por `is_superadmin` en la tabla `brokers`, usando `createAdminClient()` para bypasear RLS en todas las páginas.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (client + admin), shadcn/ui (Dialog, Select, Card, Button), react-hook-form + zod, Tailwind CSS

---

## File Map

### New files
- `src/components/recompensas/CashoutDialog.tsx` — Modal de solicitud de cashout (client component)
- `src/app/superadmin/layout.tsx` — Sidebar + auth del superadmin
- `src/app/superadmin/page.tsx` — Dashboard global
- `src/app/superadmin/notarias/page.tsx` — Todas las notarías con métricas
- `src/app/superadmin/brokers/page.tsx` — Todos los brokers
- `src/app/superadmin/tramites/page.tsx` — Todos los trámites con filtro por estado
- `src/app/superadmin/cashouts/page.tsx` — Server component que carga datos
- `src/app/superadmin/cashouts/CashoutsClient.tsx` — Client component con acciones interactivas
- `src/app/superadmin/cashouts/actions.ts` — Server actions: aprobar/rechazar/completar
- `src/app/superadmin/price-match/page.tsx` — Todos los price match requests

### Modified files
- `src/types/database.ts` — Añadir CashoutMethod, CashoutStatus, CashoutRequest, BankTransferDetails, WalletDetails; añadir `is_superadmin` en Broker; añadir `cashout_requests` en Database
- `src/lib/validations.ts` — Añadir cashoutFormSchema + CashoutFormInput
- `src/app/(auth)/recompensas/page.tsx` — Añadir sección cashout con CashoutDialog e historial

---

## Task 1: Database — SQL schema + TypeScript types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Run SQL en Supabase dashboard**

Ve a tu proyecto Supabase → SQL Editor → New query. Ejecuta:

```sql
-- 1. Add is_superadmin to brokers
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

-- 2. Set superadmin for carlos@notaryos.com
UPDATE brokers SET is_superadmin = true
WHERE email = 'carlos@notaryos.com';

-- 3. Create cashout_requests table
CREATE TABLE IF NOT EXISTS cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'yape', 'plin', 'otros')),
  payment_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 4. Enable RLS
ALTER TABLE cashout_requests ENABLE ROW LEVEL SECURITY;

-- Brokers can see their own cashouts
CREATE POLICY "brokers_select_own_cashouts" ON cashout_requests
  FOR SELECT USING (auth.uid() = broker_id);

-- Brokers can insert their own cashouts
CREATE POLICY "brokers_insert_cashout" ON cashout_requests
  FOR INSERT WITH CHECK (auth.uid() = broker_id);

-- Superadmins can do everything
CREATE POLICY "superadmin_all_cashouts" ON cashout_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM brokers WHERE id = auth.uid() AND is_superadmin = true)
  );
```

- [ ] **Step 2: Update `src/types/database.ts`**

After line 16 (after `PriceMatchStatus`), add the new types:

```typescript
export type CashoutMethod = 'bank_transfer' | 'yape' | 'plin' | 'otros'
export type CashoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface BankTransferDetails {
  banco: string
  cci: string
  titular: string
  tipo_cuenta: 'ahorros' | 'corriente'
}

export interface WalletDetails {
  titular: string
  telefono: string
}

export interface CashoutRequest {
  id: string
  broker_id: string
  amount: number
  method: CashoutMethod
  payment_details: BankTransferDetails | WalletDetails
  status: CashoutStatus
  admin_notes: string | null
  created_at: string
  processed_at: string | null
}
```

In the `Broker` interface, add `is_superadmin` after `is_admin`:

```typescript
  is_admin: boolean
  is_superadmin: boolean
```

In the `Database` interface, inside `Tables`, add after `price_match_requests`:

```typescript
      cashout_requests: {
        Row: CashoutRequest
        Insert: Omit<CashoutRequest, 'id' | 'created_at'>
        Update: Partial<Omit<CashoutRequest, 'id' | 'broker_id' | 'created_at'>>
      }
```

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add CashoutRequest types and is_superadmin to Broker"
```

---

## Task 2: Validation schema for cashout form

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Append cashout schema at the end of `src/lib/validations.ts`**

```typescript
export const cashoutFormSchema = z.object({
  amount: z.number({ required_error: 'Ingresa el monto' }).positive('El monto debe ser mayor a 0'),
  method: z.enum(['bank_transfer', 'yape', 'plin', 'otros'], {
    required_error: 'Selecciona un método de pago',
  }),
  banco: z.string().optional(),
  cci: z.string().optional(),
  tipo_cuenta: z.enum(['ahorros', 'corriente']).optional(),
  titular: z.string().min(1, 'Ingresa el nombre del titular'),
  telefono: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.method === 'bank_transfer') {
    if (!data.banco || data.banco.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa el banco', path: ['banco'] })
    }
    if (!data.cci || data.cci.length !== 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El CCI debe tener exactamente 20 dígitos', path: ['cci'] })
    }
    if (!data.tipo_cuenta) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona el tipo de cuenta', path: ['tipo_cuenta'] })
    }
  } else {
    if (!data.telefono || data.telefono.length !== 9) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El teléfono debe tener 9 dígitos', path: ['telefono'] })
    }
  }
})

export type CashoutFormInput = z.infer<typeof cashoutFormSchema>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add cashout form validation schema"
```

---

## Task 3: CashoutDialog component

**Files:**
- Create: `src/components/recompensas/CashoutDialog.tsx`

- [ ] **Step 1: Create `src/components/recompensas/CashoutDialog.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cashoutFormSchema, type CashoutFormInput } from '@/lib/validations'
import { formatPrice, cn } from '@/lib/utils'
import { Banknote } from 'lucide-react'
import type { CashoutMethod, BankTransferDetails, WalletDetails } from '@/types/database'

interface CashoutDialogProps {
  availableBalance: number
  brokerId: string
  onSuccess: () => void
}

export default function CashoutDialog({
  availableBalance,
  brokerId,
  onSuccess,
}: CashoutDialogProps) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CashoutFormInput>({
    resolver: zodResolver(cashoutFormSchema),
  })

  const method = watch('method') as CashoutMethod | undefined

  const onSubmit = async (data: CashoutFormInput) => {
    let payment_details: BankTransferDetails | WalletDetails

    if (data.method === 'bank_transfer') {
      payment_details = {
        banco: data.banco!,
        cci: data.cci!,
        titular: data.titular,
        tipo_cuenta: data.tipo_cuenta!,
      }
    } else {
      payment_details = {
        titular: data.titular,
        telefono: data.telefono!,
      }
    }

    const { error } = await supabase.from('cashout_requests').insert({
      broker_id: brokerId,
      amount: data.amount,
      method: data.method,
      payment_details,
      status: 'pending' as const,
    })

    if (error) {
      toast.error('Error al enviar la solicitud. Intenta de nuevo.')
      return
    }

    toast.success('Solicitud de retiro enviada correctamente.')
    reset()
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={availableBalance <= 0}
          className="bg-brand-navy hover:bg-brand-navy-light text-white gap-2"
        >
          <Banknote size={16} />
          Solicitar retiro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar retiro de referidos</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Monto a retirar</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono pointer-events-none">
                S/.
              </span>
              <Input
                type="number"
                min="1"
                max={availableBalance}
                step="0.01"
                placeholder="0.00"
                className={cn('pl-10 font-mono tabular-nums', errors.amount && 'border-red-400')}
                onChange={(e) =>
                  setValue('amount', parseFloat(e.target.value) || 0, { shouldValidate: true })
                }
              />
            </div>
            <p className="text-xs text-slate-500">
              Disponible:{' '}
              <span className="font-semibold text-brand-green tabular-nums">
                {formatPrice(availableBalance)}
              </span>
            </p>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select
              onValueChange={(val) =>
                setValue('method', val as CashoutMethod, { shouldValidate: true })
              }
            >
              <SelectTrigger className={cn(errors.method && 'border-red-400')}>
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">🏦 Transferencia bancaria</SelectItem>
                <SelectItem value="yape">💜 Yape</SelectItem>
                <SelectItem value="plin">💚 Plin</SelectItem>
                <SelectItem value="otros">📱 Otros</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-xs text-red-500">{errors.method.message}</p>
            )}
          </div>

          {/* Bank transfer fields */}
          {method === 'bank_transfer' && (
            <>
              <div className="space-y-1.5">
                <Label>Banco</Label>
                <Input
                  placeholder="Ej: BCP, Interbank, BBVA"
                  {...register('banco')}
                  className={cn(errors.banco && 'border-red-400')}
                />
                {errors.banco && (
                  <p className="text-xs text-red-500">{errors.banco.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>CCI (20 dígitos)</Label>
                <Input
                  placeholder="00219300000000000000"
                  maxLength={20}
                  className={cn('font-mono tracking-wider', errors.cci && 'border-red-400')}
                  {...register('cci')}
                />
                {errors.cci && (
                  <p className="text-xs text-red-500">{errors.cci.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Titular de la cuenta</Label>
                <Input
                  placeholder="Nombre completo"
                  {...register('titular')}
                  className={cn(errors.titular && 'border-red-400')}
                />
                {errors.titular && (
                  <p className="text-xs text-red-500">{errors.titular.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de cuenta</Label>
                <Select
                  onValueChange={(val) =>
                    setValue('tipo_cuenta', val as 'ahorros' | 'corriente', {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={cn(errors.tipo_cuenta && 'border-red-400')}>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Ahorros</SelectItem>
                    <SelectItem value="corriente">Corriente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_cuenta && (
                  <p className="text-xs text-red-500">{errors.tipo_cuenta.message}</p>
                )}
              </div>
            </>
          )}

          {/* Yape / Plin / Otros fields */}
          {(method === 'yape' || method === 'plin' || method === 'otros') && (
            <>
              <div className="space-y-1.5">
                <Label>Titular</Label>
                <Input
                  placeholder="Nombre completo"
                  {...register('titular')}
                  className={cn(errors.titular && 'border-red-400')}
                />
                {errors.titular && (
                  <p className="text-xs text-red-500">{errors.titular.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Teléfono (9 dígitos)</Label>
                <Input
                  placeholder="987654321"
                  maxLength={9}
                  className={cn('font-mono', errors.telefono && 'border-red-400')}
                  {...register('telefono')}
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500">{errors.telefono.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setOpen(false) }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !method}
              className="bg-brand-navy hover:bg-brand-navy-light text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/recompensas/CashoutDialog.tsx
git commit -m "feat: add CashoutDialog component"
```

---

## Task 4: Update recompensas page with cashout section

**Files:**
- Modify: `src/app/(auth)/recompensas/page.tsx`

- [ ] **Step 1: Add imports at the top of the file**

After the existing imports, add:

```typescript
import CashoutDialog from '@/components/recompensas/CashoutDialog'
import { Wallet, Clock, ArrowDownCircle } from 'lucide-react'
import type { CashoutRequest, CashoutStatus } from '@/types/database'
```

- [ ] **Step 2: Add cashout config constants**

After the `TIER_GRADIENT` constant (around line 27), add:

```typescript
const CASHOUT_STATUS_CONFIG: Record<CashoutStatus, { label: string; badgeClass: string }> = {
  pending:   { label: 'Pendiente',  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:  { label: 'Aprobado',   badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected:  { label: 'Rechazado',  badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completado', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
}

const CASHOUT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: '🏦 Transferencia',
  yape:          '💜 Yape',
  plin:          '💚 Plin',
  otros:         '📱 Otros',
}
```

- [ ] **Step 3: Add cashout state inside `RecompensasPage`**

After the existing state declarations (after `setRewardsLoading`), add:

```typescript
const [cashouts, setCashouts] = useState<CashoutRequest[]>([])
const [cashoutsLoading, setCashoutsLoading] = useState(true)
```

- [ ] **Step 4: Replace `fetchData` to add cashout query**

Replace the entire `fetchData` function inside the `useEffect` with:

```typescript
const fetchData = async () => {
  setRewardsLoading(true)
  setCashoutsLoading(true)

  const [rewardsResult, referralsResult, referralRewardsResult, cashoutsResult] = await Promise.all([
    supabase
      .from('rewards')
      .select('*, tramites(reference_code)')
      .eq('broker_id', broker.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', broker.id),
    supabase
      .from('rewards')
      .select('amount')
      .eq('broker_id', broker.id)
      .eq('type', 'referral_bonus'),
    supabase
      .from('cashout_requests')
      .select('*')
      .eq('broker_id', broker.id)
      .order('created_at', { ascending: false }),
  ])

  setRewards((rewardsResult.data ?? []) as RewardRow[])
  setReferralCount(referralsResult.count ?? 0)
  const savingsSum = (referralRewardsResult.data ?? []).reduce(
    (sum, r) => sum + (r.amount ?? 0),
    0
  )
  setReferralSavings(savingsSum)
  setCashouts((cashoutsResult.data ?? []) as CashoutRequest[])
  setRewardsLoading(false)
  setCashoutsLoading(false)
}
```

- [ ] **Step 5: Add balance calculations after `const monthCount = ...`**

After `const monthCount = broker?.total_tramites_month ?? 0`, add:

```typescript
// Cashout balance calculations
const lockedAmount = cashouts
  .filter(c => c.status === 'pending')
  .reduce((sum, c) => sum + c.amount, 0)
const withdrawnAmount = cashouts
  .filter(c => c.status === 'approved' || c.status === 'completed')
  .reduce((sum, c) => sum + c.amount, 0)
const availableBalance = Math.max(0, referralSavings - lockedAmount - withdrawnAmount)
const hasPendingCashout = cashouts.some(c => c.status === 'pending')
```

- [ ] **Step 6: Add cashout section to JSX**

Add this new section between `{/* ── Section 3: Código de referido ── */}` (ends with `</Card>`) and `{/* ── Section 4: Historial de recompensas ── */}`:

```tsx
{/* ── Section 3b: Retiro de referidos ── */}
<div>
  <div className="flex items-center gap-2 mb-4">
    <Wallet size={18} className="text-slate-500" />
    <h2 className="text-lg font-semibold text-slate-900">Retiro de referidos</h2>
  </div>

  {brokerLoading || cashoutsLoading ? (
    <CardSkeleton />
  ) : (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        {/* Balance grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownCircle size={15} className="text-brand-green" />
              <span className="text-xs text-slate-500 font-medium">Saldo disponible</span>
            </div>
            <div className="text-xl font-bold text-brand-green tabular-nums font-mono">
              {formatPrice(availableBalance)}
            </div>
          </div>
          {lockedAmount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={15} className="text-amber-600" />
                <span className="text-xs text-slate-500 font-medium">En proceso</span>
              </div>
              <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                {formatPrice(lockedAmount)}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-slate-500">
            {hasPendingCashout
              ? 'Tienes una solicitud en proceso. Espera a que sea aprobada.'
              : availableBalance <= 0
              ? 'Sin saldo disponible para retirar.'
              : 'Puedes solicitar el retiro de tu saldo acumulado.'}
          </p>
          {broker && (
            <CashoutDialog
              availableBalance={availableBalance}
              brokerId={broker.id}
              onSuccess={() => {
                setCashoutsLoading(true)
                supabase
                  .from('cashout_requests')
                  .select('*')
                  .eq('broker_id', broker.id)
                  .order('created_at', { ascending: false })
                  .then(({ data }) => {
                    setCashouts((data ?? []) as CashoutRequest[])
                    setCashoutsLoading(false)
                  })
              }}
            />
          )}
        </div>

        {/* Cashout history */}
        {cashouts.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Historial de retiros</h3>
            <div className="space-y-2">
              {cashouts.map((c) => {
                const statusConf = CASHOUT_STATUS_CONFIG[c.status]
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-sm text-slate-500">
                        {CASHOUT_METHOD_LABEL[c.method] ?? c.method}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
                          statusConf.badgeClass
                        )}
                      >
                        {statusConf.label}
                      </span>
                      {c.status === 'rejected' && c.admin_notes && (
                        <span className="text-xs text-red-500 truncate max-w-[160px]">
                          {c.admin_notes}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-slate-800 tabular-nums font-mono">
                        {formatPrice(c.amount)}
                      </div>
                      <div className="text-xs text-slate-400">{formatDate(c.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )}
</div>
```

- [ ] **Step 7: Verify manually**

Navigate to `http://localhost:3000/recompensas`. Expected:
- Nueva sección "Retiro de referidos" aparece entre "Código de referido" e "Historial de recompensas"
- Muestra saldo disponible en verde
- Botón "Solicitar retiro" habilitado/deshabilitado según saldo y estado de cashouts
- Al hacer clic en "Solicitar retiro" se abre el modal con campos según método seleccionado

- [ ] **Step 8: Commit**

```bash
git add src/app/(auth)/recompensas/page.tsx
git commit -m "feat: add cashout section to recompensas page"
```

---

## Task 5: SuperAdmin layout + auth

**Files:**
- Create: `src/app/superadmin/layout.tsx`

- [ ] **Step 1: Create `src/app/superadmin/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ArrowDownCircle,
  GitCompare,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brokerResult } = await supabase
    .from('brokers')
    .select('is_superadmin, full_name, email')
    .eq('id', user.id)
    .single()

  const broker = brokerResult as {
    is_superadmin: boolean
    full_name: string
    email: string
  } | null

  if (!broker?.is_superadmin) redirect('/dashboard')

  // Use admin client to bypass RLS for counts
  const adminClient = createAdminClient()
  const [cashoutRes, priceMatchRes] = await Promise.all([
    adminClient
      .from('cashout_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('price_match_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const pendingCashouts = cashoutRes.count ?? 0
  const pendingPriceMatch = priceMatchRes.count ?? 0

  const navItems = [
    { href: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { href: '/superadmin/notarias', label: 'Notarías', icon: Building2, badge: null },
    { href: '/superadmin/brokers', label: 'Brokers', icon: Users, badge: null },
    { href: '/superadmin/tramites', label: 'Trámites', icon: FileText, badge: null },
    {
      href: '/superadmin/cashouts',
      label: 'Cashouts',
      icon: ArrowDownCircle,
      badge: pendingCashouts > 0 ? pendingCashouts : null,
    },
    {
      href: '/superadmin/price-match',
      label: 'Price Match',
      icon: GitCompare,
      badge: pendingPriceMatch > 0 ? pendingPriceMatch : null,
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-full bg-[#0A1930] z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-brand-gold" />
            <span className="text-white font-bold text-lg">TuCierre</span>
          </div>
          <div className="text-[10px] font-bold tracking-[0.15em] text-brand-gold/80 uppercase">
            Super Admin
          </div>
          <div className="text-white/40 text-xs mt-2 truncate">{broker.email}</div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.badge != null && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Navigate to `http://localhost:3000/superadmin`. With `carlos@notaryos.com` (is_superadmin=true): should see the sidebar. Any other user: redirected to `/dashboard`.

- [ ] **Step 3: Commit**

```bash
git add src/app/superadmin/layout.tsx
git commit -m "feat: add SuperAdmin layout with auth and sidebar"
```

---

## Task 6: SuperAdmin cashout server actions

**Files:**
- Create: `src/app/superadmin/cashouts/actions.ts`

- [ ] **Step 1: Create `src/app/superadmin/cashouts/actions.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function verifySuperAdmin(): Promise<{ error: string } | { userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data } = await supabase
    .from('brokers')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  const broker = data as { is_superadmin: boolean } | null
  if (!broker?.is_superadmin) return { error: 'Sin permisos' }

  return { userId: user.id }
}

export async function approveCashout(id: string): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({ status: 'approved', processed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}

export async function rejectCashout(
  id: string,
  notes: string
): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({
      status: 'rejected',
      admin_notes: notes,
      processed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}

export async function completeCashout(id: string): Promise<{ error?: string }> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('cashout_requests') as any)
    .update({ status: 'completed', processed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/superadmin/cashouts')
  return {}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/cashouts/actions.ts
git commit -m "feat: add superadmin cashout server actions"
```

---

## Task 7: SuperAdmin dashboard

**Files:**
- Create: `src/app/superadmin/page.tsx`

- [ ] **Step 1: Create `src/app/superadmin/page.tsx`**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/tramites/StatusBadge'
import Link from 'next/link'
import { Users, FileText, DollarSign, ArrowDownCircle, GitCompare, Building2 } from 'lucide-react'
import type { TramiteStatus } from '@/types/database'

interface RecentTramite {
  id: string
  reference_code: string
  status: TramiteStatus
  final_price: number
  updated_at: string
  tramite_types: { display_name: string } | null
  brokers: { full_name: string } | null
}

async function fetchSuperDashboard() {
  const adminClient = createAdminClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    brokersRes,
    notariasRes,
    allTramitesRes,
    monthTramitesRes,
    cashoutPendingRes,
    priceMatchPendingRes,
    recentRes,
  ] = await Promise.all([
    adminClient
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin', false)
      .eq('is_superadmin', false),
    adminClient
      .from('brokers')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin', true),
    adminClient.from('tramites').select('status'),
    adminClient
      .from('tramites')
      .select('status, final_price')
      .gte('created_at', startOfMonth),
    adminClient
      .from('cashout_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('price_match_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('tramites')
      .select(
        'id, reference_code, status, final_price, updated_at, tramite_types!tramite_type_id(display_name), brokers!broker_id(full_name)'
      )
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  const allTramites = (allTramitesRes.data ?? []) as { status: string }[]
  const activeTramites = allTramites.filter(t =>
    ['solicitado', 'documentos_pendientes', 'en_revision', 'en_firma', 'en_registro'].includes(
      t.status
    )
  ).length

  const monthTramites = (monthTramitesRes.data ?? []) as { status: string; final_price: number }[]
  const incomeThisMonth = monthTramites
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + (t.final_price || 0), 0)

  return {
    totalBrokers: brokersRes.count ?? 0,
    totalNotarias: notariasRes.count ?? 0,
    activeTramites,
    incomeThisMonth,
    pendingCashouts: cashoutPendingRes.count ?? 0,
    pendingPriceMatch: priceMatchPendingRes.count ?? 0,
    recentTramites: (recentRes.data ?? []) as unknown as RecentTramite[],
  }
}

export default async function SuperAdminDashboard() {
  const {
    totalBrokers,
    totalNotarias,
    activeTramites,
    incomeThisMonth,
    pendingCashouts,
    pendingPriceMatch,
    recentTramites,
  } = await fetchSuperDashboard()

  const kpis = [
    {
      title: 'Brokers registrados',
      value: totalBrokers.toString(),
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      sub: 'Total en la plataforma',
      href: '/superadmin/brokers',
      badge: null,
    },
    {
      title: 'Notarías activas',
      value: totalNotarias.toString(),
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      sub: 'Administradores registrados',
      href: '/superadmin/notarias',
      badge: null,
    },
    {
      title: 'Trámites activos',
      value: activeTramites.toString(),
      icon: FileText,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50',
      sub: 'En proceso actualmente',
      href: '/superadmin/tramites',
      badge: null,
    },
    {
      title: 'Ingresos del mes',
      value: formatPrice(incomeThisMonth),
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      sub: 'Trámites completados',
      href: null,
      badge: null,
    },
    {
      title: 'Cashouts pendientes',
      value: pendingCashouts.toString(),
      icon: ArrowDownCircle,
      iconColor: pendingCashouts > 0 ? 'text-red-600' : 'text-gray-500',
      iconBg: pendingCashouts > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: 'Solicitudes por procesar',
      href: '/superadmin/cashouts',
      badge: pendingCashouts > 0 ? pendingCashouts : null,
    },
    {
      title: 'Price Match pendientes',
      value: pendingPriceMatch.toString(),
      icon: GitCompare,
      iconColor: pendingPriceMatch > 0 ? 'text-red-600' : 'text-gray-500',
      iconBg: pendingPriceMatch > 0 ? 'bg-red-50' : 'bg-gray-50',
      sub: 'Solicitudes por revisar',
      href: '/superadmin/price-match',
      badge: pendingPriceMatch > 0 ? pendingPriceMatch : null,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Global</h1>
        <p className="text-sm text-gray-500 mt-1">Vista de toda la plataforma TuCierre</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const card = (
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon size={20} className={kpi.iconColor} />
                  </div>
                  {kpi.badge != null && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {kpi.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
          return kpi.href ? (
            <Link key={kpi.title} href={kpi.href}>
              {card}
            </Link>
          ) : (
            <div key={kpi.title}>{card}</div>
          )
        })}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Actividad reciente (todas las notarías)
        </h2>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {recentTramites.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin actividad reciente</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTramites.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs font-mono font-semibold text-gray-700 shrink-0">
                      {t.reference_code}
                    </p>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.brokers?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.tramite_types?.display_name ?? '—'}
                      </p>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatPrice(t.final_price)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(t.updated_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/page.tsx
git commit -m "feat: add SuperAdmin global dashboard"
```

---

## Task 8: SuperAdmin cashouts page

**Files:**
- Create: `src/app/superadmin/cashouts/page.tsx`
- Create: `src/app/superadmin/cashouts/CashoutsClient.tsx`

- [ ] **Step 1: Create `src/app/superadmin/cashouts/page.tsx`**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import CashoutsClient from './CashoutsClient'
import type { CashoutStatus, CashoutMethod } from '@/types/database'

export interface CashoutRow {
  id: string
  broker_id: string
  amount: number
  method: CashoutMethod
  payment_details: Record<string, string>
  status: CashoutStatus
  admin_notes: string | null
  created_at: string
  processed_at: string | null
  brokers: { full_name: string; email: string } | null
}

export default async function SuperAdminCashoutsPage() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('cashout_requests')
    .select('*, brokers!broker_id(full_name, email)')
    .order('created_at', { ascending: false })

  const cashouts = (data ?? []) as unknown as CashoutRow[]
  return <CashoutsClient initialCashouts={cashouts} />
}
```

- [ ] **Step 2: Create `src/app/superadmin/cashouts/CashoutsClient.tsx`**

```tsx
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

      {/* Summary cards / filters */}
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

                  {/* Payment details toggle */}
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

                  {/* Actions */}
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/superadmin/cashouts/
git commit -m "feat: add SuperAdmin cashouts page with approve/reject/complete"
```

---

## Task 9: SuperAdmin notarías page

**Files:**
- Create: `src/app/superadmin/notarias/page.tsx`

- [ ] **Step 1: Create `src/app/superadmin/notarias/page.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/notarias/page.tsx
git commit -m "feat: add SuperAdmin notarías page"
```

---

## Task 10: SuperAdmin brokers page

**Files:**
- Create: `src/app/superadmin/brokers/page.tsx`

- [ ] **Step 1: Create `src/app/superadmin/brokers/page.tsx`**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { TIER_CONFIG } from '@/lib/constants'
import type { BrokerTier } from '@/types/database'

interface BrokerRow {
  id: string
  full_name: string
  email: string
  phone: string
  company_name: string | null
  tier: BrokerTier
  total_tramites: number
  total_tramites_month: number
  created_at: string
}

export default async function SuperAdminBrokersPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('brokers')
    .select(
      'id, full_name, email, phone, company_name, tier, total_tramites, total_tramites_month, created_at'
    )
    .eq('is_admin', false)
    .eq('is_superadmin', false)
    .order('created_at', { ascending: false })

  const brokers = (data ?? []) as BrokerRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
        <p className="text-sm text-gray-500 mt-1">
          {brokers.length} broker{brokers.length !== 1 ? 's' : ''} registrado
          {brokers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Broker',
                'Email',
                'Teléfono',
                'Tier',
                'Trámites',
                'Este mes',
                'Registrado',
              ].map(h => (
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
            {brokers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No hay brokers registrados
                </td>
              </tr>
            ) : (
              brokers.map(b => {
                const tierConf = TIER_CONFIG[b.tier]
                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{b.full_name}</div>
                      {b.company_name && (
                        <div className="text-xs text-slate-400">{b.company_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{b.email}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{b.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tierConf.bg} ${tierConf.color}`}
                      >
                        {tierConf.icon} {tierConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {b.total_tramites}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {b.total_tramites_month}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(b.created_at)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/brokers/page.tsx
git commit -m "feat: add SuperAdmin brokers page"
```

---

## Task 11: SuperAdmin trámites page

**Files:**
- Create: `src/app/superadmin/tramites/page.tsx`

- [ ] **Step 1: Create `src/app/superadmin/tramites/page.tsx`**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/tramites/page.tsx
git commit -m "feat: add SuperAdmin tramites page"
```

---

## Task 12: SuperAdmin price-match page

**Files:**
- Create: `src/app/superadmin/price-match/page.tsx`

- [ ] **Step 1: Create `src/app/superadmin/price-match/page.tsx`**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type { PriceMatchStatus } from '@/types/database'

interface PriceMatchRow {
  id: string
  competitor_name: string
  competitor_price: number
  our_matched_price: number | null
  evidence_url: string | null
  status: PriceMatchStatus
  created_at: string
  reviewed_at: string | null
  brokers: { full_name: string; email: string } | null
  tramite_types: { display_name: string } | null
}

const STATUS_CONFIG: Record<PriceMatchStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Aprobado',  className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function SuperAdminPriceMatchPage() {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('price_match_requests')
    .select('*, brokers!broker_id(full_name, email), tramite_types(display_name)')
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as PriceMatchRow[]

  const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Match</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todas las solicitudes de price match ({requests.length})
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['pending', 'approved', 'rejected'] as PriceMatchStatus[]).map(s => (
          <div
            key={s}
            className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm"
          >
            <div className="text-2xl font-bold text-slate-900">{byStatus[s] ?? 0}</div>
            <div className="text-xs text-slate-500 mt-0.5">{STATUS_CONFIG[s].label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                'Broker',
                'Tipo de trámite',
                'Notaría competidora',
                'Precio cotizado',
                'Precio igualado',
                'Estado',
                'Fecha',
                'Evidencia',
              ].map(h => (
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
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No hay solicitudes de price match
                </td>
              </tr>
            ) : (
              requests.map(r => {
                const statusConf = STATUS_CONFIG[r.status]
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-xs">
                        {r.brokers?.full_name ?? '—'}
                      </div>
                      <div className="text-slate-400 text-xs">{r.brokers?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.tramite_types?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{r.competitor_name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-xs">
                      {formatPrice(r.competitor_price)}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-xs">
                      {r.our_matched_price != null ? (
                        <span className="font-semibold text-green-700">
                          {formatPrice(r.our_matched_price)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border',
                          statusConf.className
                        )}
                      >
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {r.evidence_url ? (
                        <a
                          href={r.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Ver <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/price-match/page.tsx
git commit -m "feat: add SuperAdmin price-match page"
```

---

## Final verification

- [ ] Run `npm run build` and confirm zero TypeScript/build errors
- [ ] Navigate to `/recompensas` — verify cashout section, modal, and historial appear
- [ ] Navigate to `/superadmin` as `carlos@notaryos.com` — verify dashboard, sidebar with badges
- [ ] Navigate to `/superadmin/cashouts` — verify table, approve/reject/complete flows work
- [ ] Navigate to `/superadmin` as a non-superadmin user — verify redirect to `/dashboard`
