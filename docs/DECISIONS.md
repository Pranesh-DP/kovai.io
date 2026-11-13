# Architectural & Technical Decision Log

This document records the architectural decisions, trade-offs, and rationale guiding the development of **Clearpane**, along with a log of discovered defects and their fixes.

---

## 1. Decision Log

| Area | Decision | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Authentication** | **Google OAuth via Supabase Auth with PKCE** | Email/Password, Magic Link, NextAuth/Auth.js | Minimizes onboarding friction; completely eliminates credential storage and password-reset attack surfaces. Delegating PKCE exchange to Supabase SSR avoids managing server-side OAuth tokens while providing enterprise-grade identity tokens. |
| **Authorization** | **PostgreSQL Row-Level Security (RLS)** | Application-layer checks (`where user_id = ...` in Node.js) | Enforcing data isolation directly at the database engine guarantees that multi-tenant isolation cannot be bypassed by bugs, regressions, or accidental omissions in server action queries. Zero trust is placed on client inputs. |
| **Status Flow** | **Any-to-Any Status Transitions** | Strict state machine (Planned $\rightarrow$ In Progress $\rightarrow$ Complete only) | Real-world personal task management requires flexibility. Users frequently complete quick tasks directly from Planned, or reopen tasks that need further iteration. Forcing artificial multi-step transitions creates user friction. |
| **Deletion UX** | **6-Second Soft-Undo Window** | Blocking confirmation modal, immediate permanent delete | Blocking modals interrupt productivity and create alert fatigue. Immediate deletion risks accidental loss. A 6-second undo toast matches modern UX standards (e.g., Gmail), giving users a safe safety net while keeping actions fast. |
| **Analytics Architecture** | **Single Table with Client/Server Derived Analytics** | Dedicated stats aggregation tables, database materialized views | With an expected personal scale of hundreds or thousands of tasks, deriving metrics (`computeStats`, `getRecentActivity`) in memory from the primary task dataset eliminates caching synchronization anomalies, background job complexity, and secondary table migrations. |
| **Status Controls** | **Segmented Radio Control on Task Cards** | Native HTML `<select>` dropdown, multi-item context menu | Dropdowns require two clicks and hide options. A segmented control displays all three states simultaneously, offers a single-click transition, and adheres to WAI-ARIA `radiogroup` accessibility guidelines with arrow-key keyboard navigation. |
| **UI Updates** | **Optimistic UI with Automatic Rollback** | Pessimistic loading spinners on every change | Optimistic updates deliver instant feedback (<16ms perceived latency). In the rare event of a network disruption or server rejection, the system gracefully rolls back local state and presents a non-blocking toast with a manual Retry button. |
| **Framework & Engine** | **Next.js 16 with Turbopack & React 19** | Next.js 14 Pages Router, Vite SPA + Express API | Next.js 16 App Router provides Server Components for zero-bundle data fetching, automatic code splitting, modern Proxy middleware for session refresh, and edge-ready security header pipelines. |
| **Form Safety** | **Dynamic Import of Dialogs & Idempotency UUIDs** | Bundled static modal dialogs, non-idempotent form posts | Dynamically importing `TaskFormDialog` via `next/dynamic` (`ssr: false`) strips modal code from initial page payloads. Passing client-generated UUIDs (`clientId`) ensures network retries never produce duplicate database rows. |

---

## 2. Bugs found and how I fixed them

This log records notable edge cases, regressions, and defects encountered during implementation and how they were resolved.

| # | Bug / Issue Description | Root Cause | Fix / Resolution | Status |
| :-: | :--- | :--- | :--- | :---: |
| *1* | *[PLACEHOLDER: Describe the issue you encountered, e.g. Turbopack CSS process exit]* | *[PLACEHOLDER: Explain the root cause, e.g. external process connection failure]* | *[PLACEHOLDER: Detail how it was fixed, e.g. adjusted sandbox permissions / node flags]* | *Verified* |
| 2 | Empty string `clientId` failed Zod UUID validation during task creation | Form state initialized `clientId` as `""`, which failed `z.string().uuid().optional()` because empty strings are not `undefined`. | Passed `clientId: clientId \|\| undefined` in `TaskFormDialog` so Zod correctly skips empty optional values. | Resolved |
| 3 | React hooks immutability violation on recursive `handleDelete` in `TaskBoard` | Recursive retry callback in toast action closed over `handleDelete` before declaration in strict ESLint compiler. | Decoupled recursive reference via a dedicated `handleDeleteRef` updated in `useEffect`. | Resolved |
| 4 | Open-redirect risk via backslash bypass (`/\evil.com`) | Browsers normalize `/\` to `//`, bypassing standard `startsWith("//")` guards. | Extracted validation into `src/lib/safe-redirect.ts` with strict checks against backslashes and non-relative paths. | Resolved |
| 5 | Missing `h1` landmark on mobile viewports | `AppHeader` used `hidden md:flex`, hiding the page's single `h1` from mobile screen readers. | Adjusted `AppHeader` to `sr-only md:not-sr-only md:flex` so screen readers retain the proper heading level across all breakpoints. | Resolved |
| 6 | JSDOM missing `@testing-library/jest-dom` custom matchers | Test environment lacked `toBeInTheDocument` extensions. | Standardized unit tests to native DOM assertions (`toBeDefined()`, `document.body.contains()`) for robust test portability. | Resolved |
