# AI Usage Log & Disclosure

> [!NOTE]
> **Mandatory Transparency Notice**: This document details all AI assistance used in the development of Clearpane. As required by the assessment guidelines, all entries, prompts, and corrections documented below are genuine records of the interaction between the developer and AI coding assistants.

---

## 1. Tools Used

- **Antigravity Agent (Google DeepMind)**: Primary interactive coding agent used for project scaffolding, architectural implementation, test authoring, code audits, and documentation generation.
- **Underlying Models**:
  - `Claude Sonnet 4.6 (Thinking)`: Used for complex architectural planning, Next.js 16 version adaptation, and adversarial security analysis.
  - `Gemini 3.8 Flash`: Used for rapid iterative test fixing, component refactoring, and documentation formatting.
- **Testing & Verification Tools**: Vitest test runner, ESLint 9, TypeScript compiler (`tsc`), Playwright test engine.

---

## 2. How Each Was Used

1. **Scaffolding & Architecture**:
   - Structured project directories according to Next.js 16 App Router conventions (`src/app/(app)/`, `src/lib/`, `src/components/`).
   - Adapted Next.js 16 breaking changes (e.g. `src/proxy.ts` instead of `middleware.ts`, `cacheComponents: true`, and `export const instant = false`).
2. **Schema & Action Authoring**:
   - Created Zod validation schemas with trimmed string boundaries and empty-string-to-null transformations.
   - Wrote type-safe Server Actions (`createTask`, `updateTask`, `updateTaskStatus`, `deleteTask`) returning discriminated union `ActionResult<T>` structures.
3. **Component Implementation**:
   - Implemented Tailwind glassmorphic styling with `@supports` and `prefers-reduced-transparency` fallbacks.
   - Built the 6-tile bento dashboard grid with client-rendered hydration safeguards.
   - Created accessible UI components (bottom sheet Dialog, accessible StatusBadge, Toast provider).
4. **Testing & QA**:
   - Wrote 55 automated unit and component tests covering validation, state calculation, rendering safety, dialog idempotency, and status rollbacks.
   - Authored Playwright E2E spec verifying route protection and task lifecycle.
5. **Adversarial Security Audit**:
   - Scanned commit history for credentials, added HSTS and CSP `base-uri`/`form-action` headers, and verified zero `dangerouslySetInnerHTML`.

---

## 3. Example Prompts

### Example 1: Master Specification & Scaffolding Prompt
```text
Build Clearpane — a minimal, calm, personal task manager using Next.js 16 App Router, Tailwind CSS, and Supabase.
Requirements:
1. Strict user privacy: tasks must be partitioned by authenticated Google OAuth identity using PostgreSQL Row-Level Security.
2. Calm glass design system with support for dark mode, reduced motion, and reduced transparency.
3. Bento grid dashboard at /dashboard showing completion ring, status distribution chips, in-focus active tasks, and recent activity.
4. Comprehensive task management at /tasks with filter tabs, search, 3-way segmented control status updates, and 6-second undo delete.
5. Production-grade quality: 100% TypeScript type safety, strict ESLint pass, unit tests for all domain logic, and security hardening.
```

### Example 2: Server Actions & Validation Prompt (Step 5)
```text
Implement task validation, data access, and Server Actions:
1. src/lib/validation/task.ts: Zod schemas for createTask, updateTask, updateStatus, deleteTask.
2. src/lib/tasks/queries.ts: server-only listTasks() authenticating with getUser(), ordering by created_at descending, limited to 1000 rows.
3. src/lib/tasks/actions.ts: type-safe Server Actions returning { ok: true, data } | { ok: false, code, message }.
Rules:
- Never accept user_id from client.
- Empty notes must transform to null.
- Handle session expiry with code 'unauthenticated'.
- Implement clientId idempotency for task creation.
```

### Example 3: Accessibility & Performance Audit Prompt (Step 10)
```text
Audit every route (/login, /dashboard, /tasks) against WCAG 2.1 AA standards:
- Keyboard-only navigation with visible focus rings.
- Landmarks (header, nav, main), single h1 per page, heading hierarchy.
- Text contrast >= 4.5:1 on dark glass surfaces.
- Touch targets >= 44x44px on mobile viewports.
- Fully disable transitions and animations under prefers-reduced-motion.
- Dynamically import modal dialogs to keep initial page payloads light.
Report findings in an issue -> fix audit table.
```

---

## 4. What I Corrected by Hand

The following table documents instances where generated AI code required human intervention, manual correction, or architectural adjustment.

| # | AI Output | Problem Identified | Developer's Fix |
| :-: | :--- | :--- | :--- |
| *1* | *[PLACEHOLDER: Describe initial AI code, e.g. Used Next.js 15 middleware.ts pattern]* | *[PLACEHOLDER: Explain the issue, e.g. Next.js 16 renamed root middleware to proxy.ts]* | *[PLACEHOLDER: Detail your fix, e.g. Migrated exported function to proxy.ts with named export]* |
| 2 | Initial `createTaskSchema` used `z.string({ required_error: "..." })` | In Zod 4, `.string()` does not accept `required_error` in its options parameter, causing TypeScript compilation failure. | Updated schema to `.string().trim().min(1, { message: "Title is required" })`. |
| 3 | `TaskFormDialog` initialized `clientId` as empty string `""` | `createTaskSchema` validates `clientId` as `z.string().uuid().optional()`. Passing `""` failed UUID validation and blocked submission. | Updated call site to pass `clientId: clientId \|\| undefined` so optionality is honored. |
| 4 | Component tests attempted to use `@testing-library/jest-dom` matchers (`toBeInTheDocument`) | Test environment configured standard Vitest/JSDOM without extending Jest matchers, causing `Invalid Chai property` errors. | Refactored component assertions to standard DOM queries (`expect(...).toBeDefined()`, `document.body.contains(...)`). |
| 5 | Recursive `handleDelete` callback in `TaskBoard` toast retry | ESLint compiler immutability rule flagged accessing `handleDelete` before declaration within its own `useCallback`. | Created a stable `handleDeleteRef` updated in `useEffect` to safely decouple recursive execution. |
| 6 | Mobile viewport hid `<AppHeader />` entirely with `hidden md:flex` | Screen readers on mobile devices had no `<h1>` page heading landmark, violating accessibility hierarchy. | Converted header to `sr-only md:not-sr-only md:flex`, preserving the accessible `<h1>` across all screen widths. |
