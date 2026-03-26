# Panel Admin — Design Override
> Overrides MASTER.md for `/admin` (notaría staff, protected by role)

## Visual Distinction from Broker UI

Admin panel uses a slightly different visual treatment to prevent confusion:
- Sidebar background: `#1a365d` (primary dark blue) instead of white
- Sidebar text/icons: white
- Top bar accent: slightly different shade
- Optional: "PANEL NOTARÍA" badge in sidebar header

## Dashboard Admin

### KPI Cards (top row, 4 cards)
- Trámites pendientes de acción
- Ingresos del mes (S/.)
- Brokers activos
- Price match requests pendientes (with red badge if >0)

### Quick Actions Panel
- [Price match pendientes] — badge count
- [Documentos por revisar]
- [Mensajes sin responder]

## Tabla de Trámites (main content)

Full data table with:
- Columns: Código | Broker | Tipo | Estado | Precio | Fecha | Acciones
- Sortable columns (click header)
- Filters: status dropdown + date range + broker search
- Bulk actions: select multiple + change status
- Row actions: [Ver detalle] [Cambiar estado] [Agregar nota]

### Cambiar Estado Dialog
```
Select nuevo estado (dropdown)
Textarea: notas / mensaje para el broker (opcional)
[Cancelar] [Actualizar estado]
```

## Gestión de Price Match

List of pending requests:
```
Broker: Juan García     Tipo: Compraventa
Competidor: Notaría X   Precio: S/. 1,200
Evidencia: [Ver PDF]
─────────────────────────────────
Nuestro precio: S/. 1,425
Precio igualado: [S/. ______] input
[Rechazar] [Aprobar con precio igualado]
```

## Gestión de Brokers

Searchable table:
- Columns: Nombre | DNI | Tier | Trámites/mes | Total | Registrado | Acciones
- Filter by tier
- Row: [Ver perfil] [Ajustar tier manualmente]

Broker profile view:
- Historial completo de trámites
- Historial de recompensas
- Cambiar tier manually (with note)

## Gestión de Tipos de Trámite

CRUD table:
- Columns: Nombre | Precio base | Días estimados | Activo | Acciones
- [Nuevo tipo] button
- Inline edit or dialog for price changes

## Responsive

Admin panel can be desktop-only (min 768px) but should be usable on tablet.
Mobile admin access: read-only views + critical actions only.
