# Sistema de Comisiones por Trámite — Broker

**Fecha:** 2026-03-26
**Proyecto:** TuCierre
**Estado:** Aprobado

---

## Resumen

Los brokers ganan una comisión mensual por cada trámite completado que trajeron a la notaría. La comisión es un porcentaje retroactivo del precio final del trámite, determinado por el número de clientes cerrados en el mes. Al inicio de cada mes, el SuperAdmin genera los pagos del mes anterior y los transfiere por banco.

Reemplaza el sistema de `volume_discount`. El bono por referido de otros brokers (`referral_bonus`) se mantiene sin cambios.

---

## 1. Estructura de comisiones

| Nivel | Clientes/mes | Comisión |
|-------|-------------|----------|
| 🥉 Nivel 1 | 1 a 3 | 3% |
| 🥈 Nivel 2 | 4 a 7 | 5% |
| 🥇 Nivel 3 | 8+ | 8% |

**Retroactivo:** el tier al final del mes aplica a todos los trámites de ese mes.

**Cálculo por mes M:**
```
count = trámites completados en M con commission_cashout_id IS NULL
rate  = 3% si count ≤ 3 | 5% si 4 ≤ count ≤ 7 | 8% si count ≥ 8
comisión_M = SUM(final_price de esos trámites) × rate
```

**Comisión disponible = SUM de todos los meses no cobrados.**

---

## 2. Base de datos

### 2.1 Campo nuevo en `tramites`

```sql
ALTER TABLE tramites
  ADD COLUMN commission_cashout_id UUID REFERENCES cashout_requests(id);
```

- `NULL` = comisión pendiente de pago
- UUID = incluido en ese cashout_request

### 2.2 Campo nuevo en `cashout_requests`

```sql
ALTER TABLE cashout_requests
  ADD COLUMN cashout_type TEXT NOT NULL DEFAULT 'referral_bonus'
  CHECK (cashout_type IN ('referral_bonus', 'commission'));
```

Los cashouts existentes quedan con `cashout_type = 'referral_bonus'` por defecto.

### 2.3 TypeScript — actualizaciones en `src/types/database.ts`

```typescript
export type CashoutType = 'referral_bonus' | 'commission'

// Añadir cashout_type a CashoutRequest
export interface CashoutRequest {
  // ...campos existentes...
  cashout_type: CashoutType
}
```

`volume_discount` se elimina de los nuevos registros pero no del enum — los registros históricos quedan intactos.

---

## 3. Módulo broker — Registrar cliente

### 3.1 Nueva ruta: `/clientes/nuevo`

Formulario simple de 4 campos:

| Campo | Tipo | Detalle |
|-------|------|---------|
| Tipo de trámite | Select | Tipos activos (igual que cotizador) |
| Precio | Number | Auto-rellena con `base_price`, editable |
| DNI del cliente | Text | 8 dígitos numéricos |
| Nombre del cliente | Text | Texto libre |

Al confirmar:
- Crea `tramite` con `status = 'solicitado'`, `broker_id` del broker logueado
- Inserta al cliente en `parties` con rol `'comprador'` (nombre + DNI)
- Genera `reference_code` automáticamente

El trámite aparece inmediatamente en la lista de trámites del broker con seguimiento en tiempo real.

### 3.2 Sidebar del broker

Añadir ítem **"Mis clientes"** (o "Nuevo cliente") al sidebar del layout `(auth)` para acceder a `/clientes/nuevo`.

---

## 4. Módulo admin notaría — Walk-in con código de broker

En el panel admin, nueva sección **"Registrar trámite de broker"** (página `/admin/tramites/nuevo-broker` o modal en la lista de trámites).

Campos:
| Campo | Tipo | Detalle |
|-------|------|---------|
| Código de referido | Text | Código del broker (ej. TC-ABC123) |
| Tipo de trámite | Select | Tipos activos |
| Precio | Number | Editable |
| DNI del cliente | Text | 8 dígitos |
| Nombre del cliente | Text | |

Flujo:
1. Admin ingresa código de referido → sistema busca broker y muestra nombre para confirmación
2. Admin completa datos → confirma
3. Se crea `tramite` con el `broker_id` de ese broker y `status = 'solicitado'`

Si el código no existe → error claro: "Código de broker no encontrado".

---

## 5. Dashboard del broker — Comisión estimada

### 5.1 Tarjeta en `/dashboard`

Nueva card **"Comisiones del mes"** entre las métricas principales:

- Clientes cerrados este mes (trámites completados)
- Nivel actual con badge (🥉/🥈/🥇 + porcentaje)
- Comisión estimada en S/. (calculada al vuelo)
- "X clientes más para Nivel Y" si no está en Nivel 3

### 5.2 Sección en `/recompensas`

Nueva sección **"Comisiones"** — solo lectura, sin botón de retiro:

**Cards de resumen:**
- Comisión del mes actual (estimada, badge verde)
- Total acumulado pendiente de pago

**Historial de comisiones por mes (tabla):**
| Mes | Clientes | Nivel | % | Monto | Estado |
|-----|----------|-------|---|-------|--------|
| Marzo 2026 | 5 | 🥈 Nivel 2 | 5% | S/. 380.00 | Pagado |
| Abril 2026 | 2 | 🥉 Nivel 1 | 3% | S/. 90.00 | Pendiente |

Estados: `pendiente` (amarillo) = cashout generado pero no pagado, `pagado` (verde) = completed.

---

## 6. SuperAdmin — Cierre de mes

### 6.1 Nueva pestaña en `/superadmin/cashouts`

Tab **"Comisiones mensuales"** separado del tab de referidos.

Muestra todos los brokers con comisión del mes anterior pendiente de generar:

| Broker | Email | Clientes | Nivel | Monto | Datos bancarios |
|--------|-------|----------|-------|-------|----------------|
| Juan García | juan@... | 8 | 🥇 8% | S/. 640 | BCP ···1234 |

### 6.2 Botón "Generar pagos del mes"

Server action `generateMonthlyCommissions(year, month)`:

1. Busca todos los brokers con trámites completados en ese mes con `commission_cashout_id IS NULL`
2. Para cada broker calcula la comisión del mes (count → tier → rate × sum)
3. Inserta un `cashout_request` con `cashout_type = 'commission'`, `status = 'pending'`, `amount = comisión calculada`, `payment_details` desde los datos bancarios del broker (tabla `brokers`)
4. Actualiza `commission_cashout_id` en todos los trámites incluidos

### 6.3 Flujo post-generación

Cada fila generada sigue el flujo existente:
- `pending` → SuperAdmin transfiere por banco → marca `completed`
- Si hay un error → `rejected` con nota

---

## 7. Archivos a crear/modificar

### Nuevos
- `src/app/(auth)/clientes/nuevo/page.tsx` — Formulario registrar cliente
- `src/app/admin/tramites/nuevo-broker/page.tsx` — Registrar walk-in con código
- `src/app/superadmin/cashouts/commission-actions.ts` — `generateMonthlyCommissions`
- `src/lib/commission.ts` — Lógica de cálculo de comisión (pura, sin DB calls)

### Modificados
- `src/types/database.ts` — Añadir `CashoutType`, `cashout_type` en `CashoutRequest`, `commission_cashout_id` en `Tramite`
- `src/app/(auth)/dashboard/page.tsx` — Card de comisión del mes
- `src/app/(auth)/recompensas/page.tsx` — Sección comisiones (solo lectura)
- `src/app/(auth)/layout.tsx` — Ítem "Mis clientes" en sidebar
- `src/app/superadmin/cashouts/CashoutsClient.tsx` — Tab comisiones mensuales

---

## 8. Flujo completo

```
Broker registra cliente en /clientes/nuevo
  → tramite creado (status = solicitado)
  → notaría procesa → status = completado
  → commission_cashout_id = NULL (pendiente)

  ó

Cliente llega a notaría con código de broker
  → admin registra en /admin/tramites/nuevo-broker
  → tramite creado con broker_id del código
  → notaría completa → commission_cashout_id = NULL

Fin de mes:
  → SuperAdmin genera pagos del mes
  → cashout_request creado por broker (type=commission)
  → commission_cashout_id actualizado en tramites
  → SuperAdmin transfiere y marca como completado
  → Broker ve "Pagado" en historial de recompensas
```
