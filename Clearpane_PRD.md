# Clearpane — Product Requirements Document and Implementation Plan

*A focused, glass-clear task tracker. Prepared for the Graduate Support Engineer Trainee Assessment.*

## 1. What the assessment is really testing

The brief looks small on purpose. Reading between the lines, the evaluators score seven areas, and four of them are about judgment rather than code.

| Evaluation area | What they are really asking | How Clearpane answers it |
|---|---|---|
| Requirement understanding | Did you spot the gaps? | Section 3: an explicit gap-and-assumption register, repeated in the user docs |
| AI tool usage | Responsible, not blind, use of AI | Section 11: AI usage log with a "what I corrected by hand" table |
| Application functionality | Do the four use cases work, correctly? | Section 5: acceptance criteria per requirement, tested before submission |
| Problem solving | Can you troubleshoot and decide? | Decision log (Section 10) records trade-offs and bugs found |
| Documentation | Can a stranger use it? | Section 12: user guide written to the exact six headings requested |
| User experience | Simple and usable | Glass UI, one-click status change, empty/loading/error states |
| Deployment | Does it actually run? | Live URL on free tier plus a 5-minute local setup |

**Core objective:** deliver exactly the four required capabilities (Google sign-in, create task, list tasks, update status) with unusually high execution quality, and resist scope creep. Every addition beyond the brief must be justified as a usability or completeness fix, and is labelled as such.

## 2. Product concept

**Clearpane** is a personal task tracker where every task lives in one of three states, and a bento-grid dashboard shows progress at a glance. It is a standalone SaaS in shape (multi-user, hosted, isolated accounts) but deliberately minimal in features.

**Target user:** an individual who wants a calm, fast place to track work without the weight of a project-management suite.

**Positioning against other submissions:** most submissions will ship a plain table with a dropdown. Clearpane wins on (a) a polished, consistent design system, (b) visible handling of edge cases (empty states, failures, offline, double-clicks), (c) security done properly with database-level isolation, and (d) documentation that reads like a product, not a homework answer.

## 3. Gap and assumption register

This is the section that demonstrates requirement analysis. Each ambiguity is stated, resolved, and reflected in the user documentation.

| # | Ambiguity in the brief | Decision (assumption) | Rationale |
|---|---|---|---|
| A1 | Can users see each other's tasks? | **No.** Tasks are private to the signed-in Google account | Safer default; enforced by row-level security, not just UI |
| A2 | What fields does a task have? | Title (required, max 120 chars), notes (optional, max 1000 chars) | Minimum useful set; no due dates or priorities in v1 |
| A3 | Which status transitions are allowed? | Any state to any state | Real work is messy; blocking "Complete to In Progress" would frustrate users who reopen tasks |
| A4 | What is the default status of a new task? | **Planned** | Matches the first listed state |
| A5 | Can tasks be edited or deleted? | Edit title and notes: yes. Delete: yes, with confirmation and 6-second undo | The brief only says create, view, update status, but a task app without delete or edit feels broken. Flagged as a deliberate usability addition |
| A6 | How is the list ordered? | Newest first by default; filter by status; search by title | "View the list" needs some order; filtering is a light usability aid |
| A7 | What happens on first login? | Account is created automatically; user sees a friendly empty state | Avoids a dead-end screen |
| A8 | Which Google accounts can sign in? | Any Google account | No allow-list specified |
| A9 | What happens on sign-out or session expiry? | Redirect to the sign-in page; no data lost | Standard expectation |
| A10 | Offline or failed-request behaviour? | Optimistic UI with rollback and a toast on failure | Prevents silent data loss |
| A11 | Data retention? | Tasks persist until the user deletes them; account deletion is out of scope, documented as a limitation | Scope control |
| A12 | Languages, time zones? | English only; timestamps stored in UTC and shown in the browser's local time | Keeps scope tight |

## 4. Scope

**In scope (required):** Google sign-in; create task; list tasks; update task status across Planned, In Progress, Complete.

**In scope (justified additions):** edit task, delete with undo, status filter and title search, dashboard analytics, empty/loading/error states, sign-out.

**Explicitly out of scope:** teams or sharing, due dates and reminders, tags, comments, attachments, notifications, email/password sign-in, native mobile apps, admin panel. These are listed in the Known Limitations section of the user guide so reviewers see the omission was intentional.

## 5. Functional requirements and acceptance criteria

### FR1 — Google sign-in
- A signed-out visitor sees a landing screen with a single "Continue with Google" button.
- Successful sign-in lands on the dashboard within 3 seconds on a normal connection.
- A signed-out visitor who opens a dashboard URL directly is redirected to sign-in, and returned to the intended page afterwards.
- Cancelling or failing the Google consent screen returns the user to sign-in with a readable message, never a blank or raw error page.
- Sign-out clears the session and returns to the landing screen.

### FR2 — Create task
- "New task" opens a modal (button in the header and a keyboard shortcut, **N**).
- Title is required; empty or whitespace-only titles are rejected with an inline message. Maximum length enforced in both UI and database.
- Status defaults to Planned and can be chosen at creation.
- Pressing Enter submits; Escape closes; focus is trapped in the modal and returned to the trigger on close.
- Double-clicking Save creates exactly one task.

### FR3 — View tasks
- The task list shows title, notes preview, status badge, and relative created time.
- Filter tabs: All, Planned, In Progress, Complete, each with a live count.
- Search filters by title as you type (debounced).
- Empty states are specific: no tasks yet, no results for this filter, no results for this search.
- Skeleton loaders show while fetching; a retry button shows on fetch failure.

### FR4 — Update status
- Each task has a segmented control with the three states; one click changes the status.
- The UI updates instantly (optimistic) and rolls back with an error toast if the save fails.
- The status-change timestamp is recorded and feeds the dashboard's recent-activity card.
- Changes made in another browser tab appear after refocus or refresh without stale overwrites.

### Non-functional requirements
- **Security:** no secrets in client code; row-level security on every table; no user can read or write another user's rows even by calling the API directly.
- **Performance:** Lighthouse performance 90+ on desktop; list renders 500 tasks without jank.
- **Accessibility:** WCAG AA contrast, full keyboard operation, visible focus rings, screen-reader labels on all controls, status never conveyed by colour alone.
- **Responsiveness:** usable from 360 px wide phones to wide desktops.

## 6. Experience and visual design

### 6.1 Design language: refined glassmorphism

Frosted-glass surfaces float over a deep slate background with soft indigo light blooms. The glass must stay legible, so text always sits on sufficiently opaque surfaces.

| Token | Value | Use |
|---|---|---|
| Background base | slate-950 `#0B1020` with two blurred indigo radial glows | App backdrop |
| Glass surface | `rgba(255,255,255,0.06)` + `backdrop-filter: blur(12px)` | Cards, modal, sidebar |
| Glass border | `1px solid rgba(255,255,255,0.12)` | Edge definition |
| Primary accent | indigo-500 `#6366F1`, hover indigo-400 | Buttons, focus, active nav |
| Text primary / secondary | slate-50 / slate-400 | Content hierarchy |
| Status: Planned | slate-300 with outline icon | Neutral |
| Status: In Progress | indigo-400 with half-filled icon | Active |
| Status: Complete | emerald-400 with check icon | Done |
| Radius | 20 px cards, 12 px controls | Soft geometry |
| Padding | 24 px card padding (32 px on large screens) | Generous spacing |
| Type | Inter, 14/16 px body, 600 weight headings | Clean and readable |

Core glass rule:

```css
.glass {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(2, 6, 23, 0.35);
}
@supports not (backdrop-filter: blur(12px)) {
  .glass { background: rgba(15, 23, 42, 0.92); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: rgb(15, 23, 42); backdrop-filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

The fallbacks matter: older browsers and users who request reduced transparency still get a fully readable interface.

### 6.2 Layout

**Responsive side navigation.** On desktop (1024 px and up) a 240 px glass sidebar holds the logo, nav items (Dashboard, Tasks), and the user card with sign-out. On tablets it collapses to a 72 px icon rail. On phones it becomes a slide-over drawer opened by a menu button, with a backdrop, focus trap, and Escape to close.

**Bento grid dashboard.** A 12-column CSS grid on desktop, 6 on tablet, 1 on phone. Tiles are different sizes so the page feels designed rather than tabulated. Every tile is derived from the single tasks table, so there is no extra data to maintain.

| Tile | Size (desktop) | Content |
|---|---|---|
| Greeting and quick-add | 8 x 2 | "Good evening, Name" plus a one-line add field that opens the modal prefilled |
| Completion ring | 4 x 2 | Percentage complete as an animated ring |
| Status split | 4 x 2 | Three stat chips (Planned, In Progress, Complete) with counts |
| Progress bar breakdown | 8 x 1 | One stacked bar showing the three states proportionally |
| In focus now | 6 x 2 | Up to three In Progress tasks with one-click "Mark complete" |
| Recent activity | 6 x 2 | Last five status changes with relative times |

Empty accounts show the same grid with friendly placeholder content, so new users see what the product will look like.

**Task creation modal.** Centered glass dialog, max 520 px wide, title field auto-focused, optional notes textarea with character counter, status selector, Save and Cancel. Becomes a bottom sheet on phones.

### 6.3 Key interaction details
- Status segmented control uses icons plus text so colour is never the only signal.
- Deleting shows a confirmation, then a 6-second "Undo" toast; the row is soft-hidden locally and only deleted after the window closes.
- Toasts are announced to screen readers via an ARIA live region.
- Micro-animations are short (150 to 200 ms) and removed under reduced-motion.

## 7. Architecture

### 7.1 Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) with TypeScript | Server components, route protection, one deploy unit |
| Styling | Tailwind CSS with a small set of custom glass utilities | Fast, consistent tokens |
| Auth | Supabase Auth with Google OAuth provider | No custom OAuth code; Google client secret stays in the Supabase dashboard |
| Database | Supabase Postgres with row-level security | Isolation enforced in the database |
| Hosting | Vercel (free tier) | One-click deploy, HTTPS, preview URLs |
| Validation | Zod schemas shared by form and server | One source of truth for limits |
| Testing | Vitest for logic, Playwright for the happy path | Credible without over-investing |

Any equivalent stack (for example Firebase Auth and Firestore) would satisfy the brief; this one is chosen because row-level security gives the strongest "secure by default" story with the least custom code.

### 7.2 Secrets and security model

The rule is simple: **nothing sensitive ever ships to the browser.**

| Value | Where it lives | Exposed to the browser? |
|---|---|---|
| Google OAuth client ID and client secret | Supabase dashboard (Auth providers) and Google Cloud console | No. Client secret is never in the repo or the frontend |
| Supabase project URL | Environment variable, `NEXT_PUBLIC_` prefix | Yes, by design; it is a public address |
| Supabase anon (publishable) key | Environment variable, `NEXT_PUBLIC_` prefix | Yes, by design; safe only because row-level security is enabled |
| Supabase service-role key | Not used by this app at all | Never. If ever needed, server-only and never prefixed `NEXT_PUBLIC_` |

Additional controls:
- `.env.local` is git-ignored; the repo ships `.env.example` with placeholder names only.
- A pre-commit secret scan (for example gitleaks) runs before submission, and the repo history is checked once before publishing.
- OAuth redirect URLs are restricted to the production domain and localhost in both Google Cloud and Supabase.
- Session cookies are handled server-side by the Supabase SSR helpers (HTTP-only, secure).
- Mutations go through server actions that re-validate input with Zod and never trust client-supplied user IDs; the user ID comes from the verified session.
- Security headers (CSP, X-Frame-Options, Referrer-Policy) set in the Next.js config.

### 7.3 Data flow
1. The user clicks "Continue with Google"; the app asks Supabase to start the OAuth flow.
2. Google authenticates the user and returns to Supabase, which returns to the app's callback route with a one-time code.
3. The callback route exchanges the code for a session and sets cookies, then redirects to the dashboard.
4. Server components read tasks using the user's session; row-level security guarantees only that user's rows are returned.
5. Mutations run as server actions, followed by cache revalidation; the client applies optimistic updates in the meantime.

## 8. Data model

One table is enough. Profiles come from Supabase's built-in `auth.users`.

```sql
create type task_status as enum ('planned', 'in_progress', 'complete');

create table public.tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid()
                    references auth.users(id) on delete cascade,
  title             text not null check (char_length(btrim(title)) between 1 and 120),
  notes             text check (char_length(notes) <= 1000),
  status            task_status not null default 'planned',
  status_changed_at timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index tasks_user_status_idx  on public.tasks (user_id, status);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);

-- keep timestamps honest, server-side
create function public.touch_task() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end $$;

create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_task();

-- row-level security: the heart of the isolation story
alter table public.tasks enable row level security;

create policy "own tasks: select" on public.tasks
  for select using (user_id = auth.uid());
create policy "own tasks: insert" on public.tasks
  for insert with check (user_id = auth.uid());
create policy "own tasks: update" on public.tasks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own tasks: delete" on public.tasks
  for delete using (user_id = auth.uid());
```

Design notes: the enum prevents invalid states at the database level; `user_id` defaults to `auth.uid()` so the client never supplies it; the length checks mirror the Zod limits so bypassing the UI still fails; dashboard analytics are computed from this one table.

## 9. Implementation plan

Three phases, each ending in a working, demonstrable state. Time estimates assume one developer using AI-assisted tools, roughly 12 to 16 hours total.

### Phase 1 — Core data models and authentication (about 3 to 4 hours)

**Goal:** a signed-in user can reach a protected page, and the database is secure before any feature exists.

1. Scaffold the Next.js TypeScript project, add Tailwind, set up linting and formatting.
2. Create the Supabase project; run the schema from Section 8; confirm RLS is enabled.
3. Create the Google OAuth client in Google Cloud (consent screen, authorised redirect URI pointing at Supabase); paste the credentials into the Supabase Google provider settings only.
4. Add Supabase SSR helpers (browser client, server client, middleware for session refresh).
5. Build the landing page with the Google button, the `/auth/callback` route, and sign-out.
6. Add route protection: unauthenticated requests to the app routes redirect to sign-in, preserving the destination.
7. Add `.env.example`, git-ignore `.env*.local`, and run a secret scan.
8. Write the design tokens and `.glass` utilities; build the app shell with sidebar and responsive drawer.

**Exit criteria:** sign in and out works locally; a second Google account cannot read the first account's rows (verified with a direct API call); no secret appears in the repo or the browser bundle.

### Phase 2 — Main dashboard and CRUD workflows (about 5 to 6 hours)

**Goal:** every required use case works end to end.

1. Define shared Zod schemas and TypeScript types for tasks.
2. Implement server actions: `createTask`, `updateTaskStatus`, `updateTask`, `deleteTask`, plus a `listTasks` query.
3. Build the task creation modal with validation, focus trap, keyboard shortcuts, and the bottom-sheet variant for phones.
4. Build the task list with status badges, the segmented status control, filter tabs with counts, and debounced search.
5. Add optimistic updates with rollback and toast notifications for create, status change, and delete (with undo).
6. Build the bento dashboard tiles from Section 6.2 using aggregate counts and the recent-activity query.
7. Add skeleton loaders and the three specific empty states.

**Exit criteria:** all acceptance criteria for FR1 to FR4 pass manually; the dashboard numbers match the list; the layout holds at 360, 768, and 1440 px.

### Phase 3 — Edge-case handling and polish (about 4 to 5 hours)

**Goal:** the app feels finished and survives bad conditions.

| Edge case | Handling |
|---|---|
| Session expires mid-use | Server action returns an auth error; client shows "Session expired" and redirects to sign-in without losing the open modal's text where possible |
| Network failure during status change | Roll back optimistic update, error toast with Retry |
| Rapid double-submit | Disable Save while pending; server-side idempotency via a client-generated UUID on create |
| Very long titles or notes | Counter in the form; truncation with tooltip in the list |
| Whitespace-only or script-like input | Trimmed and validated; rendered as text only (React escaping), never as HTML |
| Two tabs changing the same task | Last write wins; list revalidates on window focus so stale state is short-lived |
| Deleted task still open elsewhere | Update returns zero rows; show "This task no longer exists" and refresh |
| Google consent denied or popup blocked | Friendly message on sign-in page with a retry button |
| Large lists | Paginate or virtualise beyond 200 items |
| No JavaScript or slow load | Server-rendered shell shows content before hydration |

Polish tasks: accessibility audit (keyboard-only run, screen-reader spot check, contrast check including text on glass), reduced-motion and reduced-transparency fallbacks, favicon and page titles, Open Graph preview, custom 404 and error pages, Lighthouse pass.

Testing: unit tests for validation and the status-count helper; one Playwright test covering create, change status, filter, delete and undo (with a seeded test session); a manual RLS test with two accounts.

**Exit criteria:** no unhandled error states found in a deliberate break-it session; Lighthouse accessibility 95+ and performance 90+; deployed URL works from a fresh browser profile and a phone.

### Deployment (finish of Phase 3)
1. Push to GitHub with a clean commit history and a descriptive README.
2. Import the repo into Vercel; set the two public environment variables.
3. Add the Vercel production URL to Supabase's allowed redirect URLs and to the Google OAuth authorised origins.
4. Publish the Google consent screen to production (or add reviewers as test users) so that **evaluators can actually sign in**. This is the most common failure for Google-auth assessments: a consent screen left in "Testing" mode rejects anyone not on the test-user list.
5. Run the full acceptance checklist on the live URL using a Google account that has never used the app.

## 10. Decision log (starter entries)

Keep this running in the repo as `DECISIONS.md`; add real bugs and trade-offs as they occur.

| Decision | Alternatives considered | Reason chosen |
|---|---|---|
| Supabase Auth with Google provider | Hand-rolled OAuth; NextAuth | Least secret-handling code; secrets never touch the repo |
| Row-level security over app-level checks | Checks only in server actions | Defence in depth; protects even against a bug in app code |
| Any-to-any status transitions | Strict forward-only flow | Users reopen work; strictness adds friction without value |
| Soft undo for delete | Confirmation dialog only | Faster and kinder; avoids accidental data loss |
| One table, derived analytics | Separate stats tables | No sync problems; fits the scope |
| Segmented control for status | Dropdown; drag-and-drop board | One click, accessible, works on touch; a board would expand scope |

## 11. AI usage summary (template to complete honestly)

The evaluators want evidence of effective and *responsible* use, so record this as you build rather than reconstructing it afterwards.

**Tools used:** list each tool and its role (for example: an AI chat assistant for requirements analysis and this PRD; an AI coding assistant for scaffolding components and server actions; an AI image or colour tool if used for the logo).

**How each was used:** one or two sentences per tool, such as "drafted the SQL schema and RLS policies, which I then reviewed line by line."

**Example prompts (optional but valuable):** include three or four real ones, such as the prompt that produced the schema, the one that produced the glass modal, and one that fixed a bug.

**What I corrected by hand:** a table of real examples. Typical findings worth looking for and recording honestly:

| AI output | Problem found | My fix |
|---|---|---|
| Generated policies or queries | Missing `with check` on update, or a table without RLS enabled | Added checks; verified with a second account |
| Generated client code | Supabase key or URL handling that mixed public and server-only values | Moved to the correct env prefix; added `.env.example` |
| Generated glass styles | Text contrast too low on translucent cards; no fallback for unsupported browsers | Raised surface opacity; added `@supports` and reduced-transparency fallbacks |
| Generated modal | No focus trap or Escape handling | Added accessible dialog behaviour |
| Generated optimistic update | No rollback on failure | Added error path and toast |

Do not invent entries; reviewers can tell. Even two or three genuine corrections beat a long fabricated list.

## 12. User documentation outline

The README (and a `docs/USER_GUIDE.md`) should use exactly the headings the brief requests, in this order.

1. **How to access and use the application** — live URL, a three-step quick start (sign in, press New task, click a status), and a short description of the dashboard tiles. Add one or two screenshots.
2. **Login instructions** — click "Continue with Google", choose an account, approve basic profile access. State clearly that the app requests only name, email, and avatar, and never touches Gmail or Drive. Include what to do if the consent screen shows an "unverified app" notice (click Advanced, then continue) when applicable, and who to contact if sign-in fails.
3. **Important assumptions made** — the register from Section 3, in plain language.
4. **Known limitations** — single-user private tasks only, no sharing, no due dates or reminders, no account deletion, English only, last-write-wins across tabs, free-tier hosting may take a few seconds to wake after inactivity.
5. **Important notes or warnings for users** — tasks are tied to the Google account used, so a different account shows a different list; deleting a task is permanent after the undo window; this is an assessment build, so do not store sensitive personal information in tasks.
6. **Setup instructions** — prerequisites (Node version, a Supabase project, a Google Cloud OAuth client), clone and install, copy `.env.example` to `.env.local`, run the SQL migration, configure the Google provider in Supabase, set redirect URLs, `npm run dev`, and how to run tests. Every step must be verified on a clean machine before submission.

## 13. Submission checklist

- [ ] GitHub repository is public (or access granted), with a clear README and `.env.example`
- [ ] No secrets in code or git history (scan run and recorded)
- [ ] Live URL works for an unknown Google account (consent screen published)
- [ ] RLS verified with two accounts
- [ ] All acceptance criteria in Section 5 checked on the live site
- [ ] Works on phone, tablet, and desktop widths
- [ ] Keyboard-only walkthrough completed
- [ ] User documentation covers all six required headings
- [ ] AI usage summary is honest and includes real manual corrections
- [ ] Decision log contains real trade-offs and at least one real bug story
- [ ] A 60-second screen recording or GIF added to the README (optional, memorable)

## 14. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Evaluator cannot sign in (consent screen in testing mode, wrong redirect URL) | High | Publish consent screen; test with a fresh account; document a fallback contact |
| Over-building and missing the "do not expand scope" instruction | Medium | Freeze scope at Section 4; label every addition as a usability fix |
| Blur effects hurt contrast or performance on low-end devices | Medium | Opaque-enough surfaces, fallbacks, limit blurred layers, test on a mid-range phone |
| Secret accidentally committed | Low but severe | `.gitignore`, secret scan, only public-by-design keys in the client, rotate if ever leaked |
| Free-tier cold starts or pausing | Medium | Mention in limitations; visit the live URL shortly before submitting |
| AI-generated code with subtle security holes | Medium | Review every policy and server action by hand; test with a second account |

## 15. Success definition

Clearpane succeeds if a reviewer can open the live link on their phone, sign in with Google on the first try, add a task, move it through all three states, see the dashboard react, and then read documentation that answers every question they would have asked — all without hitting a single rough edge. Then, on reading the repo, they find security and judgment that go beyond what the brief demanded, while the scope stays exactly as small as requested.
