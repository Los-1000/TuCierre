# Dashboard — Design Override
> Overrides MASTER.md for `/dashboard`

## Layout

```
Desktop:  Sidebar (240px) + Main grid
Mobile:   Stack all cards vertically, bottom nav
```

## Stats Row (Top)

4 metric cards in a 2×2 grid (mobile) / 4-column row (desktop):
- Trámites activos
- Completados este mes
- Monto total (S/.)
- Ahorro acumulado (S/.)

Each stat card:
```
bg-white rounded-xl p-4 border border-border shadow-sm
Icon (24px, colored) + Label (text-sm text-secondary) + Value (text-2xl font-bold) + Trend indicator
```

## Tier Progress Card

Full-width card below stats:
```
Tier badge (icon + name) | Progress bar (animated) | "X trámites para Plata"
```
- Progress bar: `bg-accent` fill, transition on mount (0 → value, 600ms ease-out)
- Tooltip on hover: exact count and requirement

## Trámites Recientes

Table/list of last 5 trámites:
- Columns: Código | Tipo | Partes | Precio | Estado | Fecha
- Mobile: Card list with key info
- Status badge with color from MASTER
- Row click: navigate to `/tramites/[id]`
- Empty state: illustration + "Aún no tienes trámites" + [Cotizar ahora]

## Quick Actions

3 action buttons (horizontal scroll on mobile if overflow):
- [+ Nueva cotización] — accent primary button
- [Ver todos los trámites] — secondary
- [Mensajes sin leer] — with badge count

## Notifications Panel

- Right column on desktop (1/3 width), below stats on mobile
- Max 5 recent notifications
- Each: dot indicator + message + time
- Unread: `bg-blue-50` background
- "Ver todas" link at bottom

## Skeleton Loading

On initial load, show skeleton for:
- 4 stat cards (shimmer rectangles)
- Tier progress bar (shimmer bar)
- 3 table rows (shimmer lines)
