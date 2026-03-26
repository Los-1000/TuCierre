# Detalle de Trámite — Design Override
> Overrides MASTER.md for `/tramites/[id]`

## Layout

```
Desktop: 2-column (7:5 ratio) — Timeline/Info left, Chat right
Mobile:  Tabbed: [Seguimiento] [Documentos] [Chat] [Detalles]
```

## Header

```
← Mis Trámites                          [Cancelar trámite]
TC-2024-00001 — Compraventa
Juana García → Pedro López · S/. 1,425  [Estado badge]
```

## Timeline Visual (left column / Seguimiento tab)

Inspired by delivery tracking (Rappi/Uber style):

```
● Cotizado         15 ene · 10:23am      ← completed (filled accent circle)
│
● Solicitado       15 ene · 2:45pm       ← completed
│
● Docs. Pendientes 16 ene · 9:00am       ← completed
│
◉ En Revisión      16 ene · 3:00pm  ←── CURRENT (pulsing circle, highlighted card)
│
○ En Firma         Pendiente             ← future (empty circle, muted)
│
○ En Registro      Pendiente
│
○ Completado       Est. 22 ene
```

### Timeline Implementation
- Vertical line connecting dots: `border-l-2 border-border ml-3`
- Completed line segment: `border-accent`
- Current dot: `ring-4 ring-accent/30 animate-pulse`
- Each step: relative date + note (if any)
- Click a step: expand to show changed_by + notes

### Estimated completion banner
```
bg-accent/10 border border-accent/30 rounded-lg p-3
"Estimado: 22 de enero (5 días hábiles)"
```

## Documentos Section

List of required_documents from tramite_type:

```
┌─────────────────────────────────────────────────────┐
│ 📄 DNI del comprador          [Subir] ← pending     │
│ ✅ DNI del vendedor           Subido 15 ene          │
│ ✅ Partida registral          Aprobado               │
│ ❌ Contrato de arras          Rechazado (ver nota)   │
│ 📄 Minuta                     [Subir]                │
└─────────────────────────────────────────────────────┘
```

Status icons:
- Pending: gray circle icon
- Uploaded (pending review): amber clock icon
- Approved: green checkmark
- Rejected: red X + expandable rejection note

File upload:
- `<input type="file" accept=".pdf,.jpg,.jpeg,.png">` hidden
- Custom styled button triggers it
- Upload progress: linear progress bar (0–100%)
- On mobile: `capture="environment"` for camera option

## Chat Section (right column / Chat tab)

### Message bubbles
```
Broker (you):  right-aligned, bg-primary text-white, rounded-xl rounded-tr-sm
Notaría:       left-aligned, bg-gray-100 text-text-primary, rounded-xl rounded-tl-sm
```

### Input area (sticky bottom)
```
[Adjuntar 📎] [Text input, grows up to 4 lines] [Enviar →]
```

### Realtime indicator
- "Conectado" green dot when Supabase Realtime active
- "Reconectando..." amber when offline

### Attachments in chat
- Image: thumbnail preview (max 200px)
- PDF: document icon + filename + download link

## Partes Section

Cards for each party:
```
Initials avatar (bg-primary/10) + Nombre + DNI + Rol badge + email + phone
```

## Precio Summary

```
Precio base:     S/. 1,500
Descuento (5%):  - S/. 75
──────────────────────────
Total:           S/. 1,425  ← bold, accent

Price match:     [Ver cotización igualada] if applicable
```

## Cancel Tramite

- Button: "Cancelar trámite" — text-error, bottom of page, visually separated
- Triggers `AlertDialog` confirmation:
  ```
  "¿Cancelar este trámite?"
  "Esta acción no se puede deshacer. Si necesitas continuar después, deberás crear una nueva cotización."
  [Volver] · [Sí, cancelar]
  ```
