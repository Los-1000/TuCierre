# Cashout de Referidos + Módulo SuperAdmin

**Fecha:** 2026-03-26
**Proyecto:** TuCierre
**Estado:** Aprobado

---

## Resumen

Dos módulos nuevos:

1. **Cashout de referidos** — los brokers pueden retirar su saldo acumulado de bonos de referidos mediante transferencia bancaria o billetera electrónica (Yape, Plin, Otros).
2. **SuperAdmin** — vista de plataforma global para `carlos@notaryos.com` con acceso a todas las notarías, brokers, trámites, cashouts y price match.

---

## 1. Base de datos

### 1.1 Nueva tabla: `cashout_requests`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | Generado automáticamente |
| `broker_id` | UUID FK → brokers | Broker que solicita el retiro |
| `amount` | numeric | Monto solicitado en S/. |
| `method` | text (enum) | `bank_transfer` \| `yape` \| `plin` \| `otros` |
| `payment_details` | JSONB | Datos de pago según método (ver abajo) |
| `status` | text (enum) | `pending` \| `approved` \| `rejected` \| `completed` |
| `admin_notes` | text nullable | Notas del SuperAdmin al procesar |
| `created_at` | timestamptz | Auto |
| `processed_at` | timestamptz nullable | Cuando el status cambia de `pending` |

**`payment_details` para `bank_transfer`:**
```json
{ "banco": "BCP", "cci": "00219300...", "titular": "Juan Pérez", "tipo_cuenta": "ahorros" }
```

**`payment_details` para `yape` / `plin` / `otros`:**
```json
{ "titular": "Juan Pérez", "telefono": "987654321" }
```

### 1.2 Campo nuevo en `brokers`

```sql
ALTER TABLE brokers ADD COLUMN is_superadmin boolean NOT NULL DEFAULT false;
```

Setear `is_superadmin = true` manualmente para el usuario con email `carlos@notaryos.com`.

### 1.3 Nuevos tipos TypeScript en `src/types/database.ts`

```typescript
export type CashoutMethod = 'bank_transfer' | 'yape' | 'plin' | 'otros'
export type CashoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'

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
```

También añadir `cashout_requests` al interface `Database`.

---

## 2. Módulo de usuario — Recompensas

### 2.1 Lógica de saldo

- **Saldo total ganado:** `SUM(rewards WHERE type = 'referral_bonus' AND broker_id = X)`
- **Saldo bloqueado:** `SUM(cashout_requests WHERE broker_id = X AND status = 'pending')`
- **Saldo ya retirado:** `SUM(cashout_requests WHERE broker_id = X AND status IN ('approved', 'completed'))`
- **Saldo disponible:** total ganado − bloqueado − ya retirado

### 2.2 Nueva sección en `/recompensas`

Ubicación: entre "Código de referido" y "Historial de recompensas".

**Bloque de saldo (cards):**
- Saldo disponible (verde, prominente)
- Saldo bloqueado en proceso (amarillo, solo si hay un `pending`)
- Botón "Solicitar retiro" — deshabilitado cuando: saldo disponible = 0, o existe un cashout con status `pending`

**Modal de solicitud (`CashoutDialog`):**
1. Input de monto (min: S/. 1, max: saldo disponible)
2. Selector de método: Transferencia Bancaria / Yape / Plin / Otros
3. Campos condicionales:
   - `bank_transfer`: Banco (text), CCI (text), Titular (text), Tipo de cuenta (select: ahorros/corriente)
   - `yape` / `plin` / `otros`: Titular (text), Teléfono (text)
4. Botón "Confirmar solicitud" → inserta en `cashout_requests` con status `pending`
5. Toast de éxito → cierra modal y refresca saldo

**Historial de cashouts (tabla):**
- Columnas: Fecha, Monto, Método, Estado (badge), Notas (si fue rechazado)
- Estados con colores: pending=amarillo, approved=azul, completed=verde, rejected=rojo

### 2.3 Archivo nuevo

`src/components/recompensas/CashoutDialog.tsx` — componente client con el formulario del modal.

---

## 3. Módulo SuperAdmin

### 3.1 Estructura de rutas

```
src/app/superadmin/
  layout.tsx              ← Sidebar + auth (is_superadmin)
  page.tsx                ← Dashboard global
  notarias/
    page.tsx              ← Todas las notarías
  brokers/
    page.tsx              ← Todos los brokers
  tramites/
    page.tsx              ← Todos los trámites
  cashouts/
    page.tsx              ← Gestión de cashouts
    actions.ts            ← Server actions: aprobar/rechazar/completar
  price-match/
    page.tsx              ← Todos los price match requests
```

### 3.2 Auth

El layout de `/superadmin` verifica `is_superadmin = true` en la tabla `brokers`. Si no cumple → `redirect('/login')`.

### 3.3 Sidebar

Mismo estilo navy (`bg-brand-navy`) que el admin existente. Badge "SUPER ADMIN" en el encabezado para diferenciarlo visualmente.

Nav items:
- Dashboard (`/superadmin`)
- Notarías (`/superadmin/notarias`)
- Brokers (`/superadmin/brokers`)
- Trámites (`/superadmin/tramites`)
- Cashouts (`/superadmin/cashouts`) — badge con conteo de `pending`
- Price Match (`/superadmin/price-match`) — badge con conteo de `pending`

### 3.4 Dashboard (`/superadmin`)

KPIs en cards:
- Total brokers registrados
- Total trámites activos (cross-notaría)
- Ingresos totales del mes (completados)
- Cashouts pendientes (rojo si > 0)
- Price Match pendientes (rojo si > 0)

Tabla "Actividad reciente" con los últimos 10 trámites de todas las notarías.

### 3.5 Cashouts (`/superadmin/cashouts`)

Tabla principal con columnas:
- Broker (nombre + email)
- Monto (S/.)
- Método (badge)
- Datos de pago (expandible o columna resumida)
- Estado (badge)
- Fecha solicitud
- Acciones

Acciones por fila según estado:
- `pending`: **Aprobar** (verde) + **Rechazar** (rojo con campo de notas)
- `approved`: **Marcar como pagado** (azul)
- `rejected` / `completed`: sin acciones

Server actions en `cashouts/actions.ts`:
- `approveCashout(id)` → status = `approved`, processed_at = now()
- `rejectCashout(id, notes)` → status = `rejected`, admin_notes = notes, processed_at = now()
- `completeCashout(id)` → status = `completed`
- Todas verifican `is_superadmin` antes de ejecutar

### 3.6 Notarías (`/superadmin/notarias`)

Lista de todos los brokers con `is_admin = true`. Por cada notaría:
- Nombre de notaría, email
- Total trámites históricos
- Trámites activos
- Ingresos del mes
- Total brokers que usan esa notaría

### 3.7 Brokers, Trámites, Price Match

- Muestran los mismos datos que el admin, pero sin filtro por notaría (todos los registros).
- Read-only para esta versión (no gestiona tramites desde superadmin).

---

## 4. Flujo completo de un cashout

```
Broker solicita retiro
  → cashout_requests: status = pending, amount bloqueado
  → SuperAdmin ve solicitud en /superadmin/cashouts
  → Aprobar → status = approved (procesará la transferencia externamente)
  → Marcar como pagado → status = completed
           ó
  → Rechazar (con nota) → status = rejected, saldo disponible nuevamente
```

---

## 5. Archivos a crear/modificar

### Nuevos
- `src/app/superadmin/layout.tsx`
- `src/app/superadmin/page.tsx`
- `src/app/superadmin/notarias/page.tsx`
- `src/app/superadmin/brokers/page.tsx`
- `src/app/superadmin/tramites/page.tsx`
- `src/app/superadmin/cashouts/page.tsx`
- `src/app/superadmin/cashouts/actions.ts`
- `src/app/superadmin/price-match/page.tsx`
- `src/components/recompensas/CashoutDialog.tsx`

### Modificados
- `src/types/database.ts` — nuevos tipos
- `src/app/(auth)/recompensas/page.tsx` — nueva sección cashout
- `src/lib/validations.ts` — schema zod para cashout form
