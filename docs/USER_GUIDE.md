# Clearpane User Guide

Welcome to Clearpane, a minimal, calm task management application designed for focused personal productivity. This guide walks you through using the application, understanding its design assumptions, and running the project locally.

---

## 1. How to access and use the application

### Quick Start
1. **Accessing the App**: Visit [LIVE_URL] in any modern web browser (desktop, tablet, or mobile).
2. **Dashboard Overview**: Upon signing in, you land on `/dashboard`, displaying your personalized bento grid:
   - **Greeting & Quick Add**: Greets you according to your local time of day. Type what needs doing into the input and press `Enter` to launch the creation modal pre-filled with your idea.
   - **Completion Ring**: An interactive circular gauge displaying the percentage and count of completed tasks.
   - **Status Distribution**: Quick-access chips showing counts for Planned, In Progress, and Complete tasks. Clicking any chip navigates to `/tasks` with that filter pre-selected.
   - **Progress Breakdown**: A stacked distribution bar comparing all statuses.
   - **In Focus Now**: Highlights active tasks currently in progress, allowing one-click completion.
   - **Recent Activity**: Displays recent task updates and status changes with humanized relative timestamps.
3. **Creating a Task**:
   - Click the **New task** button in the header or sidebar, or press the **`N`** key anywhere in the application.
   - Enter a **Title** (required, 1–120 characters).
   - Enter **Notes** (optional, up to 1,000 characters).
   - In create mode, pick an initial status (defaults to *Planned*).
   - Click **Create Task** or press `Enter` in the title field.
4. **Changing Status**:
   - On any task card, click the 3-option segmented control (*Planned*, *In Progress*, or *Complete*).
   - Status updates are optimistic: the interface reflects the change instantly without waiting for a server round-trip.
   - Keyboard users can cycle statuses using the arrow keys (`Left`, `Right`, `Up`, `Down`) within the segmented control.
5. **Filtering Tasks**:
   - At the top of `/tasks`, switch between filter tabs: **All**, **Planned**, **In Progress**, and **Complete**.
   - Each tab displays a live counter of matching tasks.
6. **Searching Tasks**:
   - Use the search bar on `/tasks` to filter by title. Search queries are debounced (200ms) for responsiveness and include a one-click clear button.
7. **Editing a Task**:
   - Click the three-dots menu (`...`) on any task card and choose **Edit**.
   - Update the title or notes, and save.
8. **Deleting and Undoing**:
   - Click the three-dots menu on a task card and choose **Delete**.
   - The card disappears immediately, and a toast notification with an **Undo** button appears for 6 seconds.
   - Clicking **Undo** restores the task immediately. If the 6-second window expires without action, the deletion is permanently committed.

---

## 2. Login instructions

### Sign-In Steps
1. Navigate to [LIVE_URL]/login.
2. Click the **Continue with Google** button.
3. Select your Google account on Google's secure authorization screen.
4. Review the requested permissions:
   - **Email address**: Used strictly as your unique account identifier.
   - **Basic profile info (Name and Avatar URL)**: Used only to personalize your greeting and display your avatar in the sidebar.
   - Clearpane **never** requests access to your Google Drive, Gmail, Contacts, Calendar, or any other Google service.

### Handling the "Google hasn't verified this app" Screen
Because Clearpane is an educational and assessment project, the Google OAuth client may be in "Testing" mode or pending verification:
- If presented with a "Google hasn't verified this app" or "App is unverified" warning:
  1. Click **Advanced** (usually located in the bottom-left of the warning dialog).
  2. Click **Go to Clearpane (unsafe)** to proceed to the application.
  3. If your account is not on the test user whitelist, ask the evaluator/administrator to add your email under Google Cloud Console $\rightarrow$ OAuth consent screen $\rightarrow$ Test users.

### Troubleshooting Sign-In Failures
- **Redirect loop or error message**: If sign-in fails or is cancelled, you will be redirected to `/login?error=auth_failed` with a friendly error banner. Simply click **Continue with Google** again.
- **Third-Party Cookies / Ad-Blockers**: Ensure your browser allows redirect cookies from your Supabase domain, or temporarily disable strict tracker blockers that intercept OAuth code exchanges.

---

## 3. Important assumptions made

- **Account Isolation**: Tasks are strictly private to your Google account. Users cannot view, modify, or search another user's tasks.
- **Fields and Boundaries**:
  - Task Title: Required, trimmed of leading/trailing whitespace, between 1 and 120 characters. Whitespace-only titles are rejected.
  - Notes: Optional text up to 1,000 characters. Empty or whitespace-only notes are automatically cleaned and stored as `null`.
- **Default Status**: New tasks default to **Planned** unless explicitly toggled during creation.
- **Any-to-Any Status Transitions**: Users are trusted to organize work freely. Tasks can transition directly between any status (e.g. *Planned* directly to *Complete*, or *Complete* back to *In Progress*).
- **Sort Order**: Task lists and boards display newest tasks first, sorted by `created_at` in descending order.
- **Edit and Delete as Added Features**: While core requirements focused on creation and status progression, editing and deletion with undo were included to provide a realistic, production-ready user experience.
- **Local Time Display**: All creation and status timestamps are rendered in your browser's local time zone, preventing server-time confusion or hydration mismatches.
- **Language**: The application interface and validation messages are presented in English.

---

## 4. Known limitations

- **No Team Sharing or Collaboration**: Clearpane is designed as a focused single-user workspace. There are no multi-user workspaces, assignment features, or shared lists.
- **No Due Dates or Notifications**: The application focuses on deliberate prioritization without deadline anxiety; due dates, reminders, and calendar integrations are intentionally excluded.
- **No In-App Account Deletion**: Users cannot self-delete their Google OAuth identity record from within the UI (administrative deletion is handled directly in Supabase Auth).
- **Concurrent Editing (Last Write Wins)**: If the same account has Clearpane open across multiple tabs or devices, updates apply on a "last write wins" basis. Tab switching triggers an automatic background data refresh (throttled to once per 10s).
- **Tab Closure During Undo Window**: The 6-second undo delete relies on client-side state. Closing or terminating the browser tab before the 6-second timer expires cancels the pending deletion, ensuring data is never accidentally lost.
- **Free-Tier Hosting Inactivity**: The live deployment uses Supabase and Vercel free tiers. After extended inactivity, initial database requests may experience a brief cold-start latency.
- **1,000 Task Display Cap**: For peak rendering performance and smooth scrolling, the query limits retrieval to the 1,000 most recent tasks.

---

## 5. Important notes or warnings for users

- **Account Switching**: Signing in with a different Google account presents a completely distinct, empty task board. Your data belongs exclusively to the specific Google account used during creation.
- **Permanent Deletion**: Once the 6-second undo toast disappears, deleted tasks are permanently removed from the database and cannot be recovered.
- **Do Not Store Sensitive Information**: Clearpane is built for day-to-day task titles and organizational notes. Do not store passwords, credit card numbers, confidential credentials, or sensitive personally identifiable information (PII) in task notes.
- **Assessment Build**: Clearpane is an evaluation project demonstrating full-stack engineering, performance, security, and accessibility standards.

---

## 6. Setup instructions

Follow these instructions to run the complete Clearpane stack on your local machine:

### Prerequisites
- [Node.js](https://nodejs.org/) version 20 or higher.
- `git` installed on your machine.
- A free [Supabase](https://supabase.com) account.
- A [Google Cloud Console](https://console.cloud.google.com) project for OAuth.

### Step 1: Clone and Install
```bash
git clone https://github.com/Pranesh-DP/kovai.io.git
cd kovai.io
npm install
```

### Step 2: Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. In your Supabase dashboard, open the **SQL Editor** $\rightarrow$ **New Query**.
3. Copy the contents of [`supabase/migrations/0001_tasks.sql`](../supabase/migrations/0001_tasks.sql) from the repository, paste it into the editor, and click **Run**.
4. Confirm that the `public.tasks` table, indexes, trigger, and Row-Level Security policies are created.

### Step 3: Google OAuth Configuration
1. In Google Cloud Console, create an OAuth 2.0 Web Client ID.
2. Set **Authorised JavaScript origins** to `http://localhost:3000`.
3. Set **Authorised redirect URIs** to:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the Client ID and Client Secret.
5. In Supabase, go to **Authentication $\rightarrow$ Providers $\rightarrow$ Google**:
   - Enable the provider.
   - Paste the Client ID and Client Secret, then click **Save**.
6. In Supabase, go to **Authentication $\rightarrow$ URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`.
   - Add `http://localhost:3000/**` to **Redirect URLs**.

### Step 4: Environment Variables
Create a file named `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-or-publishable-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Verify Test Suite
```bash
# Typecheck
npm run typecheck

# Linting
npm run lint

# Unit & Component Tests (55 tests)
npm run test

# End-to-End Tests
npm run test:e2e
```

