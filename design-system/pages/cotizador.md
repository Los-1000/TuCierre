# Cotizador — Design Override
> Overrides MASTER.md for `/cotizar` (3-step wizard)

## Wizard Frame

```
Step indicator (top) → Step content (center) → Actions (bottom, sticky on mobile)
```

### Step Indicator

```
[1 Tipo] ——— [2 Datos] ——— [3 Resumen]
  ●              ○              ○
```
- Completed steps: filled circle (accent) + checkmark
- Current step: filled circle (primary) + bold label
- Pending steps: empty circle (border) + muted label
- Connector line: accent for completed, gray for pending

## Paso 1: Tipo de Trámite

- Grid of cards: 2 columns (mobile), 3 columns (desktop)
- Each tramite card:
  ```
  Rounded-xl border-2 border-border p-5
  Icon (40px, primary color) + display_name (H3) + description (text-sm) + precio base
  Selected: border-primary bg-primary/5 shadow-md
  Hover: border-primary/50 shadow-sm
  transition-all duration-150
  ```
- Tramite types: Compraventa, Hipoteca, Poder Notarial, Constitución de Empresa, etc.
- Cards are `role="radio"` for accessibility

## Paso 2: Datos del Trámite

Layout: 2-column form (desktop), single column (mobile)

### Sección Inmueble
- Dirección (text input, full width)
- Distrito (select with Peruvian districts)
- Valor del inmueble (number input, S/. prefix, tabular font)

### Sección Partes
- Dynamic list — add multiple parties
- Each party: Nombre + DNI + Rol (select: comprador/vendedor/otro) + Email + Teléfono
- [+ Agregar parte] ghost button below
- Remove party: X icon on each party card

### Validation
- All fields: validate on blur
- DNI: exactly 8 digits
- Email: valid format
- Value: positive number only

## Paso 3: Resumen y Precio

### Price Breakdown Card
```
┌─────────────────────────────────┐
│ Precio base:          S/. 1,500 │
│ Descuento Plata (5%):  - S/. 75 │
│ ─────────────────────────────── │
│ Total:                S/. 1,425 │  ← large, bold, accent color
└─────────────────────────────────┘
```
Price updates in real-time as user fills Step 2 data.
Animate price change: brief scale + color flash on value update.

### Resumen de datos
- Tipo: badge
- Inmueble: address + district
- Partes: avatars/initials list

### Actions (sticky bottom bar on mobile)
```
[Tengo una cotización más baja]  [Solicitar trámite →]
     ghost / text button              accent primary
```

## Price Match Modal

Triggered from Step 3:
```
Dialog: "¿Tienes una cotización más baja?"
- Nombre de notaría (text)
- Precio cotizado (number, S/.)
- Subir evidencia (file upload: JPG/PDF, max 5MB)
[Cancelar] [Enviar solicitud]
```

## Mobile Sticky Footer

On mobile, wrap [Siguiente] / [Solicitar trámite] in:
```css
position: sticky;
bottom: 0;
padding-bottom: env(safe-area-inset-bottom);
background: white;
border-top: 1px solid #e2e8f0;
padding: 16px;
```
