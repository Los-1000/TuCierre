# TuCierre — Implementation Guide

## Phase 0: Project Setup

```bash
# 1. Create Next.js project
npx create-next-app@latest tucierre --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd tucierre

# 2. Install shadcn/ui
npx shadcn@latest init
# Choose: Default style, Slate base color, CSS variables: yes

# 3. Install key shadcn components
npx shadcn@latest add button card dialog alert-dialog form input label select
npx shadcn@latest add toast sonner tabs badge avatar progress skeleton
npx shadcn@latest add dropdown-menu sheet table tooltip popover calendar
npx shadcn@latest add separator command

# 4. Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install tailwindcss-animate
npm install clsx tailwind-merge  # already included with shadcn

# 5. Install Inter font (add to layout.tsx)
# Use next/font/google
```

## Phase 1: Supabase Setup

```bash
# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-side only
```

### File structure for Supabase

```
src/
  lib/
    supabase/
      client.ts       # Browser client (createBrowserClient)
      server.ts       # Server client (createServerClient)
      middleware.ts   # Auth session refresh
      types.ts        # Generated DB types
  types/
    database.ts       # Supabase generated types
```

### Run migrations in order:

```sql
-- 1. Create tables (from project brief)
-- 2. Enable RLS on all tables
-- 3. Create RLS policies
-- 4. Create indexes
-- 5. Create triggers (updated_at)
-- 6. Create functions (reference_code generator)
```

## Phase 2: App Structure

```
src/
  app/
    (public)/
      page.tsx                 # Landing /
      login/page.tsx
      register/page.tsx
    (auth)/
      layout.tsx               # Auth guard + layout with sidebar/bottom nav
      dashboard/page.tsx
      cotizar/page.tsx
      tramites/
        page.tsx               # List
        [id]/page.tsx          # Detail
      recompensas/page.tsx
      price-match/page.tsx
      perfil/page.tsx
    admin/
      layout.tsx               # Admin guard + admin layout
      page.tsx
      tramites/page.tsx
      brokers/page.tsx
      price-match/page.tsx
      tipos/page.tsx
  components/
    layout/
      Sidebar.tsx
      BottomNav.tsx
      TopBar.tsx
    ui/                        # shadcn components live here (auto-generated)
    tramites/
      StatusBadge.tsx
      TramiteTimeline.tsx
      TramiteCard.tsx
      DocumentUpload.tsx
    chat/
      ChatWindow.tsx
      MessageBubble.tsx
      ChatInput.tsx
    cotizador/
      StepIndicator.tsx
      TramiteTypeCard.tsx
      PriceBreakdown.tsx
      PriceMatchModal.tsx
    recompensas/
      TierCard.tsx
      TierProgress.tsx
      RewardHistory.tsx
    shared/
      EmptyState.tsx
      SkeletonCard.tsx
      PriceDisplay.tsx
      ReferralCode.tsx
  hooks/
    useSupabase.ts
    useTramites.ts
    useRealtime.ts
    useAuth.ts
    useBrokerProfile.ts
  lib/
    utils.ts                   # cn(), formatPrice(), formatDate()
    validations.ts             # Zod schemas
    constants.ts               # Status labels, tier config
```

## Phase 3: Critical Utilities

### formatPrice (must use everywhere)
```tsx
// src/lib/utils.ts
export const formatPrice = (amount: number): string =>
  `S/. ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
```

### Status config
```tsx
// src/lib/constants.ts
export const TRAMITE_STATUS_CONFIG = {
  cotizado: { label: 'Cotizado', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  solicitado: { label: 'Solicitado', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  documentos_pendientes: { label: 'Docs. Pendientes', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' },
  en_revision: { label: 'En Revisión', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' },
  en_firma: { label: 'En Firma', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
  en_registro: { label: 'En Registro', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  completado: { label: 'Completado', bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300' },
  cancelado: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
} as const;

export const TIER_CONFIG = {
  bronce: { label: 'Bronce', minTramites: 0, maxTramites: 3, discount: 0, color: 'text-orange-700', bg: 'bg-orange-50' },
  plata:  { label: 'Plata',  minTramites: 4, maxTramites: 7, discount: 5, color: 'text-gray-600',   bg: 'bg-gray-100'  },
  oro:    { label: 'Oro',    minTramites: 8, maxTramites: Infinity, discount: 10, color: 'text-yellow-600', bg: 'bg-yellow-50' },
} as const;

export const STATUS_ORDER = [
  'cotizado', 'solicitado', 'documentos_pendientes',
  'en_revision', 'en_firma', 'en_registro', 'completado'
] as const;
```

## Phase 4: Realtime Setup

```tsx
// src/hooks/useRealtime.ts
import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function useTramiteRealtime(tramiteId: string, onStatusChange: (status: string) => void) {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`tramite-${tramiteId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tramites',
        filter: `id=eq.${tramiteId}`,
      }, (payload) => {
        onStatusChange(payload.new.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tramiteId, onStatusChange]);
}
```

## Phase 5: Key Component Patterns

### Skeleton Screen
```tsx
// Shimmer skeleton — use for all async data
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-border shadow-card">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
    </div>
  );
}
```

### Status Badge
```tsx
export function StatusBadge({ status }: { status: keyof typeof TRAMITE_STATUS_CONFIG }) {
  const config = TRAMITE_STATUS_CONFIG[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border",
      config.bg, config.text, config.border
    )}>
      {config.label}
    </span>
  );
}
```

### Reference Code
```tsx
export function ReferenceCode({ code }: { code: string }) {
  return (
    <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
      {code}
    </code>
  );
}
```

## Performance Checklist

- [ ] Next.js Image component for all images (WebP, lazy by default)
- [ ] `font-display: swap` on Inter (via next/font/google — automatic)
- [ ] Skeleton screens on all data-fetched components
- [ ] `loading.tsx` files for route segments
- [ ] Suspense boundaries around async Server Components
- [ ] Virtualize tramites list if >50 items (use `react-virtual`)
- [ ] `tabular-nums` class on all price/number displays

## Accessibility Checklist

- [ ] All icon-only buttons have `aria-label`
- [ ] Status badges have text content (not color only)
- [ ] File upload inputs have descriptive labels
- [ ] Chat: `aria-live="polite"` on messages container
- [ ] Status updates: `aria-live` region for realtime changes
- [ ] Form validation: `aria-describedby` links field to error message
- [ ] Timeline: `role="list"` + `role="listitem"` for screen readers
- [ ] Modals: focus trap + ESC to close
- [ ] All forms: correct `autocomplete` attributes

## Mobile-First Checklist

- [ ] Bottom nav safe area: `pb-[env(safe-area-inset-bottom)]`
- [ ] Wizard actions: sticky bottom bar with safe area
- [ ] File upload: `capture="environment"` for camera on mobile
- [ ] No horizontal scroll on any breakpoint
- [ ] Minimum 44×44px for all touch targets
- [ ] `touch-action: manipulation` on clickable elements (no 300ms delay)
- [ ] Pull-to-refresh on tramites list
- [ ] Font size minimum 16px (prevents iOS zoom)
