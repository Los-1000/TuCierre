# TuCierre — Backend Migration + Visual Redesign

**Date:** 2026-06-02  
**Status:** Approved  
**Scope:** Complete Spring Boot backend, migrate frontend off Supabase, redesign all screens

---

## 1. Context

TuCierre is a notarial transaction management platform for real estate brokers in Peru. Brokers quote, track, and manage transactions (trámites) with notary offices. The platform includes a tier system (Bronce/Plata/Oro), price matching, real-time chat, and referral commissions.

**Current state:**
- Frontend: Next.js 14, TypeScript — queries Supabase directly (no REST layer)
- Backend: Spring Boot 4, Java 21 — only 9 basic creation endpoints, no auth
- Database: Supabase PostgreSQL (stays as-is)

**Goal:** Replace all Supabase client usage with Spring Boot REST + WebSocket. Keep Supabase only as the PostgreSQL database. Redesign all screens with a minimalist legal-corporate aesthetic inspired by NotaryOs.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js 14 Frontend                                │
│  - REST calls via fetch (no Supabase client)        │
│  - WebSocket via @stomp/stompjs (SockJS)            │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / WS
┌────────────────────▼────────────────────────────────┐
│  Spring Boot 4 Backend                              │
│  - JWT auth (access 15min + refresh 7d, httpOnly)   │
│  - REST API: /api/**                                │
│  - WebSocket: /ws endpoint (STOMP over SockJS)      │
│  - Spring Security on all protected routes          │
└────────────────────┬────────────────────────────────┘
                     │ JPA / HikariCP
┌────────────────────▼────────────────────────────────┐
│  Supabase PostgreSQL                                │
│  (existing tables, no schema changes except         │
│   adding password_hash to brokers table)            │
└─────────────────────────────────────────────────────┘
```

### Auth Flow
1. `POST /auth/login` → validates email + bcrypt password against `brokers.password_hash` → returns JWT pair in httpOnly cookies
2. Every protected request: Spring Security filter extracts JWT from `Authorization: Bearer` header or cookie, validates, injects broker into SecurityContext
3. `POST /auth/refresh` → validates refresh token cookie → issues new access token
4. `POST /auth/logout` → clears cookies server-side

### Real-time (WebSocket)
- Spring WebSocket with STOMP over SockJS at `/ws`
- Topics:
  - `/topic/tramite/{id}/status` — status change events
  - `/topic/tramite/{id}/chat` — new message events
- Frontend subscribes on tramite detail page mount, unsubscribes on unmount
- Backend publishes via `SimpMessagingTemplate` when status or message changes

---

## 3. Backend — New Endpoints

All existing endpoints are kept. The following are added:

### Auth (`/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Email + password → JWT cookies |
| POST | `/auth/signup` | Register new broker → JWT cookies |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Clear JWT cookies |

### Broker (`/api/brokers`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/brokers/me` | Current authenticated broker |
| GET | `/api/brokers/{id}` | Broker by ID |
| GET | `/api/brokers/notaries` | All brokers where is_admin=true (notary staff) |
| PATCH | `/api/brokers/me` | Update profile (name, phone) |

### Tramite (`/api/tramites`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tramites` | List tramites for current broker (filterable by status, page) |
| GET | `/api/tramites/{id}` | Single tramite with parties + status history |
| PATCH | `/api/tramites/{id}/status` | Update status (notary-only for most transitions) |
| DELETE | `/api/tramites/{id}` | Cancel tramite (broker-owned only, sets status=cancelado) |

### Dashboard (`/api/dashboard`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Active count, completed this month, total value, total savings, commission, tier progress |

### Chat (`/api/tramites/{id}/messages`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tramites/{id}/messages` | Message history (paginated, newest last) |
| POST | `/api/tramites/{id}/messages` | Send message → persists + publishes to WS topic |

### Price Match (`/api/price-match`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/price-match/broker/{brokerId}` | Price match requests for a broker |
| PATCH | `/api/price-match/{id}/approve` | Approve price match (notary-only) |
| PATCH | `/api/price-match/{id}/reject` | Reject price match (notary-only) |

### Database change
- `ALTER TABLE brokers ADD COLUMN password_hash VARCHAR(255)` — stores bcrypt hash
- Migration script included in backend resources

---

## 4. Backend — Dependencies to Add

```xml
<!-- Spring Security -->
<dependency>spring-boot-starter-security</dependency>
<!-- JWT -->
<dependency>jjwt-api + jjwt-impl + jjwt-jackson (io.jsonwebtoken 0.12.x)</dependency>
<!-- WebSocket -->
<dependency>spring-boot-starter-websocket</dependency>
<!-- Password hashing (included in Spring Security) -->
```

---

## 5. Frontend Migration

Replace all Supabase calls with backend API calls. Supabase packages (`@supabase/supabase-js`, `@supabase/ssr`) are removed entirely.

### API Client
Single `src/lib/api.ts` module:
- `apiFetch(path, options)` — wraps `fetch` with `credentials: 'include'`, handles 401 → redirect to login. JWT travels as httpOnly cookie automatically — no manual header management needed.
- Typed response helpers per resource

### Auth
- Remove: `createServerClient`, `createBrowserClient`, all `supabase.auth.*` calls
- Add: `POST /auth/login` call on login form submit. Backend sets httpOnly cookies — frontend receives them automatically, no manual JWT storage.
- `(auth)/layout.tsx`: validate session by calling `GET /api/brokers/me` instead of Supabase session check

### Custom Hooks — replace Supabase subscriptions
| Old hook | New implementation |
|----------|-------------------|
| `useTramites(filters)` | `useQuery` calling `GET /api/tramites` |
| `useTramite(id)` | `useQuery` calling `GET /api/tramites/{id}` |
| `useTramiteStatusRealtime` | STOMP subscription to `/topic/tramite/{id}/status` |
| `useChatRealtime` | STOMP subscription to `/topic/tramite/{id}/chat` |

### WebSocket Client
`src/lib/ws.ts` — singleton STOMP client over SockJS:
```ts
// connect on app load, subscribe per tramite
const stompClient = new Client({ brokerURL: '/ws', webSocketFactory: () => new SockJS('/ws') })
```

---

## 6. Visual Redesign

**Design system** (aligned with NotaryOs):

| Token | Value |
|-------|-------|
| Background | `#f4f6fb` |
| Card bg | `white` |
| Sidebar bg | `white` |
| Border | `#e1e7f3` (navy-100) |
| Text primary | `#0f1d3d` (navy-900) |
| Text secondary | `#4a6da8` (navy-500) |
| Text muted | `#97aed4` (navy-300) |
| Brand accent | `#2c4dfb` |
| Danger | `#dc2626` |
| Font | Inter (400, 500, 600, 700, 800) |
| Border radius | 8px inputs/buttons, 10–12px cards |
| Tier gold | `#b2832e` / `#fdf8ee` bg |

**Screens:**
1. **Landing** — Nav + Hero (split text/dashboard preview) + Features grid + Tiers + Footer
2. **Auth** — Split layout: navy panel left (logo, testimonial, stats) + white form right (login/signup tabs)
3. **Dashboard** — Sidebar + topbar + 4 stat cards + tramites table + right col (tier progress, commission, quick actions)
4. **Cotizar** — 3-step wizard: step indicator + form card + price preview (updates live as user selects type)
5. **Tramites list** — Table view with status filters, search, pagination
6. **Tramite detail** — Info grid + documents list + chat + right col (price breakdown, timeline, notaría)

**Component changes:**
- Replace `Playfair Display + DM Sans` with `Inter` from `next/font/google`
- Update `tailwind.config.ts`: remove current brand colors, add navy palette + brand-600
- All existing Radix components keep their structure, restyled with new tokens
- Remove dark mode (light mode only, as per NotaryOs direction)

---

## 7. Screens Not Fully Redesigned

The following screens get new design tokens (colors, font, spacing) applied but no structural layout changes:
- Profile / settings page
- Referidos page
- Price match detail page

All 6 screens listed in Section 6 receive full redesign treatment.

---

## 8. Constraints

- Backend must run on port `8080`; frontend proxies `/api` and `/ws` via Next.js `rewrites` in `next.config.mjs`
- No changes to the Supabase database schema except adding `password_hash` to `brokers`
- Existing broker records: `password_hash` starts NULL. On login, if NULL, backend returns 403 with `{"error":"password_reset_required"}` and frontend redirects to `/auth/change-password` with a one-time token sent to their email.
- JWT secret stored in Spring Boot `application.properties` via env var `JWT_SECRET`
- CORS: backend allows `http://localhost:3000` in development

---

## 9. Out of Scope

- Mobile app
- Dark mode
- Email notifications
- Admin panel (notary-side views)
- Document upload (stays as-is, deferred)
- Supabase Storage (stays for any file uploads already implemented)
