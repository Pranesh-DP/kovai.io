# Clearpane

Clearpane is a calm, minimal, full-stack personal task manager designed for deliberate productivity. Built with Next.js 16 and Supabase, it gives individuals a distraction-free space to capture ideas, transition statuses effortlessly, and reflect on their focus through a responsive bento-grid dashboard with real-time metrics and strict data privacy.

**Live Application**: [LIVE_URL]

![Clearpane Preview]([SCREENSHOT])

---

## Tech Stack

- **Framework**: Next.js 16.4 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, custom glassmorphism design tokens
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security, Google OAuth with PKCE)
- **Validation**: Zod (strict client and server action validation)
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Quality Gates**: TypeScript strict mode, ESLint, Prettier

---

## Features

- **Google Authentication**: Frictionless, secure sign-in via Supabase OAuth with zero server passwords or stored credentials.
- **Calm Bento Dashboard**: Live completion ring, quick-add input with greeting, status distribution chips, progress breakdown bar, and recent activity timeline.
- **Organized Task Board**: Fast filter tabs (All, Planned, In Progress, Complete), debounced search by title, and responsive card grid.
- **Optimistic Interactions**: Instant status toggling via 3-way segmented controls, with automatic rollback and retry toasts on network disruption.
- **Safety First**: 6-second undo window on task deletion, draft recovery on session expiry, and complete XSS protection with zero `dangerouslySetInnerHTML`.
- **Keyboard & Accessibility Focused**: Global `N` shortcut to create tasks, skip-to-content navigation, ARIA live regions for toasts, and full compliance with reduced motion and high-contrast standards.
- **Strict Data Isolation**: Enforced at the PostgreSQL engine level via Row-Level Security (RLS) policies.

---

## Documentation

Comprehensive project documentation is available in the [`docs/`](./docs) folder:

- [**User Guide**](./docs/USER_GUIDE.md): Complete instructions on using, navigating, and configuring Clearpane.
- [**Architectural Decisions**](./docs/DECISIONS.md): Architectural decisions log, trade-offs, and bug fixes.
- [**Security Model & Audit**](./docs/SECURITY.md): Threat model, data isolation, and adversarial audit report.
- [**Deployment Guide**](./docs/DEPLOY.md): Step-by-step production setup on Vercel and Supabase.
- [**AI Usage Log**](./docs/AI_USAGE.md): Detailed disclosure of AI tooling, prompts, and manual corrections.
- [**Submission Checklist**](./docs/SUBMISSION.md): Assessment requirements and verification status.

---

## Run Locally

### 1. Prerequisites
- Node.js 20+ and npm
- A free Supabase project (or local Supabase CLI)
- A Google Cloud OAuth 2.0 Web Client

### 2. Installation
```bash
git clone https://github.com/Pranesh-DP/kovai.io.git
cd kovai.io
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup
In your Supabase project's SQL Editor, execute the schema migration from [`supabase/migrations/0001_tasks.sql`](./supabase/migrations/0001_tasks.sql).

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Test Suite
```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Unit & Component Tests (Vitest)
npm run test

# End-to-End Tests (Playwright)
npm run test:e2e
```
