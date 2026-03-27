# Broker Commissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement tiered monthly broker commissions (3%/5%/8%) replacing volume_discount — brokers earn retroactive commission on completed tramites, payable by SuperAdmin at month-end.

**Architecture:** Pure calculation logic in `src/lib/commission.ts`, DB schema extended with `cashout_type` on `cashout_requests` and `commission_cashout_id` on `tramites`, new broker client-registration page, admin walk-in page, dashboard card, read-only recompensas section, and SuperAdmin monthly-generation flow.

**Tech Stack:** Next.js 14 App Router (Server Components + Server Actions), Supabase (createClient + createAdminClient), react-hook-form + zod, shadcn/ui, TypeScript

---

## File Map

### Created
- `src/lib/commission.ts` — Pure commission calculation (no DB)
- `src/app/(auth)/clientes/nuevo/page.tsx` — Broker registers new client
- `src/app/admin/tramites/nuevo-broker/page.tsx` — Admin registers walk-in with broker code
- `src/app/superadmin/cashouts/commission-actions.ts` — `generateMonthlyCommissions` server action

### Modified
- `src/types/database.ts` — Add `CashoutType`, `cashout_type` on `CashoutRequest`, `commission_cashout_id` on `Tramite`
- `src/components/layout/Sidebar.tsx` — Add "Mis Clientes" nav item
- `src/app/(auth)/dashboard/page.tsx` — Commission card between stats and tier progress
- `src/app/(auth)/recompensas/page.tsx` — Read-only commission section after referidos
- `src/app/superadmin/cashouts/page.tsx` — Pass referral vs commission cashouts separately
- `src/app/superadmin/cashouts/CashoutsClient.tsx` — Add "Comisiones mensuales" tab

---

### Task 1: SQL migration (run in Supabase dashboard)

**Files:** (none — SQL to execute in Supabase SQL editor)

- [ ] **Step 1: Run this SQL in the Supabase SQL editor**

```sql
-- 1. Add commission_cashout_id to tramites
ALTER TABLE tramites
  ADD COLUMN IF NOT EXISTS commission_cashout_id UUID REFERENCES cashout_requests(id);

-- 2. Add cashout_type to cashout_requests
ALTER TABLE cashout_requests
  ADD COLUMN IF NOT EXISTS cashout_type TEXT NOT NULL DEFAULT 'referral_bonus'
  CHECK (cashout_type IN ('referral_bonus', 'commission'));
```

- [ ] **Step 2: Verify in Table Editor**

Check that `tramites` has `commission_cashout_id` column (nullable UUID) and `cashout_requests` has `cashout_type` column with default `'referral_bonus'`.

---

### Task 2: TypeScript types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add `CashoutType` and update `CashoutRequest` and `Tramite`**

Open `src/types/database.ts` and apply these changes:

After line `export type CashoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'` add:
```typescript
export type CashoutType = 'referral_bonus' | 'commission'
```

In `CashoutRequest` interface, add after `processed_at`:
```typescript
  cashout_type: CashoutType
```

In `Tramite` interface, add after `completed_at`:
```typescript
  commission_cashout_id: string | null
```

In `Database.Tables.cashout_requests`, the `Insert` type should already include `cashout_type` since it's derived from `CashoutRequest`. Verify it reads:
```typescript
cashout_requests: {
  Row: CashoutRequest
  Insert: Omit<CashoutRequest, 'id' | 'created_at'>
  Update: Partial<Omit<CashoutRequest, 'id' | 'broker_id' | 'created_at'>>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add CashoutType, cashout_type, commission_cashout_id types"
```

---

### Task 3: Commission calculation logic

**Files:**
- Create: `src/lib/commission.ts`

- [ ] **Step 1: Create `src/lib/commission.ts`**

```typescript
export interface MonthlyCommissionResult {
  count: number
  rate: number
  amount: number
  tier: 1 | 2 | 3
}

/**
 * Calculate commission for a broker in a given month.
 * @param tramites Array of { final_price: number } for completed tramites in that month
 *                 with commission_cashout_id IS NULL.
 */
export function calculateMonthlyCommission(
  tramites: { final_price: number }[]
): MonthlyCommissionResult {
  const count = tramites.length
  let rate: number
  let tier: 1 | 2 | 3

  if (count <= 3) {
    rate = 0.03
    tier = 1
  } else if (count <= 7) {
    rate = 0.05
    tier = 2
  } else {
    rate = 0.08
    tier = 3
  }

  const total = tramites.reduce((sum, t) => sum + t.final_price, 0)
  const amount = Math.round(total * rate * 100) / 100

  return { count, rate, amount, tier }
}

export const COMMISSION_TIER_CONFIG: Record<1 | 2 | 3, {
  label: string
  icon: string
  minClients: number
  maxClients: number | null
  ratePercent: number
}> = {
  1: { label: 'Nivel 1', icon: '🥉', minClients: 1,  maxClients: 3,    ratePercent: 3 },
  2: { label: 'Nivel 2', icon: '🥈', minClients: 4,  maxClients: 7,    ratePercent: 5 },
  3: { label: 'Nivel 3', icon: '🥇', minClients: 8,  maxClients: null, ratePercent: 8 },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/commission.ts
git commit -m "feat: add pure commission calculation logic"
```

---

### Task 4: Sidebar — "Mis Clientes" nav item

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add Users icon import and nav item**

In `src/components/layout/Sidebar.tsx`, change the import line:
```typescript
// Before
import {
  LayoutDashboard, FileText, Calculator, Gift, ArrowLeftRight,
  Settings, LogOut, Shield
} from 'lucide-react'

// After
import {
  LayoutDashboard, FileText, Calculator, Gift, ArrowLeftRight,
  Settings, LogOut, Shield, UserPlus
} from 'lucide-react'
```

Change the `navItems` array:
```typescript
const navItems = [
  { href: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/tramites',       label: 'Mis Trámites', icon: FileText },
  { href: '/cotizar',        label: 'Cotizar',      icon: Calculator },
  { href: '/clientes/nuevo', label: 'Nuevo cliente',icon: UserPlus },
  { href: '/recompensas',    label: 'Recompensas',  icon: Gift },
  { href: '/price-match',    label: 'Price Match',  icon: ArrowLeftRight },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Nuevo cliente nav item to broker sidebar"
```

---

### Task 5: Broker — register new client page

**Files:**
- Create: `src/app/(auth)/clientes/nuevo/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
// src/app/(auth)/clientes/nuevo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { UserPlus } from 'lucide-react'
import type { TramiteType } from '@/types/database'

const schema = z.object({
  tramite_type_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  final_price: z.number({ invalid_type_error: 'Ingresa un precio válido' }).positive('El precio debe ser mayor a 0'),
  client_dni: z.string().length(8, 'El DNI debe tener 8 dígitos').regex(/^\d{8}$/, 'Solo dígitos'),
  client_name: z.string().min(2, 'Ingresa el nombre del cliente'),
})

type FormValues = z.infer<typeof schema>

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedTypeId = watch('tramite_type_id')

  useEffect(() => {
    supabase
      .from('tramite_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name')
      .then(({ data }) => setTramiteTypes((data ?? []) as TramiteType[]))
  }, [])

  // Auto-fill price when type changes
  useEffect(() => {
    if (!selectedTypeId) return
    const type = tramiteTypes.find(t => t.id === selectedTypeId)
    if (type) setValue('final_price', type.base_price)
  }, [selectedTypeId, tramiteTypes])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('No autenticado'); return }

      // Fetch broker to get notaria_id
      const { data: broker } = await supabase
        .from('brokers')
        .select('id')
        .eq('id', user.id)
        .single()
      if (!broker) { toast.error('Broker no encontrado'); return }

      // Generate reference code
      const refCode = 'TC-' + Math.random().toString(36).toUpperCase().slice(2, 8)

      const type = tramiteTypes.find(t => t.id === values.tramite_type_id)!
      const { data: tramite, error: tramiteError } = await supabase
        .from('tramites')
        .insert({
          broker_id: user.id,
          tramite_type_id: values.tramite_type_id,
          reference_code: refCode,
          status: 'solicitado',
          quoted_price: type.base_price,
          discount_applied: 0,
          final_price: values.final_price,
          price_matched: false,
          parties: [{
            name: values.client_name,
            dni: values.client_dni,
            role: 'comprador',
            email: '',
            phone: '',
          }],
          documents: [],
          commission_cashout_id: null,
        })
        .select('id')
        .single()

      if (tramiteError) { toast.error(tramiteError.message); return }

      toast.success('Cliente registrado — trámite ' + refCode)
      router.push('/tramites/' + tramite.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
          <UserPlus size={22} /> Registrar cliente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Crea un trámite para tu cliente. Aparecerá en tu lista para seguimiento en tiempo real.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del trámite</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tipo de trámite */}
            <div className="space-y-1.5">
              <Label>Tipo de trámite</Label>
              <Select onValueChange={v => setValue('tramite_type_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tramiteTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.display_name} — {formatPrice(t.base_price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tramite_type_id && (
                <p className="text-xs text-destructive">{errors.tramite_type_id.message}</p>
              )}
            </div>

            {/* Precio */}
            <div className="space-y-1.5">
              <Label>Precio (S/.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">S/.</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="pl-10"
                  placeholder="0.00"
                  {...register('final_price', { valueAsNumber: true })}
                />
              </div>
              {errors.final_price && (
                <p className="text-xs text-destructive">{errors.final_price.message}</p>
              )}
            </div>

            {/* DNI */}
            <div className="space-y-1.5">
              <Label>DNI del cliente</Label>
              <Input
                type="text"
                maxLength={8}
                placeholder="12345678"
                {...register('client_dni')}
              />
              {errors.client_dni && (
                <p className="text-xs text-destructive">{errors.client_dni.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label>Nombre del cliente</Label>
              <Input
                type="text"
                placeholder="Juan Pérez"
                {...register('client_name')}
              />
              {errors.client_name && (
                <p className="text-xs text-destructive">{errors.client_name.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand-navy text-parchment hover:bg-brand-navy-light" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page renders**

Navigate to `http://localhost:3000/clientes/nuevo` while logged in as a broker. Confirm: tipo de trámite select populates, selecting a type auto-fills the price, form submits and redirects to the new tramite.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/clientes/nuevo/page.tsx
git commit -m "feat: broker can register new client at /clientes/nuevo"
```

---

### Task 6: Admin — walk-in tramite with broker code

**Files:**
- Create: `src/app/admin/tramites/nuevo-broker/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
// src/app/admin/tramites/nuevo-broker/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Search, CheckCircle2 } from 'lucide-react'
import type { TramiteType } from '@/types/database'

const schema = z.object({
  referral_code: z.string().min(1, 'Ingresa el código de referido'),
  tramite_type_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  final_price: z.number({ invalid_type_error: 'Precio inválido' }).positive(),
  client_dni: z.string().length(8, 'DNI: 8 dígitos').regex(/^\d{8}$/),
  client_name: z.string().min(2, 'Ingresa el nombre'),
})

type FormValues = z.infer<typeof schema>

interface BrokerResult {
  id: string
  full_name: string
  email: string
}

export default function NuevoBrokerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [foundBroker, setFoundBroker] = useState<BrokerResult | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const selectedTypeId = watch('tramite_type_id')
  const referralCode = watch('referral_code')

  useEffect(() => {
    supabase
      .from('tramite_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name')
      .then(({ data }) => setTramiteTypes((data ?? []) as TramiteType[]))
  }, [])

  useEffect(() => {
    if (!selectedTypeId) return
    const type = tramiteTypes.find(t => t.id === selectedTypeId)
    if (type) setValue('final_price', type.base_price)
  }, [selectedTypeId, tramiteTypes])

  const lookupBroker = async () => {
    if (!referralCode) return
    setLookingUp(true)
    setFoundBroker(null)
    const { data } = await supabase
      .from('brokers')
      .select('id, full_name, email')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .single()
    setLookingUp(false)
    if (!data) {
      toast.error('Código de broker no encontrado')
      return
    }
    setFoundBroker(data as BrokerResult)
  }

  const onSubmit = async (values: FormValues) => {
    if (!foundBroker) { toast.error('Busca el código de broker primero'); return }
    setSubmitting(true)
    try {
      const refCode = 'TC-' + Math.random().toString(36).toUpperCase().slice(2, 8)
      const type = tramiteTypes.find(t => t.id === values.tramite_type_id)!

      const { data: tramite, error } = await supabase
        .from('tramites')
        .insert({
          broker_id: foundBroker.id,
          tramite_type_id: values.tramite_type_id,
          reference_code: refCode,
          status: 'solicitado',
          quoted_price: type.base_price,
          discount_applied: 0,
          final_price: values.final_price,
          price_matched: false,
          parties: [{
            name: values.client_name,
            dni: values.client_dni,
            role: 'comprador',
            email: '',
            phone: '',
          }],
          documents: [],
          commission_cashout_id: null,
        })
        .select('id')
        .single()

      if (error) { toast.error(error.message); return }
      toast.success('Trámite creado para broker ' + foundBroker.full_name + ' — ' + refCode)
      router.push('/admin/tramites/' + tramite.id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar trámite de broker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Para clientes que llegan a la notaría con un código de broker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Código de referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="TC-ABC123"
              {...register('referral_code')}
              className="uppercase"
            />
            <Button type="button" variant="outline" onClick={lookupBroker} disabled={lookingUp}>
              <Search size={15} className="mr-1" />
              {lookingUp ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
          {errors.referral_code && (
            <p className="text-xs text-destructive">{errors.referral_code.message}</p>
          )}
          {foundBroker && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={15} />
              <span><strong>{foundBroker.full_name}</strong> — {foundBroker.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del trámite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Tipo de trámite</Label>
              <Select onValueChange={v => setValue('tramite_type_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tramiteTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.display_name} — {formatPrice(t.base_price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tramite_type_id && <p className="text-xs text-destructive">{errors.tramite_type_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Precio (S/.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/.</span>
                <Input type="number" min={0} step={0.01} className="pl-10" {...register('final_price', { valueAsNumber: true })} />
              </div>
              {errors.final_price && <p className="text-xs text-destructive">{errors.final_price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>DNI del cliente</Label>
              <Input type="text" maxLength={8} placeholder="12345678" {...register('client_dni')} />
              {errors.client_dni && <p className="text-xs text-destructive">{errors.client_dni.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Nombre del cliente</Label>
              <Input type="text" placeholder="Juan Pérez" {...register('client_name')} />
              {errors.client_name && <p className="text-xs text-destructive">{errors.client_name.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-navy text-parchment hover:bg-brand-navy-light"
              disabled={submitting || !foundBroker}
            >
              {submitting ? 'Registrando...' : 'Registrar trámite'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Add "Trámite de broker" link in admin tramites page nav**

In `src/app/admin/tramites/page.tsx` (the server component), this is handled by the `TramitesClient`. Check if there's a nav button — if not, add a link in the admin layout or note that the URL is directly accessible at `/admin/tramites/nuevo-broker`.

The page is already accessible at the URL — no additional nav changes required.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/tramites/nuevo-broker/page.tsx
git commit -m "feat: admin can register walk-in tramite with broker referral code"
```

---

### Task 7: Dashboard — commission card

**Files:**
- Modify: `src/app/(auth)/dashboard/page.tsx`

- [ ] **Step 1: Update `getDashboardData` to fetch commission data**

In `src/app/(auth)/dashboard/page.tsx`, update the `getDashboardData` function to also fetch completed tramites for the current month with `commission_cashout_id IS NULL`:

Replace the existing `getDashboardData` function with:

```typescript
async function getDashboardData(brokerId: string) {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [tramitesResult, rewardsResult, commissionTramitesResult] = await Promise.all([
    supabase
      .from('tramites')
      .select('*, tramite_types(display_name)')
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('rewards')
      .select('amount')
      .eq('broker_id', brokerId)
      .eq('applied', true),
    supabase
      .from('tramites')
      .select('final_price')
      .eq('broker_id', brokerId)
      .eq('status', 'completado')
      .gte('completed_at', startOfMonth)
      .is('commission_cashout_id', null),
  ])

  const tramites = (tramitesResult.data ?? []) as Tramite[]
  const rewards = (rewardsResult.data ?? []) as { amount: number }[]
  const commissionTramites = (commissionTramitesResult.data ?? []) as { final_price: number }[]

  const activeCount = tramites.filter(t =>
    !['completado', 'cancelado', 'cotizado'].includes(t.status)
  ).length

  const completedThisMonth = tramites.filter(t =>
    t.status === 'completado' && t.completed_at && t.completed_at >= startOfMonth
  ).length

  const totalAmount = tramites
    .filter(t => t.status === 'completado')
    .reduce((sum, t) => sum + t.final_price, 0)

  const totalSavings = rewards.reduce((sum, r) => sum + r.amount, 0)

  return { tramites, activeCount, completedThisMonth, totalAmount, totalSavings, commissionTramites }
}
```

- [ ] **Step 2: Add commission card import and rendering**

At the top of `dashboard/page.tsx`, add the import:
```typescript
import { calculateMonthlyCommission, COMMISSION_TIER_CONFIG } from '@/lib/commission'
```

In the `DashboardPage` component, destructure `commissionTramites` from `dashboardData`:
```typescript
const { tramites, activeCount, completedThisMonth, totalAmount, totalSavings, commissionTramites } = dashboardData
```

Add commission calculation after the existing tier variables:
```typescript
const commissionResult = calculateMonthlyCommission(commissionTramites)
const commissionTierConfig = COMMISSION_TIER_CONFIG[commissionResult.tier]
const nextCommissionTier = commissionResult.tier < 3 ? COMMISSION_TIER_CONFIG[(commissionResult.tier + 1) as 2 | 3] : null
const clientsToNextCommissionTier = nextCommissionTier
  ? Math.max(nextCommissionTier.minClients - commissionResult.count, 0)
  : 0
```

Insert this card **after** the stats grid and **before** the tier progress card. Find the `{/* Tier progress */}` comment and insert before it:

```tsx
      {/* Commission card */}
      <Card className="bg-white border-border shadow-none overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Comisiones del mes
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{commissionTierConfig.icon}</span>
                <span className="font-semibold text-sm text-ink">{commissionTierConfig.label}</span>
                <span className="text-xs text-muted-foreground">· {commissionTierConfig.ratePercent}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {commissionResult.count} cliente{commissionResult.count !== 1 ? 's' : ''} cerrado{commissionResult.count !== 1 ? 's' : ''} este mes
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-semibold text-xl text-brand-emerald tabular-nums">
                {formatPrice(commissionResult.amount)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">comisión estimada</div>
            </div>
          </div>
          {clientsToNextCommissionTier > 0 && nextCommissionTier && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              <span className="font-semibold text-ink">{clientsToNextCommissionTier} cliente{clientsToNextCommissionTier !== 1 ? 's' : ''} más</span>
              {' '}para {nextCommissionTier.label} ({nextCommissionTier.ratePercent}%)
            </p>
          )}
        </CardContent>
      </Card>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/dashboard/page.tsx
git commit -m "feat: add commission card to broker dashboard"
```

---

### Task 8: Recompensas — commission section (read-only)

**Files:**
- Modify: `src/app/(auth)/recompensas/page.tsx`

- [ ] **Step 1: Add commission data fetching**

`recompensas/page.tsx` is a client component using `useEffect`. Add commission state variables and data fetching.

After the existing state declarations (near `const [cashouts, setCashouts] = useState...`), add:
```typescript
  const [commissionMonths, setCommissionMonths] = useState<CommissionMonth[]>([])
  const [commissionsLoading, setCommissionsLoading] = useState(true)
```

Add the `CommissionMonth` interface at the top of the file (after imports):
```typescript
interface CommissionMonth {
  yearMonth: string  // 'YYYY-MM'
  tramites: { final_price: number; commission_cashout_id: string | null }[]
  cashoutStatus: 'pending' | 'completed' | 'unpaid'
}
```

In the `fetchData` function inside `useEffect`, add commission tramites fetch to `Promise.all`:
```typescript
    const [rewardsResult, referralsResult, referralRewardsResult, cashoutsResult, commTramitesResult] = await Promise.all([
      // ...existing queries...
      supabase
        .from('tramites')
        .select('final_price, commission_cashout_id, completed_at')
        .eq('broker_id', broker.id)
        .eq('status', 'completado')
        .not('completed_at', 'is', null),
    ])
```

After setting existing state, add:
```typescript
      // Group commission tramites by month
      const tramiteRows = (commTramitesResult.data ?? []) as {
        final_price: number
        commission_cashout_id: string | null
        completed_at: string
      }[]
      const byMonth: Record<string, typeof tramiteRows> = {}
      for (const t of tramiteRows) {
        const ym = t.completed_at.slice(0, 7) // 'YYYY-MM'
        if (!byMonth[ym]) byMonth[ym] = []
        byMonth[ym].push(t)
      }
      // Also fetch cashout statuses for commission cashouts
      const commCashoutIds = [...new Set(tramiteRows.map(t => t.commission_cashout_id).filter(Boolean))] as string[]
      const cashoutStatusMap: Record<string, 'pending' | 'completed'> = {}
      if (commCashoutIds.length > 0) {
        const { data: cData } = await supabase
          .from('cashout_requests')
          .select('id, status')
          .in('id', commCashoutIds)
        for (const c of (cData ?? [])) {
          cashoutStatusMap[c.id] = (c as any).status === 'completed' ? 'completed' : 'pending'
        }
      }
      const months: CommissionMonth[] = Object.entries(byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([ym, trams]) => {
          const firstCashoutId = trams.find(t => t.commission_cashout_id)?.commission_cashout_id
          const cashoutStatus = firstCashoutId
            ? (cashoutStatusMap[firstCashoutId] ?? 'pending')
            : 'unpaid'
          return { yearMonth: ym, tramites: trams, cashoutStatus }
        })
      setCommissionMonths(months)
      setCommissionsLoading(false)
```

Also add `setCommissionsLoading(true)` at the top of `fetchData`.

- [ ] **Step 2: Add commission imports and rendering**

Add imports at the top of the file:
```typescript
import { calculateMonthlyCommission, COMMISSION_TIER_CONFIG } from '@/lib/commission'
import { DollarSign } from 'lucide-react'
```

Insert the commission section **after** the "Retiro de referidos" section and **before** "Historial de recompensas":

```tsx
      {/* ── Section 3c: Comisiones ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Comisiones</h2>
        </div>

        {commissionsLoading ? (
          <CardSkeleton />
        ) : commissionMonths.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-10 text-center">
              <DollarSign size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Aún no tienes comisiones generadas.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Summary cards */}
              {(() => {
                const currentMonth = new Date().toISOString().slice(0, 7)
                const currentMonthData = commissionMonths.find(m => m.yearMonth === currentMonth)
                const pendingMonths = commissionMonths.filter(m => m.cashoutStatus === 'unpaid')
                const currentCommission = currentMonthData
                  ? calculateMonthlyCommission(currentMonthData.tramites)
                  : null
                const totalPending = pendingMonths.reduce((sum, m) => {
                  const r = calculateMonthlyCommission(m.tramites)
                  return sum + r.amount
                }, 0)
                return (
                  <div className="grid grid-cols-2 gap-3 p-5 border-b border-slate-100">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1">Comisión este mes</div>
                      <div className="text-xl font-bold text-brand-green tabular-nums font-mono">
                        {currentCommission ? formatPrice(currentCommission.amount) : 'S/. 0.00'}
                      </div>
                      {currentCommission && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {COMMISSION_TIER_CONFIG[currentCommission.tier].icon} {COMMISSION_TIER_CONFIG[currentCommission.tier].label} · {COMMISSION_TIER_CONFIG[currentCommission.tier].ratePercent}%
                        </div>
                      )}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1">Pendiente de cobro</div>
                      <div className="text-xl font-bold text-amber-700 tabular-nums font-mono">
                        {formatPrice(totalPending)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">se paga a fin de mes</div>
                    </div>
                  </div>
                )
              })()}

              {/* Monthly history table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Mes', 'Clientes', 'Nivel', '%', 'Monto', 'Estado'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {commissionMonths.map(month => {
                      const r = calculateMonthlyCommission(month.tramites)
                      const tc = COMMISSION_TIER_CONFIG[r.tier]
                      const [year, mo] = month.yearMonth.split('-')
                      const label = new Date(parseInt(year), parseInt(mo) - 1, 1)
                        .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                      return (
                        <tr key={month.yearMonth} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-medium text-slate-800 capitalize">{label}</td>
                          <td className="px-4 py-3 text-slate-600">{r.count}</td>
                          <td className="px-4 py-3">{tc.icon} {tc.label}</td>
                          <td className="px-4 py-3 text-slate-600">{tc.ratePercent}%</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-800 tabular-nums">{formatPrice(r.amount)}</td>
                          <td className="px-4 py-3">
                            {month.cashoutStatus === 'completed' ? (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Pagado</span>
                            ) : month.cashoutStatus === 'pending' ? (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">En proceso</span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/recompensas/page.tsx
git commit -m "feat: add read-only commission history section to recompensas"
```

---

### Task 9: `generateMonthlyCommissions` server action

**Files:**
- Create: `src/app/superadmin/cashouts/commission-actions.ts`

- [ ] **Step 1: Create the server action file**

```typescript
// src/app/superadmin/cashouts/commission-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { calculateMonthlyCommission } from '@/lib/commission'

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

interface GenerateResult {
  error?: string
  generated?: number
}

export async function generateMonthlyCommissions(
  year: number,
  month: number  // 1-based
): Promise<GenerateResult> {
  const check = await verifySuperAdmin()
  if ('error' in check) return { error: check.error }

  const adminClient = createAdminClient()

  // Month boundaries (ISO strings)
  const startOfMonth = new Date(year, month - 1, 1).toISOString()
  const endOfMonth = new Date(year, month, 1).toISOString()

  // Fetch all completed tramites in that month with no commission cashout yet
  const { data: tramites, error: fetchError } = await adminClient
    .from('tramites')
    .select('id, broker_id, final_price')
    .eq('status', 'completado')
    .gte('completed_at', startOfMonth)
    .lt('completed_at', endOfMonth)
    .is('commission_cashout_id', null)

  if (fetchError) return { error: fetchError.message }
  if (!tramites || tramites.length === 0) return { generated: 0 }

  // Group by broker
  const byBroker: Record<string, { id: string; final_price: number }[]> = {}
  for (const t of tramites as { id: string; broker_id: string; final_price: number }[]) {
    if (!byBroker[t.broker_id]) byBroker[t.broker_id] = []
    byBroker[t.broker_id].push({ id: t.id, final_price: t.final_price })
  }

  // Fetch brokers' payment details
  const brokerIds = Object.keys(byBroker)
  const { data: brokers, error: brokersError } = await adminClient
    .from('brokers')
    .select('id, full_name, email')
    .in('id', brokerIds)

  if (brokersError) return { error: brokersError.message }

  let generated = 0

  for (const broker of (brokers ?? []) as { id: string; full_name: string; email: string }[]) {
    const brokerTramites = byBroker[broker.id]
    if (!brokerTramites?.length) continue

    const result = calculateMonthlyCommission(brokerTramites)
    if (result.amount <= 0) continue

    // Insert cashout_request for this broker
    const { data: cashout, error: cashoutError } = await (adminClient.from('cashout_requests') as any)
      .insert({
        broker_id: broker.id,
        amount: result.amount,
        method: 'bank_transfer',
        payment_details: {
          nota: `Comisión mensual ${year}-${String(month).padStart(2, '0')}`,
          broker: broker.full_name,
        },
        status: 'pending',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cashout_type: 'commission' as any,
        admin_notes: null,
      })
      .select('id')
      .single()

    if (cashoutError) {
      console.error('[generateMonthlyCommissions] cashout insert error for broker', broker.id, cashoutError.message)
      continue
    }

    // Update all tramites with commission_cashout_id
    const tramiteIds = brokerTramites.map(t => t.id)
    const { error: updateError } = await adminClient
      .from('tramites')
      .update({ commission_cashout_id: cashout.id })
      .in('id', tramiteIds)

    if (updateError) {
      console.error('[generateMonthlyCommissions] tramites update error', updateError.message)
      continue
    }

    generated++
  }

  revalidatePath('/superadmin/cashouts')
  return { generated }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/superadmin/cashouts/commission-actions.ts
git commit -m "feat: generateMonthlyCommissions server action"
```

---

### Task 10: SuperAdmin cashouts — "Comisiones mensuales" tab

**Files:**
- Modify: `src/app/superadmin/cashouts/page.tsx`
- Modify: `src/app/superadmin/cashouts/CashoutsClient.tsx`

- [ ] **Step 1: Update `page.tsx` to pass separate cashout types and broker commission data**

Replace `src/app/superadmin/cashouts/page.tsx` with:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import CashoutsClient from './CashoutsClient'
import type { CashoutStatus, CashoutMethod } from '@/types/database'
import { calculateMonthlyCommission } from '@/lib/commission'

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
  cashout_type: string
  brokers: { full_name: string; email: string } | null
}

export interface BrokerPendingCommission {
  broker_id: string
  broker_name: string
  broker_email: string
  count: number
  tier: 1 | 2 | 3
  rate: number
  amount: number
}

export default async function SuperAdminCashoutsPage() {
  const adminClient = createAdminClient()

  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStart = prevMonth.toISOString()
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [cashoutsResult, pendingCommTramitesResult] = await Promise.all([
    adminClient
      .from('cashout_requests')
      .select('*, brokers!broker_id(full_name, email)')
      .order('created_at', { ascending: false }),
    adminClient
      .from('tramites')
      .select('id, broker_id, final_price, brokers!broker_id(full_name, email)')
      .eq('status', 'completado')
      .gte('completed_at', prevMonthStart)
      .lt('completed_at', prevMonthEnd)
      .is('commission_cashout_id', null),
  ])

  const cashouts = (cashoutsResult.data ?? []) as unknown as CashoutRow[]

  // Compute pending commissions per broker for previous month
  const tramites = (pendingCommTramitesResult.data ?? []) as {
    id: string
    broker_id: string
    final_price: number
    brokers: { full_name: string; email: string } | null
  }[]

  const byBroker: Record<string, { tramites: { final_price: number }[]; broker: { full_name: string; email: string } }> = {}
  for (const t of tramites) {
    if (!byBroker[t.broker_id]) {
      byBroker[t.broker_id] = {
        tramites: [],
        broker: t.brokers ?? { full_name: '—', email: '—' },
      }
    }
    byBroker[t.broker_id].tramites.push({ final_price: t.final_price })
  }

  const pendingCommissions: BrokerPendingCommission[] = Object.entries(byBroker)
    .map(([broker_id, { tramites: bt, broker }]) => {
      const r = calculateMonthlyCommission(bt)
      return {
        broker_id,
        broker_name: broker.full_name,
        broker_email: broker.email,
        count: r.count,
        tier: r.tier,
        rate: r.rate,
        amount: r.amount,
      }
    })
    .filter(b => b.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <CashoutsClient
      initialCashouts={cashouts}
      pendingCommissions={pendingCommissions}
      prevYear={prevMonth.getFullYear()}
      prevMonth={prevMonth.getMonth() + 1}
    />
  )
}
```

- [ ] **Step 2: Update `CashoutsClient.tsx` to add the commissions tab**

At the top of `CashoutsClient.tsx`, add the import for the new types and the server action:
```typescript
import type { BrokerPendingCommission } from './page'
import { generateMonthlyCommissions } from './commission-actions'
import { COMMISSION_TIER_CONFIG } from '@/lib/commission'
import { Calendar } from 'lucide-react'
```

Update the component signature to accept new props:
```typescript
export default function CashoutsClient({
  initialCashouts,
  pendingCommissions,
  prevYear,
  prevMonth,
}: {
  initialCashouts: CashoutRow[]
  pendingCommissions: BrokerPendingCommission[]
  prevYear: number
  prevMonth: number
}) {
```

Add tab state at the top of the component:
```typescript
  const [activeTab, setActiveTab] = useState<'referidos' | 'comisiones'>('referidos')
  const [generating, setGenerating] = useState(false)
```

Add the handler:
```typescript
  const handleGenerateCommissions = async () => {
    setGenerating(true)
    const result = await generateMonthlyCommissions(prevYear, prevMonth)
    setGenerating(false)
    if (result.error) { toast.error(result.error); return }
    toast.success(`${result.generated ?? 0} pago${result.generated !== 1 ? 's' : ''} generado${result.generated !== 1 ? 's' : ''}`)
  }
```

Replace the existing JSX return with a tabbed layout. The full updated return:

```tsx
  const prevMonthLabel = new Date(prevYear, prevMonth - 1, 1)
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const referidoCashouts = cashouts.filter(c => (c as any).cashout_type !== 'commission')
  const commissionCashouts = cashouts.filter(c => (c as any).cashout_type === 'commission')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashouts</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona retiros y comisiones de brokers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['referidos', 'comisiones'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
              activeTab === tab
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab === 'referidos' ? 'Referidos' : 'Comisiones mensuales'}
            {tab === 'referidos' && referidoCashouts.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {referidoCashouts.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Referidos tab — existing content, now filtered to referido cashouts only */}
      {activeTab === 'referidos' && (
        // ... KEEP all existing cashout card rendering logic but use `referidoCashouts` instead of `cashouts`
        // The existing code renders pending and resolved sections — just pass referidoCashouts to the filter
        <div className="space-y-4">
          {/* existing pending/resolved rendering — replace `cashouts` variable references with `referidoCashouts` */}
        </div>
      )}

      {/* Comisiones tab */}
      {activeTab === 'comisiones' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Comisiones de <span className="capitalize">{prevMonthLabel}</span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {pendingCommissions.length} broker{pendingCommissions.length !== 1 ? 's' : ''} con comisión pendiente de generar
              </p>
            </div>
            {pendingCommissions.length > 0 && (
              <Button
                onClick={handleGenerateCommissions}
                disabled={generating}
                className="bg-brand-navy hover:bg-brand-navy-light text-parchment gap-2"
              >
                <Calendar size={15} />
                {generating ? 'Generando...' : 'Generar pagos del mes'}
              </Button>
            )}
          </div>

          {pendingCommissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 size={28} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-slate-500">No hay comisiones pendientes de generar para {prevMonthLabel}.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Broker', 'Email', 'Clientes', 'Nivel', 'Monto'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pendingCommissions.map(b => {
                    const tc = COMMISSION_TIER_CONFIG[b.tier]
                    return (
                      <tr key={b.broker_id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{b.broker_name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{b.broker_email}</td>
                        <td className="px-4 py-3 text-slate-700">{b.count}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{tc.icon} {tc.label} · {tc.ratePercent}%</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                          S/. {b.amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Past commission cashouts */}
          {commissionCashouts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pagos de comisión generados</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['Broker', 'Monto', 'Estado', 'Fecha'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {commissionCashouts.map(c => {
                      const sc = STATUS_CONFIG[c.status]
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 text-xs">{c.brokers?.full_name ?? '—'}</div>
                            <div className="text-slate-400 text-xs">{c.brokers?.email}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold tabular-nums text-xs">{formatPrice(c.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', sc.className)}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
```

**Note for the referidos tab:** The existing rendering logic in `CashoutsClient.tsx` uses local `cashouts` state from `useState(initialCashouts)`. After adding tabs, filter the displayed cashouts:
- In the existing pending/resolved rendering, replace `.filter(c => c.status === 'pending')` with `.filter(c => c.status === 'pending' && (c as any).cashout_type !== 'commission')` — OR — use the pre-split `referidoCashouts` variable from the render scope.

The simplest approach: keep the `cashouts` state as-is (all cashouts), and in the referidos tab render filter by `cashout_type !== 'commission'`, in the comisiones tab filter by `cashout_type === 'commission'`.

- [ ] **Step 3: Commit**

```bash
git add src/app/superadmin/cashouts/page.tsx src/app/superadmin/cashouts/CashoutsClient.tsx
git commit -m "feat: add Comisiones mensuales tab to superadmin cashouts with generate action"
```

---

### Task 11: Admin tramites — link to nuevo-broker page

**Files:**
- Modify: `src/app/admin/tramites/TramitesClient.tsx`

- [ ] **Step 1: Add "Trámite de broker" button**

In `src/app/admin/tramites/TramitesClient.tsx`, find the header section and add a link button to `/admin/tramites/nuevo-broker`. Look for the existing header with the title "Trámites" and add next to any existing action button:

```tsx
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

// In the header area:
<Link href="/admin/tramites/nuevo-broker">
  <Button variant="outline" size="sm" className="gap-1.5">
    <UserPlus size={14} />
    Trámite de broker
  </Button>
</Link>
```

Read the file first to find the correct location.

- [ ] **Step 2: Verify**

Navigate to `/admin/tramites` as an admin — confirm the "Trámite de broker" button appears and links to the new page.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/tramites/TramitesClient.tsx
git commit -m "feat: add Trámite de broker button in admin tramites list"
```

---

### Task 12: Final integration check

- [ ] **Step 1: Verify full flow as broker**

1. Log in as a broker
2. Sidebar shows "Nuevo cliente" — click it
3. Select tramite type → price auto-fills → enter DNI + name → submit
4. Redirects to tramite detail page with status `solicitado`
5. Dashboard shows commission card (may show S/. 0.00 if no completed tramites)
6. Recompensas page shows "Comisiones" section with empty state or history table

- [ ] **Step 2: Verify full flow as admin**

1. Log in as admin (notaría)
2. Navigate to `/admin/tramites/nuevo-broker`
3. Enter a valid broker referral code → click Buscar → broker name appears
4. Complete form → submit → redirects to tramite detail

- [ ] **Step 3: Verify full flow as SuperAdmin**

1. Log in as SuperAdmin (`carlos@notaryos.com`)
2. Navigate to `/superadmin/cashouts`
3. See two tabs: "Referidos" and "Comisiones mensuales"
4. "Comisiones mensuales" shows brokers with pending commissions for previous month
5. Click "Generar pagos del mes" → toast shows count of generated payments
6. Previously pending brokers disappear from the table
7. Generated cashouts appear in "Pagos de comisión generados"

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: finalize broker commission system integration"
```
