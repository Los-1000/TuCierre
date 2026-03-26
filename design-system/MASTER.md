# TuCierre — Design System MASTER

> Source of truth for all UI/UX decisions. Page-specific files in `/pages/` override sections here.

---

## 1. Product Profile

| Attribute | Value |
|-----------|-------|
| **Product type** | B2B Professional SaaS — notarial services portal |
| **Industry** | Legal / Real Estate / Fintech-adjacent |
| **Target user** | Real estate broker in Peru, 25–50 years old, mobile-first |
| **Usage context** | On-the-go (field visits, client meetings), 80% mobile |
| **Style benchmark** | Wise / Revolut applied to notarial services |
| **Tone** | Professional, trustworthy, efficient — not corporate-boring |
| **Anti-patterns** | Colorful marketplace aesthetics, emoji icons, excessive decoration |

---

## 2. Color System

### Brand Palette

```
Primary:    #1a365d  — Navy blue (trust, authority, legal weight)
Secondary:  #2d3748  — Charcoal (text, secondary UI)
Accent:     #38a169  — Emerald green (CTAs, success, savings)
Warning:    #d69e2e  — Amber (document pending, review states)
Error:      #e53e3e  — Red (errors, rejection, cancellation)
Background: #f7fafc  — Off-white (main page bg)
Surface:    #ffffff  — White (cards, modals, inputs)
```

### Semantic Tokens (use these in components — never raw hex)

```css
/* Tailwind config tokens */
--color-primary:        #1a365d;
--color-primary-light:  #2a4a7f;   /* hover states */
--color-primary-dark:   #122540;   /* active/pressed */
--color-secondary:      #2d3748;
--color-accent:         #38a169;
--color-accent-light:   #48bb78;   /* hover */
--color-accent-dark:    #276749;   /* active */
--color-warning:        #d69e2e;
--color-warning-light:  #f6e05e;
--color-error:          #e53e3e;
--color-error-light:    #fed7d7;
--color-bg:             #f7fafc;
--color-surface:        #ffffff;
--color-border:         #e2e8f0;
--color-text-primary:   #1a202c;
--color-text-secondary: #718096;
--color-text-muted:     #a0aec0;
--color-text-inverse:   #ffffff;
```

### Status Badge Colors (trámite states)

| Estado | Background | Text | Border |
|--------|-----------|------|--------|
| cotizado | #ebf8ff | #2b6cb0 | #bee3f8 |
| solicitado | #e9d8fd | #553c9a | #d6bcfa |
| documentos_pendientes | #fefcbf | #744210 | #f6e05e |
| en_revision | #feebc8 | #7b341e | #fbd38d |
| en_firma | #bee3f8 | #2c5282 | #90cdf4 |
| en_registro | #c6f6d5 | #276749 | #9ae6b4 |
| completado | #f0fff4 | #22543d | #9ae6b4 |
| cancelado | #fed7d7 | #742a2a | #feb2b2 |

### Tier Colors

| Tier | Color | Hex |
|------|-------|-----|
| Bronce | Warm brown | #c05621 |
| Plata | Silver gray | #718096 |
| Oro | Gold | #d69e2e |

---

## 3. Typography

### Font Family

```
Primary: Inter (all UI text)
Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
Source: Google Fonts — preload critical weights (400, 600)
```

### Type Scale (Tailwind classes)

| Role | Size | Weight | Line-height | Usage |
|------|------|--------|-------------|-------|
| Display | text-4xl (36px) | font-bold (700) | leading-tight | Hero headings |
| H1 | text-3xl (30px) | font-bold (700) | leading-tight | Page titles |
| H2 | text-2xl (24px) | font-semibold (600) | leading-snug | Section titles |
| H3 | text-xl (20px) | font-semibold (600) | leading-snug | Card titles |
| H4 | text-lg (18px) | font-medium (500) | leading-normal | Subsections |
| Body | text-base (16px) | font-normal (400) | leading-relaxed | Main body text |
| Body SM | text-sm (14px) | font-normal (400) | leading-relaxed | Secondary text |
| Caption | text-xs (12px) | font-medium (500) | leading-normal | Labels, timestamps |
| Code | font-mono text-sm | font-normal (400) | leading-normal | Reference codes (TC-2024-...) |

### Rules
- Minimum 16px for body on mobile (avoids iOS auto-zoom)
- Reference codes (TC-2024-00001) always use `font-mono`
- Prices always use tabular numbers: `font-variant-numeric: tabular-nums`

---

## 4. Spacing System

Use Tailwind's 4px base unit. All spacing should be multiples of 4px.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px (p-1) | Icon padding, tight labels |
| sm | 8px (p-2) | Input internal padding, chip padding |
| md | 16px (p-4) | Card padding, section gaps |
| lg | 24px (p-6) | Major section padding |
| xl | 32px (p-8) | Page section margins |
| 2xl | 48px (p-12) | Hero padding, major gaps |
| 3xl | 64px (p-16) | Landing section separation |

---

## 5. Layout & Grid

### Breakpoints

```
Mobile:  375px  (default)
Tablet:  768px  (md:)
Desktop: 1024px (lg:)
Wide:    1280px (xl:)
```

### Container Widths

```
Mobile:  full width, px-4
Tablet:  full width, px-6
Desktop: max-w-7xl, mx-auto, px-8
```

### App Layout

**Desktop (≥1024px):**
- Fixed left sidebar: 240px wide
- Main content area: fluid, min-h-screen
- Sidebar items: icon + label
- Active state: bg-primary/10 + left border accent

**Mobile/Tablet (<1024px):**
- Hidden sidebar
- Sticky bottom navigation (5 items max)
- Top bar with logo + notification bell + avatar

### Z-index Scale

```
0    — base content
10   — sticky headers, table headers
20   — dropdowns, popovers
40   — modals, sheets
100  — toast notifications
1000 — loading overlays
```

---

## 6. Component Patterns

### Buttons

```
Primary CTA:   bg-accent hover:bg-accent-dark text-white rounded-lg px-6 py-3 font-semibold
Secondary:     border border-primary text-primary hover:bg-primary/5 rounded-lg px-6 py-3
Ghost:         text-primary hover:bg-primary/5 rounded-lg px-4 py-2
Danger:        bg-error hover:bg-error/90 text-white rounded-lg px-6 py-3
Icon button:   w-10 h-10 (44px touch target) rounded-lg
Loading state: disabled + spinner icon, reduced opacity 0.7
```

**Rule**: One primary CTA per screen. Secondary actions visually subordinate.

### Cards

```
bg-white rounded-xl shadow-sm border border-border
hover: shadow-md transition-shadow duration-200
padding: p-4 (mobile) / p-6 (desktop)
```

### Inputs

```
Height: min-h-[44px] (touch target)
Border: border border-border rounded-lg
Focus:  ring-2 ring-primary/30 border-primary
Error:  border-error bg-error/5
Label:  text-sm font-medium text-text-secondary mb-1
```

Always show visible label above input — never placeholder-only.

### Status Badges

```
rounded-full px-3 py-1 text-xs font-medium
(colors from Status Badge Colors table above)
```

### Timeline (trámite tracking)

```
Vertical list, left-aligned dot indicator
Completed: filled circle (accent green) + solid line
Current: pulse animation on dot + highlighted card
Pending: empty circle (border only) + dashed line
```

---

## 7. Navigation

### Desktop Sidebar

```
Items: Inicio (Dashboard), Cotizar, Mis Trámites, Recompensas, Price Matching
Bottom items: Configuración, Cerrar sesión
```

### Mobile Bottom Nav

```
Max 5 items: Inicio, Trámites, Cotizar (+FAB), Mensajes, Perfil
Active: accent color + label
Badge: red dot for unread notifications
```

### Breadcrumbs

Show on detail pages: `Mis Trámites / TC-2024-00001`

---

## 8. Motion & Animation

- **Duration**: micro-interactions 150–200ms, transitions 200–300ms
- **Easing**: ease-out for enter, ease-in for exit
- **Spring physics**: use for modals, sheets, drawer
- **Status changes**: fade + subtle scale (0.98→1.0)
- **Timeline dots**: CSS pulse animation on current state
- **Page transitions**: fade (150ms) — no heavy slide transitions
- **Skeleton screens**: shimmer animation for all async content
- **Respect** `prefers-reduced-motion`: disable animations when set

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Icons

- **Library**: Lucide React (`lucide-react`) — consistent stroke width 1.5px
- **Size scale**: 16px (caption), 20px (body), 24px (nav/actions), 32px (feature)
- **No emoji as icons** — ever
- **Nav icons** must always have text label alongside

---

## 10. Feedback & States

### Loading
- Skeleton screens for all data fetches >300ms
- Skeleton: `bg-gray-200 animate-pulse rounded`
- Button loading: disable + spinner inside button

### Empty States
Every list/table needs a designed empty state:
```
Icon (64px, muted color) + H3 title + body explanation + primary CTA
Example: "Aún no tienes trámites" + "Empieza cotizando tu primer trámite" + [Cotizar ahora]
```

### Toast Notifications
- Position: top-right (desktop), top-center (mobile)
- Auto-dismiss: 4 seconds
- Types: success (green), error (red), warning (amber), info (blue)
- Use shadcn/ui `Sonner` or `Toast`

### Confirmations
All destructive actions (cancel tramite, delete) require a confirmation dialog:
```
Title: "¿Cancelar este trámite?"
Body: Brief explanation of consequences
Actions: [Cancelar trámite] (danger) + [Volver] (ghost)
```

---

## 11. Forms

- Inline validation: validate on blur, not on keystroke
- Error message: below the field, text-error text-sm
- Required fields: asterisk (*) in label
- Multi-step forms: show step indicator (Step 1 of 3)
- Allow back navigation in wizards
- Progress preserved if navigating away (auto-save draft)
- Mobile keyboards: use correct input types (`tel`, `email`, `number`)
- Password fields: always include show/hide toggle

---

## 12. Accessibility

- Color contrast: ≥4.5:1 for body text, ≥3:1 for large text
- All interactive elements: visible focus ring (2px, primary color)
- Touch targets: min 44×44px
- All icon-only buttons: `aria-label`
- Form fields: `<label>` with `for` attribute
- Status badges: don't rely on color alone — include text
- Keyboard navigation: full support through all flows
- Screen reader: `aria-live` for async updates (chat messages, status changes)

---

## 13. Mobile-Specific Rules

- Bottom safe area: `pb-[env(safe-area-inset-bottom)]` on bottom nav
- Sticky headers: account for status bar height
- Font size minimum: 16px (prevents iOS zoom on focus)
- Tap targets: never smaller than 44×44px
- Horizontal scroll: forbidden on any screen
- Pull-to-refresh: implement on tramites list
- Swipe to dismiss: modals/sheets on mobile
- File upload: support camera capture on mobile (`accept="image/*" capture="environment"`)

---

## 14. Data Display

### Prices

```tsx
// Always: tabular numbers, soles prefix, 2 decimal places
const formatPrice = (amount: number) =>
  `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
```

### Dates

```
Relative for recent (<7 days): "hace 2 horas", "ayer"
Full for older: "15 ene 2024"
Estimated completion: "Aprox. 5 días hábiles"
```

### Reference Codes

```tsx
<code className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">TC-2024-00001</code>
```

---

## 15. shadcn/ui Component Mapping

| Need | shadcn Component |
|------|-----------------|
| Dialogs / modals | `Dialog` |
| Confirmations | `AlertDialog` |
| Toasts | `Sonner` |
| Dropdowns | `DropdownMenu` |
| Select inputs | `Select` |
| Date picker | `Calendar` + `Popover` |
| File upload | Custom + shadcn `Button` |
| Data tables | `Table` + custom pagination |
| Tabs (detail page) | `Tabs` |
| Progress bars | `Progress` |
| Skeleton | `Skeleton` |
| Tooltips | `Tooltip` |
| Command palette | `Command` |
| Sheet / drawer | `Sheet` |
| Form validation | `Form` (react-hook-form + zod) |
| Avatar | `Avatar` |
| Badge | `Badge` (custom variants for statuses) |

---

## 16. Anti-Patterns (Never Do)

- Using emoji as icons in any UI element
- Placeholder text as the only label for an input
- Hardcoded hex colors in component files (use tokens)
- Animations that block user input
- Touch targets smaller than 44×44px
- Horizontal scroll on any mobile view
- Showing only color to convey status (always pair with text/icon)
- `disable-zoom` in viewport meta
- Loading without feedback >300ms
- Destructive action without confirmation dialog
- Chat without loading state on initial fetch
- File upload without progress indicator
