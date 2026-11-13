# Clearpane Security Model & Audit Report

This document details the security architecture of **Clearpane**, summarizes the threat model, explains how data and identity isolation are enforced, and records the findings of the adversarial security audit.

---

## 1. Security Architecture & Threat Model

### 1.1 Secrets & Environment Isolation

| Item | Location | Visibility | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Environment | Public | Supabase project API gateway endpoint. Safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Environment | Public | Supabase anonymous public API key. Subject strictly to Postgres Row-Level Security (RLS). |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` / Environment | Public | Base URL for OAuth callback redirects. |
| Supabase Service-Role Key | **Not present** | Secret | **Never used or imported.** Clearpane adheres to a zero-trust model where all operations execute under the authenticated user's context. |
| `.env*.local` | Local only | Ignored | Strictly ignored by `.gitignore` to prevent credential leakage into source control. |

### 1.2 Authentication & Session Flow
- **Provider**: Google OAuth via Supabase Auth with server-side PKCE code exchange.
- **Verification**: Every server action, Server Component, layout, query function, and middleware verifies identity using `supabase.auth.getUser()`, which validates the JWT signature against Supabase Auth servers. `supabase.auth.getSession()` is **never trusted** for server-side authorization.
- **Middleware / Proxy Guard**: Next.js Proxy (`src/proxy.ts`) protects `/dashboard` and `/tasks`. Unauthenticated requests redirect to `/login?next=<path>`.
- **Open-Redirect Protection**: The OAuth callback handler (`src/app/auth/callback/route.ts`) validates the `next` redirect parameter using `getSafeRedirect` (`src/lib/safe-redirect.ts`). Protocol-relative URLs (`//evil.com`), backslash bypasses (`/\evil.com`), absolute URLs (`https://evil.com`), and non-relative targets are neutralized and fall back to `/dashboard`.
- **Session Expiry Handling**: Expired JWTs trigger an `unauthenticated` code on all mutations, directing the user to `/login` while preserving unsaved draft inputs in `sessionStorage`.

### 1.3 Authorization & Data Isolation via Row-Level Security (RLS)
Clearpane delegates row-level authorization to PostgreSQL:
- **Table**: `public.tasks` has Row-Level Security enabled (`alter table public.tasks enable row level security;`).
- **No Client User ID**: Client requests never supply `user_id`. Server actions strictly set `user_id: user.id` from `supabase.auth.getUser()`.
- **Database Policies**:
  - `SELECT`: `using (user_id = auth.uid())`
  - `INSERT`: `with check (user_id = auth.uid())`
  - `UPDATE`: `using (user_id = auth.uid()) with check (user_id = auth.uid())`
  - `DELETE`: `using (user_id = auth.uid())`
- **Stored Functions**: The `public.touch_task()` trigger function enforces a fixed search path (`set search_path = public`) to prevent schema search path hijacking.

### 1.4 Input Validation & Sanitization
- **Strict Zod Schemas**: Every mutation input is parsed and validated using Zod (`src/lib/validation/task.ts`).
  - Title: trimmed, 1–120 characters.
  - Notes: trimmed, maximum 1000 characters; empty string normalized to `null`.
  - Status: strict enum (`planned`, `in_progress`, `complete`).
  - Client ID: optional UUID format.
- **Database-Level Check Constraints**:
  - `check (char_length(btrim(title)) between 1 and 120)`
  - `check (char_length(notes) <= 1000)`
- **XSS & Injection Protection**:
  - Zero use of `dangerouslySetInnerHTML` or `eval()`.
  - All user content renders strictly as plain text (verified via `TaskCard.rendering.test.tsx`).
  - All database queries use the Supabase JS query builder with parameterized values; no raw string-concatenated SQL queries exist.

### 1.5 HTTP Security Headers & Content-Security-Policy (CSP)
Configured in `next.config.ts`:
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' blob: data: https://lh3.googleusercontent.com`
  - `font-src 'self' data:`
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
  - `frame-ancestors 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
- `X-Frame-Options: DENY` (Clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `poweredByHeader: false` (Removes `X-Powered-By` fingerprint)

### 1.6 Storage & Token Safety
- **Cookies**: Auth session tokens are stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies managed by `@supabase/ssr`.
- **No LocalStorage Credentials**: Sensitive data, session tokens, and user credentials are **never stored** in `localStorage`. Only non-sensitive draft task titles are briefly retained in `sessionStorage` during mid-session expiry.

### 1.7 Rate Limiting & Abuse Prevention
- **Supabase API Gateway**: Governed by Supabase default rate limits (up to 500 requests/second per project on the REST gateway).
- **Client Throttling**: Tab focus refresh queries (`useTabFocusRefresh`) are throttled to at most once per 10 seconds.
- **Query Bounding**: `listTasks()` enforces a hard `.limit(1000)` ceiling to prevent memory or payload exhaustion attacks.
- **Idempotency**: Client-generated UUIDs (`clientId`) prevent duplicate resource creation on network retries.

---

## 2. Adversarial Security Audit Findings

| ID | Finding | Severity | File & Location | Status | Remediation Applied |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Content-Security-Policy lacked `base-uri` and `form-action` restrictions. | **Medium** | `next.config.ts:3-11` | **Fixed** | Added `base-uri 'self'; form-action 'self';` to `cspHeader` to prevent base injection and form action hijacking. |
| **SEC-02** | Missing `Strict-Transport-Security` (HSTS) response header. | **Medium** | `next.config.ts:13-22` | **Fixed** | Added `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to enforce HTTPS transport. |
| **SEC-03** | `proxy.ts` dropped query strings during login redirection on protected routes. | **Medium** | `src/proxy.ts:24` | **Fixed** | Updated `proxy.ts` to retain search query strings in `next` redirect target (`pathname + search`), verified by `getSafeRedirect`. |
| **SEC-04** | Next.js server exposed `X-Powered-By` framework header. | **Low** | `next.config.ts:24` | **Fixed** | Set `poweredByHeader: false` in `next.config.ts`. |
| **SEC-05** | `npm audit` flags vulnerabilities in devDependencies (`vitest@2` / `tinypool` / `minimatch`). | **Low** | `package.json:28-44` | **Documented** | Confirmed strictly isolated to local testing devDependencies. Production build bundles only zero-vulnerability runtime dependencies. |
| **SEC-06** | Database errors and stack traces could potentially leak to clients if not caught. | **Low** | `src/lib/tasks/actions.ts` | **Verified** | Confirmed all database errors are caught, logged server-side only via `console.error`, and return a sanitized `{ ok: false, code: "unknown", message: "Something went wrong." }` payload. |

---

## 3. Audit Conclusion

Clearpane enforces defense-in-depth across the client, server, and database layers. With all Critical, High, and Medium findings remediated, the application prevents unauthorized data access, privilege escalation, cross-site scripting (XSS), cross-site request forgery (CSRF), clickjacking, and open redirects.

