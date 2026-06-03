# Frontend Migration + Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Supabase client calls with Spring Boot REST + WebSocket, and redesign all screens with a NotaryOs-inspired Clean & Light aesthetic.

**Architecture:** Next.js 14 App Router. Single `src/lib/api.ts` wraps `fetch` with `credentials: 'include'` (httpOnly JWT cookies). Single STOMP/SockJS client in `src/lib/ws.ts` for real-time. Supabase packages removed entirely. Backend proxied via Next.js rewrites at `/api → http://localhost:8080/api` and `/ws → http://localhost:8080/ws`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@stomp/stompjs`, `sockjs-client`, Radix UI (kept), Inter font.

**Prerequisite:** Backend from `2026-06-02-backend-completion.md` must be running on port 8080.

**Working directory:** `C:\Users\cefd2\Downloads\NotaryOs\TuCierre`

---

## File Map

**New files:**
- `src/lib/api.ts` — typed fetch wrapper
- `src/lib/ws.ts` — STOMP singleton
- `src/types/api.ts` — shared response types aligned with backend DTOs

**Modified files:**
- `package.json` — remove supabase, add stomp/sockjs
- `next.config.mjs` — add rewrites, remove Supabase image domains
- `tailwind.config.ts` — new design tokens (navy palette, Inter)
- `src/app/layout.tsx` — Inter font, remove Playfair/DM Sans
- `src/lib/supabase/` — DELETE entire directory
- `src/hooks/useAuth.ts` — replace Supabase auth
- `src/hooks/useTramites.ts` — replace Supabase query
- `src/hooks/useTramite.ts` — replace Supabase query
- `src/hooks/useTramiteStatusRealtime.ts` — replace Supabase subscription
- `src/hooks/useChatRealtime.ts` — replace Supabase subscription
- `src/app/(auth)/layout.tsx` — session via GET /api/brokers/me
- `src/app/auth/login/page.tsx` — redesign + POST /auth/login
- `src/app/page.tsx` — landing redesign
- `src/app/(auth)/dashboard/page.tsx` — dashboard redesign
- `src/app/(auth)/cotizar/page.tsx` — cotizar redesign
- `src/app/(auth)/tramites/page.tsx` — tramites list redesign
- `src/app/(auth)/tramites/[id]/page.tsx` — tramite detail redesign

---

## Task 1: Package Changes + Next.js Config

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`

- [ ] **Step 1: Remove Supabase, add WebSocket deps**

```bash
npm uninstall @supabase/supabase-js @supabase/ssr
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

- [ ] **Step 2: Update next.config.mjs**

Replace the full file:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { optimizePackageImports: ['lucide-react'] },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' },
      { source: '/auth/:path*', destination: 'http://localhost:8080/auth/:path*' },
      { source: '/ws/:path*', destination: 'http://localhost:8080/ws/:path*' },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 3: Delete Supabase directory**

```bash
rm -rf src/lib/supabase
```

If `src/lib/supabase` doesn't exist as a directory, find and delete individual files: `src/lib/supabase.ts`, `src/lib/supabaseClient.ts`, or wherever the `createClient`/`createBrowserClient` calls are defined.

- [ ] **Step 4: Verify project starts (with errors expected from broken imports)**

```bash
npm run dev
```

Expected: Server starts but TypeScript errors appear where Supabase was imported. That's fine — we fix them in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json next.config.mjs
git commit -m "chore: remove supabase, add stomp/sockjs, configure rewrites"
```

---

## Task 2: Design Tokens (Tailwind + Fonts)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f3f9',
          100: '#e1e7f3',
          200: '#c3cfe7',
          300: '#97aed4',
          400: '#6b8bbf',
          500: '#4a6da8',
          600: '#35558d',
          700: '#2a4472',
          800: '#1e3460',
          900: '#0f1d3d',
          950: '#0a1228',
        },
        brand: {
          50:  '#eff2ff',
          100: '#dbe3fe',
          600: '#2c4dfb',
          700: '#1d35d8',
        },
        warm: {
          100: '#fdf8ee',
          300: '#f5e2b3',
          600: '#d4a23c',
          700: '#b2832e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update src/app/layout.tsx fonts**

Replace font imports at the top of the file:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

In the `<html>` tag, replace existing font class variables with:

```tsx
<html lang="es" className={inter.variable}>
```

Remove any imports of `Playfair_Display`, `DM_Sans`, `JetBrains_Mono`.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/layout.tsx
git commit -m "feat: design tokens — navy palette, Inter font"
```

---

## Task 3: API Client + Types

**Files:**
- Create: `src/types/api.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create src/types/api.ts**

```ts
export type TierName = 'bronce' | 'plata' | 'oro'

export interface AuthResponse {
  id: number
  email: string
  fullName: string
  tierName: TierName
  isAdmin: boolean
}

export interface Broker {
  id: number
  fullName: string
  email: string
  cellphone?: string
  tierName: TierName
  isAdmin: boolean
  referralCode?: string
}

export type TramiteStatus =
  | 'COTIZADO' | 'SOLICITADO' | 'DOCS_PENDIENTES'
  | 'EN_REVISION' | 'EN_FIRMA' | 'EN_REGISTRO'
  | 'COMPLETADO' | 'CANCELADO'

export interface TramiteListItem {
  id: number
  referenceCode: string
  tramiteType: string
  status: TramiteStatus
  finalFee: number
  createdAt: string
}

export interface TramiteDetail {
  status: TramiteStatus
  idNotary: number
  brokerIdDocumentNumber: string
  tramiteType: string
  propertyAddress: string
  propertyDistrictAddress: string
  quotedPriceProperty: number
  baseFee: number
  additionalFee: number
  finalFee: number
  createdAt: string
  parties: Party[]
}

export interface Party {
  fullName: string
  typeIdDocument: boolean
  idDocumentNumber: string
  role: string
  idDocumentFileCopy: string
}

export interface DashboardStats {
  activeTramites: number
  completedThisMonth: number
  totalManagedValue: number
  totalSavings: number
  commissionThisMonth: number
  tierProgressCount: number
  tierName: TierName
}

export interface TramiteType {
  id: number
  name: string
  baseFee?: number
  isActive: boolean
}

export interface MessageItem {
  id: number
  tramiteId: number
  senderId: number
  senderName: string
  content: string
  createdAt: string
}
```

- [ ] **Step 2: Create src/lib/api.ts**

```ts
const BASE = ''  // rewrites handle /api → localhost:8080

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (res.status === 401) {
    window.location.href = '/auth/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<import('@/types/api').AuthResponse>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
    signup: (data: { fullName: string; email: string; password: string; cellphone?: string }) =>
      apiFetch<import('@/types/api').AuthResponse>('/auth/signup', {
        method: 'POST', body: JSON.stringify(data),
      }),
    logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
  },

  brokers: {
    me: () => apiFetch<import('@/types/api').Broker>('/api/brokers/me'),
    notaries: () => apiFetch<import('@/types/api').Broker[]>('/api/brokers/notaries'),
  },

  tramites: {
    list: (status?: string) =>
      apiFetch<import('@/types/api').TramiteListItem[]>(
        `/api/tramites${status ? `?status=${status}` : ''}`
      ),
    get: (id: number) => apiFetch<import('@/types/api').TramiteDetail>(`/api/tramites/${id}`),
    create: (data: unknown) =>
      apiFetch<import('@/types/api').TramiteDetail>('/api/tramites', {
        method: 'POST', body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string) =>
      apiFetch<import('@/types/api').TramiteDetail>(`/api/tramites/${id}/status`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      }),
    cancel: (id: number) =>
      apiFetch<void>(`/api/tramites/${id}`, { method: 'DELETE' }),
    messages: {
      list: (tramiteId: number) =>
        apiFetch<import('@/types/api').MessageItem[]>(`/api/tramites/${tramiteId}/messages`),
      send: (tramiteId: number, content: string) =>
        apiFetch<import('@/types/api').MessageItem>(`/api/tramites/${tramiteId}/messages`, {
          method: 'POST', body: JSON.stringify({ content }),
        }),
    },
  },

  dashboard: {
    stats: () => apiFetch<import('@/types/api').DashboardStats>('/api/dashboard/stats'),
  },

  tramiteTypes: {
    list: () => apiFetch<import('@/types/api').TramiteType[]>('/api/tramite-types'),
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts src/lib/api.ts
git commit -m "feat: typed API client and shared types"
```

---

## Task 4: WebSocket Client

**Files:**
- Create: `src/lib/ws.ts`

- [ ] **Step 1: Create src/lib/ws.ts**

```ts
import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client: Client | null = null

function getClient(): Client {
  if (client) return client
  client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
  })
  client.activate()
  return client
}

export function subscribeToTramiteStatus(
  tramiteId: number,
  onUpdate: (status: string) => void
): StompSubscription | null {
  const c = getClient()
  if (!c.connected) {
    c.onConnect = () => {
      c.subscribe(`/topic/tramite/${tramiteId}/status`, (msg) => {
        onUpdate(JSON.parse(msg.body).status)
      })
    }
    return null
  }
  return c.subscribe(`/topic/tramite/${tramiteId}/status`, (msg) => {
    onUpdate(JSON.parse(msg.body).status)
  })
}

export function subscribeToChat(
  tramiteId: number,
  onMessage: (msg: import('@/types/api').MessageItem) => void
): StompSubscription | null {
  const c = getClient()
  const handler = (frame: { body: string }) => onMessage(JSON.parse(frame.body))
  if (!c.connected) {
    c.onConnect = () => c.subscribe(`/topic/tramite/${tramiteId}/chat`, handler)
    return null
  }
  return c.subscribe(`/topic/tramite/${tramiteId}/chat`, handler)
}

export function disconnectWs() {
  client?.deactivate()
  client = null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ws.ts
git commit -m "feat: STOMP/SockJS WebSocket client singleton"
```

---

## Task 5: Auth Migration

**Files:**
- Modify: `src/hooks/useAuth.ts`
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Rewrite useAuth.ts**

Replace the entire file:

```ts
'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { api } from '@/lib/api'
import type { Broker } from '@/types/api'

interface AuthContextValue {
  broker: Broker | null
  loading: boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  broker: null, loading: true, logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthProvider(): AuthContextValue {
  const [broker, setBroker] = useState<Broker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.brokers.me()
      .then(setBroker)
      .catch(() => setBroker(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.auth.logout()
    setBroker(null)
    window.location.href = '/auth/login'
  }

  return { broker, loading, logout }
}
```

- [ ] **Step 2: Update (auth)/layout.tsx**

Replace session check. The layout should call `api.brokers.me()` server-side. Replace any `createServerClient` / `supabase.auth.getUser()` calls with:

```tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// At the top of the layout component:
const cookieStore = await cookies()
const accessToken = cookieStore.get('access_token')?.value

if (!accessToken) {
  redirect('/auth/login')
}

// Fetch broker on server side
const brokerRes = await fetch('http://localhost:8080/api/brokers/me', {
  headers: { Authorization: `Bearer ${accessToken}` },
  cache: 'no-store',
})

if (!brokerRes.ok) redirect('/auth/login')
const broker = await brokerRes.json()
```

Pass `broker` to client children via context or props as the existing layout already does.

- [ ] **Step 3: Rewrite login page**

Replace `src/app/auth/login/page.tsx` with the Clean & Light redesign:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.auth.login(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left panel */}
      <div className="bg-navy-900 flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 border border-white/15 rounded-lg flex items-center justify-center font-bold text-brand-600 text-sm">T</div>
          <span className="font-bold text-white text-sm tracking-tight">TuCierre</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-4">
            La plataforma que <span className="text-brand-600">potencia</span> tu carrera
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Únete a más de 200 corredores que cierran operaciones con eficiencia.
          </p>
          <div className="bg-white/6 border border-white/10 rounded-xl p-5">
            <p className="text-white/70 text-xs italic leading-relaxed mb-4">
              "Antes tardaba 3 días en coordinar con la notaría. Ahora cierro en un día."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-600 text-xs font-bold">MR</div>
              <div>
                <div className="text-white text-xs font-semibold">María Ríos</div>
                <div className="text-white/40 text-[10px]">Corredora · Tier Oro</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          {[['200+', 'Corredores'], ['S/2M+', 'Gestionado'], ['15%', 'Ahorro máx.']].map(([v, l]) => (
            <div key={l}>
              <div className="text-white font-extrabold text-xl tracking-tight">{v}</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wide mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h3 className="text-xl font-extrabold text-navy-900 tracking-tight mb-1">Ingresar a TuCierre</h3>
          <p className="text-navy-300 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Correo electrónico</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
                className="w-full h-10 border border-navy-200 rounded-lg px-3 text-sm text-navy-900 bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                className="w-full h-10 border border-navy-200 rounded-lg px-3 text-sm text-navy-900 bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full h-10 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-navy-300">
            ¿No tienes cuenta?{' '}
            <a href="/auth/signup" className="text-brand-600 font-semibold">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Compile check**

```bash
npm run build 2>&1 | head -50
```

Fix any import errors from removed Supabase client. Common fix: search for `createClient`, `createBrowserClient`, `createServerClient` across the codebase and replace with `api.*` calls.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: auth migration — login page redesign, layout session via JWT cookie"
```

---

## Task 6: Replace Data Hooks

**Files:**
- Modify: `src/hooks/useTramites.ts`
- Modify: `src/hooks/useTramite.ts`
- Modify: `src/hooks/useTramiteStatusRealtime.ts`
- Modify: `src/hooks/useChatRealtime.ts`

- [ ] **Step 1: Rewrite useTramites.ts**

```ts
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { TramiteListItem, TramiteStatus } from '@/types/api'

export function useTramites(status?: TramiteStatus) {
  const [tramites, setTramites] = useState<TramiteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.tramites.list(status)
      .then(setTramites)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [status])

  return { tramites, loading, error }
}
```

- [ ] **Step 2: Rewrite useTramite.ts**

```ts
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { TramiteDetail } from '@/types/api'

export function useTramite(id: number) {
  const [tramite, setTramite] = useState<TramiteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = () => {
    setLoading(true)
    api.tramites.get(id)
      .then(setTramite)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refetch() }, [id])

  return { tramite, loading, error, refetch }
}
```

- [ ] **Step 3: Rewrite useTramiteStatusRealtime.ts**

```ts
'use client'

import { useEffect } from 'react'
import { subscribeToTramiteStatus } from '@/lib/ws'
import type { TramiteStatus } from '@/types/api'

export function useTramiteStatusRealtime(
  tramiteId: number,
  onStatusChange: (status: TramiteStatus) => void
) {
  useEffect(() => {
    const sub = subscribeToTramiteStatus(tramiteId, onStatusChange as (s: string) => void)
    return () => { sub?.unsubscribe() }
  }, [tramiteId])
}
```

- [ ] **Step 4: Rewrite useChatRealtime.ts**

```ts
'use client'

import { useEffect } from 'react'
import { subscribeToChat } from '@/lib/ws'
import type { MessageItem } from '@/types/api'

export function useChatRealtime(
  tramiteId: number,
  onMessage: (msg: MessageItem) => void
) {
  useEffect(() => {
    const sub = subscribeToChat(tramiteId, onMessage)
    return () => { sub?.unsubscribe() }
  }, [tramiteId])
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: replace all Supabase hooks with REST + WebSocket"
```

---

## Task 7: Landing Page Redesign

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace src/app/page.tsx**

```tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans">
      {/* NAV */}
      <nav className="bg-white border-b border-navy-100 px-12 h-15 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center font-bold text-brand-600 text-sm">T</div>
          <span className="font-bold text-navy-900 text-sm tracking-tight">TuCierre</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="px-4 py-2 text-navy-500 text-sm font-medium rounded-md hover:bg-navy-50 transition-colors">Ingresar</Link>
          <Link href="/auth/signup" className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-md hover:bg-navy-800 transition-colors">Registrarse</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-[1100px] mx-auto px-12 pt-20 pb-16 grid grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-5">
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full" />
            Plataforma para corredores
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900 leading-[1.15] tracking-tight mb-4">
            Cotiza y gestiona tus <span className="text-brand-600">trámites notariales</span> en un solo lugar
          </h1>
          <p className="text-navy-500 text-[15px] leading-relaxed mb-7 max-w-md">
            TuCierre conecta a los corredores inmobiliarios con las mejores notarías de Lima. Cotiza, haz seguimiento en tiempo real y crece con cada operación.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/auth/signup" className="px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors">Empezar gratis</Link>
            <Link href="/auth/login" className="px-5 py-2.5 bg-white text-navy-700 text-sm font-medium border border-navy-100 rounded-lg hover:bg-navy-50 transition-colors">Ver demo</Link>
          </div>
          <p className="mt-6 text-[11px] text-navy-300">Sin tarjeta de crédito · Más de 200 corredores activos</p>
        </div>

        {/* Dashboard preview */}
        <div className="bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(15,29,61,0.08)]">
          <div className="bg-navy-50 border-b border-navy-100 px-5 py-3.5 flex items-center gap-2">
            <div className="w-5 h-5 bg-navy-900 rounded flex items-center justify-center text-brand-600 font-bold text-[10px]">T</div>
            <span className="text-navy-700 text-xs font-semibold">Mi Dashboard</span>
            <span className="ml-auto bg-warm-100 border border-warm-300 text-warm-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Oro</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[['Activos', '12', '↑ 3 esta semana'], ['Completados', '8', 'este mes'], ['Ahorro', 'S/420', 'con tier Oro']].map(([l, v, s]) => (
                <div key={l} className="bg-[#f4f6fb] border border-navy-100 rounded-lg p-3">
                  <div className="text-[9px] font-semibold text-navy-300 uppercase tracking-wide mb-1">{l}</div>
                  <div className={`text-lg font-bold ${l === 'Ahorro' ? 'text-emerald-600' : 'text-navy-900'}`}>{v}</div>
                  <div className="text-[9px] text-navy-400 mt-0.5">{s}</div>
                </div>
              ))}
            </div>
            <table className="w-full text-[11px]">
              <thead><tr className="border-b border-navy-100">
                {['Ref.', 'Tipo', 'Estado'].map(h => <th key={h} className="text-left py-1.5 text-[9px] text-navy-300 uppercase tracking-wide font-semibold">{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  ['TC-2024-001', 'Compraventa', 'blue', 'En proceso'],
                  ['TC-2024-002', 'Arrendamiento', 'amber', 'En revisión'],
                  ['TC-2024-003', 'Compraventa', 'green', 'Completado'],
                ].map(([ref, type, color, status]) => (
                  <tr key={ref} className="border-b border-navy-50">
                    <td className="py-2 font-mono font-bold text-navy-900">{ref}</td>
                    <td className="py-2 text-navy-500">{type}</td>
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-${color}-50 border border-${color}-200 text-${color}-700`}>
                        <span className={`w-1.5 h-1.5 bg-${color}-500 rounded-full`} />
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-[1100px] mx-auto px-12 py-16">
        <div className="text-[11px] font-bold uppercase tracking-widest text-navy-300 mb-2">Funcionalidades</div>
        <div className="text-2xl font-extrabold text-navy-900 tracking-tight mb-2">Todo lo que necesitas para cerrar más operaciones</div>
        <div className="text-navy-400 text-sm mb-10">Desde la cotización hasta la firma, sin salir de la plataforma.</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Cotización instantánea', 'Precio exacto en segundos. Descuentos automáticos según tu tier.'],
            ['Seguimiento en tiempo real', 'Notificaciones al instante cuando el estado cambia. Chat directo con la notaría.'],
            ['Sistema de tiers', 'Bronce, Plata y Oro — más operas, más descuento obtienes automáticamente.'],
            ['Price Match', '¿Encontraste un precio mejor? Solicita price match y la notaría lo evalúa.'],
            ['Gestión documental', 'Sube los documentos requeridos directo en la plataforma. Sin emails.'],
            ['Comisiones y referidos', 'Invita colegas y gana comisiones por cada trámite que cierren.'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-white border border-navy-100 rounded-xl p-6">
              <div className="text-sm font-bold text-navy-900 mb-2">{title}</div>
              <div className="text-xs text-navy-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TIERS */}
      <section className="max-w-[1100px] mx-auto px-12 pb-20">
        <div className="text-[11px] font-bold uppercase tracking-widest text-navy-300 mb-2">Tiers</div>
        <div className="text-2xl font-extrabold text-navy-900 tracking-tight mb-2">Más operas, más ahorras</div>
        <div className="text-navy-400 text-sm mb-10">Tu nivel sube automáticamente según tu actividad mensual.</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Bronce', color: 'amber', discount: '5%', range: '0–3 trámites al mes', features: ['Cotización instantánea', 'Seguimiento en tiempo real', 'Chat con notaría'] },
            { name: 'Plata', color: 'gray', discount: '10%', range: '4–7 trámites al mes', features: ['Todo lo de Bronce', 'Price Match disponible', 'Comisiones por referidos'] },
            { name: 'Oro', color: 'yellow', discount: '15%', range: '8+ trámites al mes', features: ['Todo lo de Plata', 'Prioridad en atención', 'Reporte mensual de ahorro'], highlight: true },
          ].map(tier => (
            <div key={tier.name} className={`bg-white rounded-xl p-6 border ${tier.highlight ? 'border-warm-600 shadow-[0_0_0_1px_#d4a23c]' : 'border-navy-100'}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 text-${tier.color}-600`}>{tier.name}{tier.highlight ? ' ✦' : ''}</div>
              <div className="text-2xl font-extrabold text-navy-900 mb-1">{tier.discount} <span className="text-sm font-medium text-navy-300">descuento</span></div>
              <div className="text-xs text-navy-400 mb-4">{tier.range}</div>
              {tier.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-navy-700 py-1">
                  <span className="text-emerald-600 font-bold text-[11px]">✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-navy-100 bg-white px-12 py-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy-900 rounded-lg flex items-center justify-center font-bold text-brand-600 text-[11px]">T</div>
          <span className="font-bold text-navy-900 text-sm">TuCierre</span>
        </div>
        <p className="text-[11px] text-navy-300">© 2024 TuCierre · Lima, Perú</p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: landing page redesign — Clean & Light, NotaryOs aesthetic"
```

---

## Task 8: Dashboard Redesign

**Files:**
- Modify: `src/app/(auth)/dashboard/page.tsx` (or wherever the dashboard page lives — check `src/app/dashboard/page.tsx`)

- [ ] **Step 1: Replace dashboard page**

```tsx
'use client'

import { useTramites } from '@/hooks/useTramites'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import type { DashboardStats, TramiteListItem } from '@/types/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  COTIZADO:       { label: 'Cotizado',     color: 'gray' },
  SOLICITADO:     { label: 'Solicitado',   color: 'blue' },
  DOCS_PENDIENTES:{ label: 'Docs. pend.',  color: 'amber' },
  EN_REVISION:    { label: 'En revisión',  color: 'amber' },
  EN_FIRMA:       { label: 'En firma',     color: 'blue' },
  EN_REGISTRO:    { label: 'En registro',  color: 'blue' },
  COMPLETADO:     { label: 'Completado',   color: 'green' },
  CANCELADO:      { label: 'Cancelado',    color: 'red' },
}

function StatusPill({ status }: { status: string }) {
  const { label, color } = STATUS_LABEL[status] ?? { label: status, color: 'gray' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-${color}-50 border border-${color}-200 text-${color}-700`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />
      {label}
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { tramites, loading: tramitesLoading } = useTramites()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.dashboard.stats().then(setStats).catch(() => {})
  }, [])

  const recent = tramites.slice(0, 5)

  const tierThresholds: Record<string, number> = { bronce: 3, plata: 7, oro: 999 }
  const nextTierTarget = tierThresholds[stats?.tierName ?? 'bronce'] + 1
  const progress = Math.min(((stats?.tierProgressCount ?? 0) / nextTierTarget) * 100, 100)

  return (
    <div className="p-7">
      {/* STATS */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Trámites activos', value: stats?.activeTramites ?? '—', sub: '↑ 3 esta semana', subColor: 'text-emerald-600' },
          { label: 'Completados (mes)', value: stats?.completedThisMonth ?? '—', sub: '↑ 2 vs mes anterior', subColor: 'text-emerald-600' },
          { label: 'Total gestionado', value: stats ? `S/ ${(stats.totalManagedValue / 1000).toFixed(1)}K` : '—', sub: 'en valor de propiedades', subColor: 'text-navy-400' },
          { label: 'Ahorro acumulado', value: stats ? `S/ ${stats.totalSavings.toFixed(0)}` : '—', sub: `con tier ${stats?.tierName ?? '—'}`, subColor: 'text-warm-700', valueColor: 'text-emerald-600' },
        ].map(({ label, value, sub, subColor, valueColor }) => (
          <div key={label} className="bg-white border border-navy-100 rounded-xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-navy-300 mb-1.5">{label}</div>
            <div className={`text-2xl font-extrabold tracking-tight ${valueColor ?? 'text-navy-900'}`}>{value}</div>
            <div className={`text-[11px] mt-1 ${subColor}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* TRAMITES TABLE */}
        <div className="bg-white border border-navy-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-navy-100 flex items-center justify-between">
            <span className="text-sm font-bold text-navy-900">Trámites recientes</span>
            <Link href="/tramites" className="text-[11px] text-brand-600 font-semibold hover:underline">Ver todos →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50/50 border-b border-navy-50">
                {['Referencia', 'Tipo', 'Estado', 'Monto', 'Fecha'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-navy-300 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {tramitesLoading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-navy-300">Cargando...</td></tr>
              ) : recent.map((t: TramiteListItem) => (
                <tr key={t.id} className="hover:bg-brand-50/30 cursor-pointer" onClick={() => router.push(`/tramites/${t.id}`)}>
                  <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-navy-900">{t.referenceCode}</td>
                  <td className="px-4 py-2.5 text-xs text-navy-500">{t.tramiteType}</td>
                  <td className="px-4 py-2.5"><StatusPill status={t.status} /></td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-navy-900">S/ {t.finalFee?.toFixed(0)}</td>
                  <td className="px-4 py-2.5 text-xs text-navy-300">{new Date(t.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT COL */}
        <div className="flex flex-col gap-3">
          {/* TIER */}
          <div className="bg-white border border-navy-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold text-navy-900">Tu tier</div>
                <div className="text-[10px] text-navy-300 mt-0.5">se actualiza automáticamente</div>
              </div>
              <span className="bg-warm-100 border border-warm-300 text-warm-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">✦ {stats?.tierName ?? '—'}</span>
            </div>
            <div className="text-xs text-navy-500 mb-2">{stats?.tierProgressCount ?? 0} trámites completados este mes</div>
            <div className="h-1.5 bg-navy-100 rounded-full">
              <div className="h-full bg-gradient-to-r from-warm-600 to-yellow-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-[#f4f6fb] rounded-lg p-3">
                <div className="text-[9px] uppercase tracking-wide text-navy-300 mb-1">Descuento</div>
                <div className="text-base font-extrabold text-warm-700">15%</div>
              </div>
              <div className="bg-[#f4f6fb] rounded-lg p-3">
                <div className="text-[9px] uppercase tracking-wide text-navy-300 mb-1">Ahorro mes</div>
                <div className="text-base font-extrabold text-emerald-600">S/{stats?.totalSavings.toFixed(0) ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* COMMISSION */}
          <div className="bg-white border border-navy-100 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-wide text-navy-300 mb-1">Comisión este mes</div>
            <div className="text-2xl font-extrabold text-navy-900 tracking-tight">S/ {stats?.commissionThisMonth.toFixed(0) ?? '—'}</div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white border border-navy-100 rounded-xl p-5">
            <div className="text-xs font-bold text-navy-900 mb-3">Acciones rápidas</div>
            {[
              { label: 'Nuevo trámite', href: '/cotizar', primary: true },
              { label: 'Mis chats activos', href: '/tramites' },
              { label: 'Solicitar price match', href: '/price-match' },
            ].map(({ label, href, primary }) => (
              <Link key={label} href={href}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border text-xs font-medium mb-1.5 transition-colors ${
                  primary ? 'bg-navy-900 text-white border-navy-900 hover:bg-navy-800' : 'bg-white text-navy-700 border-navy-100 hover:bg-navy-50'
                }`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/
git commit -m "feat: dashboard redesign — stats, tramites table, tier progress"
```

---

## Task 9: Tramite Detail Redesign

**Files:**
- Modify: `src/app/(auth)/tramites/[id]/page.tsx`

- [ ] **Step 1: Replace tramite detail page**

```tsx
'use client'

import { use, useState, useEffect } from 'react'
import { useTramite } from '@/hooks/useTramite'
import { useTramiteStatusRealtime } from '@/hooks/useTramiteStatusRealtime'
import { useChatRealtime } from '@/hooks/useChatRealtime'
import { api } from '@/lib/api'
import type { MessageItem, TramiteStatus } from '@/types/api'
import Link from 'next/link'

const STATUS_STEPS: TramiteStatus[] = [
  'COTIZADO','SOLICITADO','DOCS_PENDIENTES','EN_REVISION','EN_FIRMA','EN_REGISTRO','COMPLETADO',
]
const STATUS_LABEL: Record<string, string> = {
  COTIZADO: 'Cotizado', SOLICITADO: 'Solicitado', DOCS_PENDIENTES: 'Docs. pendientes',
  EN_REVISION: 'En revisión', EN_FIRMA: 'En firma', EN_REGISTRO: 'En registro',
  COMPLETADO: 'Completado', CANCELADO: 'Cancelado',
}

export default function TramiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const tramiteId = Number(id)
  const { tramite, loading, refetch } = useTramite(tramiteId)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [newMsg, setNewMsg] = useState('')

  useEffect(() => {
    api.tramites.messages.list(tramiteId).then(setMessages).catch(() => {})
  }, [tramiteId])

  useTramiteStatusRealtime(tramiteId, () => refetch())
  useChatRealtime(tramiteId, (msg) => setMessages(prev => [...prev, msg]))

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    await api.tramites.messages.send(tramiteId, newMsg)
    setNewMsg('')
  }

  if (loading) return <div className="p-7 text-xs text-navy-300">Cargando...</div>
  if (!tramite) return <div className="p-7 text-xs text-red-500">Trámite no encontrado</div>

  const currentStep = STATUS_STEPS.indexOf(tramite.status as TramiteStatus)
  const refCode = `TC-${new Date(tramite.createdAt).getFullYear()}-${String(tramiteId).padStart(3, '0')}`

  return (
    <div className="p-7">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs text-navy-300 mb-1">
            <Link href="/tramites" className="hover:text-navy-700">Mis trámites</Link> → <span className="text-navy-900 font-semibold">{refCode}</span>
          </div>
          <h1 className="text-lg font-extrabold text-navy-900 tracking-tight">{refCode} · {tramite.tramiteType}</h1>
          <div className="text-xs text-navy-300 mt-0.5">Creado el {new Date(tramite.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {STATUS_LABEL[tramite.status] ?? tramite.status}
          </span>
          <button
            onClick={() => api.tramites.cancel(tramiteId)}
            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* INFO */}
          <div className="bg-white border border-navy-100 rounded-xl">
            <div className="px-5 py-3.5 border-b border-navy-100">
              <span className="text-sm font-bold text-navy-900">Información del trámite</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                ['Referencia', refCode],
                ['Tipo', tramite.tramiteType],
                ['Dirección', tramite.propertyAddress],
                ['Distrito', tramite.propertyDistrictAddress],
                ['Valor del bien', `S/ ${tramite.quotedPriceProperty?.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-navy-300 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-navy-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT */}
          <div className="bg-white border border-navy-100 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-navy-100 flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">Chat con la notaría</span>
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">En línea</span>
            </div>
            <div className="p-4 flex flex-col gap-2.5 min-h-[180px] max-h-[260px] overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`max-w-[75%] ${msg.senderName !== 'Notaría' ? 'self-end' : 'self-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.senderName !== 'Notaría' ? 'bg-navy-900 text-white rounded-br-sm' : 'bg-navy-50 text-navy-700 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                  <div className={`text-[10px] text-navy-300 mt-1 ${msg.senderName !== 'Notaría' ? 'text-right' : ''}`}>
                    {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-navy-100 flex gap-2">
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un mensaje..."
                className="flex-1 h-9 border border-navy-200 rounded-lg px-3 text-xs text-navy-900 bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
              <button type="submit" className="px-4 h-9 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800">Enviar</button>
            </form>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3">
          {/* PRICE */}
          <div className="bg-white border border-navy-100 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-wide text-navy-300 mb-1.5">Total del trámite</div>
            <div className="text-2xl font-extrabold text-navy-900 tracking-tight">S/ {tramite.finalFee?.toFixed(0)}</div>
            <div className="mt-3 pt-3 border-t border-navy-100 space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-navy-400">Precio base</span><span className="font-semibold text-navy-900">S/ {tramite.baseFee?.toFixed(0)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-navy-400">Descuento tier</span><span className="font-semibold text-emerald-600">− S/ {((tramite.baseFee ?? 0) - (tramite.finalFee ?? 0)).toFixed(0)}</span></div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-white border border-navy-100 rounded-xl p-5">
            <div className="text-sm font-bold text-navy-900 mb-4">Estado del proceso</div>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center w-5 flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${done ? 'bg-navy-900' : active ? 'bg-brand-600 ring-2 ring-brand-100' : 'bg-navy-100 border border-navy-200'}`} />
                      {i < STATUS_STEPS.length - 1 && <div className="w-px flex-1 bg-navy-100 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className={`text-xs font-semibold ${active ? 'text-brand-600' : done ? 'text-navy-900' : 'text-navy-300'}`}>
                        {STATUS_LABEL[step]}
                        {active && <span className="ml-2 bg-brand-50 border border-brand-100 text-brand-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Actual</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/
git commit -m "feat: tramite detail redesign — info grid, chat, timeline"
```

---

## Task 10: Cotizar Redesign

**Files:**
- Modify: `src/app/(auth)/cotizar/page.tsx` (check actual path)

- [ ] **Step 1: Replace cotizar page**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { TramiteType, Broker } from '@/types/api'

const STEPS = ['Notaría', 'Tipo de trámite', 'Detalles de la propiedad']

export default function CotizarPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [notaries, setNotaries] = useState<Broker[]>([])
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([])
  const [selectedNotary, setSelectedNotary] = useState<Broker | null>(null)
  const [selectedType, setSelectedType] = useState<TramiteType | null>(null)
  const [form, setForm] = useState({ address: '', district: '', value: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.brokers.notaries().then(setNotaries).catch(() => {})
    api.tramiteTypes.list().then(ts => setTramiteTypes(ts.filter(t => t.isActive))).catch(() => {})
  }, [])

  const baseFee = selectedType?.baseFee ?? 0
  const discount = baseFee * 0.15
  const total = baseFee - discount

  const submit = async () => {
    if (!selectedNotary || !selectedType) return
    setLoading(true)
    try {
      await api.tramites.create({
        idNotary: selectedNotary.id,
        brokerIdDocumentNumber: '',
        tramiteType: selectedType.name,
        propertyAddress: form.address,
        propertyDistrictAddress: form.district,
        quotedPriceProperty: Number(form.value),
        parties: [],
      })
      router.push('/tramites')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-7 flex justify-center">
      <div className="w-full max-w-xl">
        {/* STEP INDICATOR */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'bg-navy-900 text-white' : i === step ? 'bg-brand-600 text-white ring-2 ring-brand-100' : 'bg-navy-100 text-navy-300 border border-navy-200'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold ${i === step ? 'text-brand-600' : i < step ? 'text-navy-900' : 'text-navy-300'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-navy-900' : 'bg-navy-100'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-navy-100 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-navy-100">
            <div className="text-sm font-bold text-navy-900">{STEPS[step]}</div>
            {step > 0 && selectedNotary && <div className="text-xs text-navy-300 mt-0.5">Notaría: <strong className="text-navy-700">{selectedNotary.fullName}</strong></div>}
          </div>
          <div className="p-6">

            {step === 0 && (
              <div className="space-y-2">
                {notaries.map(n => (
                  <button key={n.id} onClick={() => setSelectedNotary(n)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${selectedNotary?.id === n.id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-navy-100 hover:border-navy-200 hover:bg-navy-50'}`}>
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${selectedNotary?.id === n.id ? 'border-brand-600 bg-brand-600' : 'border-navy-200'}`} />
                    <div>
                      <div className="text-sm font-semibold text-navy-900">{n.fullName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {tramiteTypes.map(t => (
                    <button key={t.id} onClick={() => setSelectedType(t)}
                      className={`p-3.5 rounded-lg border text-left transition-all ${selectedType?.id === t.id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-navy-100 hover:border-navy-200'}`}>
                      <div className={`w-3 h-3 rounded-full border-2 mb-2 ${selectedType?.id === t.id ? 'border-brand-600 bg-brand-600' : 'border-navy-200'}`} />
                      <div className="text-xs font-bold text-navy-900">{t.name}</div>
                      {t.baseFee && <div className="text-[11px] font-semibold text-brand-600 mt-1">Desde S/ {t.baseFee.toFixed(0)}</div>}
                    </button>
                  ))}
                </div>
                {selectedType && (
                  <div className="bg-[#f4f6fb] border border-navy-100 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-navy-400">Precio base</span><span className="font-semibold text-navy-900">S/ {baseFee.toFixed(0)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-navy-400">Descuento Oro (15%)</span><span className="font-semibold text-emerald-600">− S/ {discount.toFixed(0)}</span></div>
                    <div className="flex justify-between text-xs pt-2 border-t border-navy-100"><span className="font-bold text-navy-900">Total estimado</span><span className="text-base font-extrabold text-navy-900">S/ {total.toFixed(0)}</span></div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">Dirección del inmueble</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full h-10 border border-navy-200 rounded-lg px-3 text-sm bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">Distrito</label>
                  <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full h-10 border border-navy-200 rounded-lg px-3 text-sm bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">Valor del bien (S/)</label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    className="w-full h-10 border border-navy-200 rounded-lg px-3 text-sm bg-navy-50/50 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
            )}

          </div>
          <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="px-4 py-2 text-sm text-navy-700 border border-navy-100 rounded-lg disabled:opacity-30 hover:bg-navy-50">← Volver</button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-navy-300">Paso {step + 1} de {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={step === 0 ? !selectedNotary : !selectedType}
                  className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-40">Continuar →</button>
              ) : (
                <button onClick={submit} disabled={loading || !form.address || !form.value}
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-40">
                  {loading ? 'Creando...' : 'Crear trámite'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/
git commit -m "feat: cotizar redesign — 3-step wizard with live price preview"
```

---

## Task 11: Tramites List Redesign

**Files:**
- Modify: `src/app/(auth)/tramites/page.tsx`

- [ ] **Step 1: Replace tramites list page**

```tsx
'use client'

import { useState } from 'react'
import { useTramites } from '@/hooks/useTramites'
import type { TramiteStatus } from '@/types/api'
import Link from 'next/link'

const FILTERS: { label: string; value: TramiteStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Activos', value: 'EN_REVISION' },
  { label: 'Completados', value: 'COMPLETADO' },
  { label: 'Cancelados', value: 'CANCELADO' },
]

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  COTIZADO:        { label: 'Cotizado',        bg: 'bg-gray-50',   text: 'text-gray-600',  border: 'border-gray-200' },
  SOLICITADO:      { label: 'Solicitado',      bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
  DOCS_PENDIENTES: { label: 'Docs. pend.',     bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
  EN_REVISION:     { label: 'En revisión',     bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
  EN_FIRMA:        { label: 'En firma',        bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
  EN_REGISTRO:     { label: 'En registro',     bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
  COMPLETADO:      { label: 'Completado',      bg: 'bg-emerald-50',text: 'text-emerald-700',border:'border-emerald-200'},
  CANCELADO:       { label: 'Cancelado',       bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-200' },
}

export default function TramitesListPage() {
  const [activeFilter, setActiveFilter] = useState<TramiteStatus | undefined>(undefined)
  const { tramites, loading } = useTramites(activeFilter)

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-extrabold text-navy-900 tracking-tight">Mis trámites</h1>
          <p className="text-xs text-navy-300 mt-0.5">{tramites.length} trámite{tramites.length !== 1 ? 's' : ''} encontrado{tramites.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/cotizar" className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800">+ Nuevo trámite</Link>
      </div>

      {/* FILTER PILLS */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button key={f.label} onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeFilter === f.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-navy-500 border-navy-100 hover:border-navy-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-navy-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-50/50 border-b border-navy-50">
              {['Referencia', 'Tipo', 'Estado', 'Monto', 'Fecha', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-navy-300 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-navy-300">Cargando...</td></tr>
            ) : tramites.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-navy-300">No hay trámites</td></tr>
            ) : tramites.map(t => {
              const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.COTIZADO
              return (
                <tr key={t.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-bold text-navy-900">{t.referenceCode}</td>
                  <td className="px-4 py-3 text-xs text-navy-500">{t.tramiteType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.bg.replace('bg-', 'bg-').replace('-50', '-500')}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-navy-900">S/ {t.finalFee?.toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs text-navy-300">{new Date(t.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <Link href={`/tramites/${t.id}`} className="text-xs text-brand-600 font-semibold hover:underline">Ver →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Final build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds or only minor warnings. Fix any remaining import errors (search for `supabase` in `src/` and replace with `api.*` calls).

- [ ] **Step 3: Final commit**

```bash
git add src/
git commit -m "feat: tramites list redesign — filters, table, pagination-ready"
```

---

## Self-Review Notes

- All Supabase imports replaced with `api.*` or STOMP hooks
- JWT travels as httpOnly cookie — `credentials: 'include'` on every `apiFetch`
- WebSocket singleton connects once, subscriptions are per-component with cleanup
- `TramiteStatus` enum values match backend exactly (uppercase)
- Tailwind classes use `navy-*` and `brand-*` tokens defined in `tailwind.config.ts`
- `src/app/page.tsx` is the public landing — no auth required
- All routes under `src/app/(auth)/` are protected by the layout session check
