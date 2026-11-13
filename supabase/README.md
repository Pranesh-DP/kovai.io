# Supabase Migrations

## Running the migrations

Clearpane uses plain SQL migrations committed to this repo. There is no Supabase CLI requirement for the assessment; run them manually via the Supabase Dashboard.

### 0001_tasks.sql

**What it does:**

- Creates the `task_status` enum (`planned`, `in_progress`, `complete`).
- Creates the `tasks` table with all columns, constraints, and indexes.
- Installs the `touch_task` trigger that keeps `updated_at` current and sets `status_changed_at` whenever the status column changes.
- Enables Row Level Security (RLS) and adds four policies so each user can only read and mutate their own rows. The database assigns `user_id` from `auth.uid()` automatically — the client never supplies it.

**Steps to run:**

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Open `supabase/migrations/0001_tasks.sql` from this repo, copy the entire contents, and paste them into the editor.
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter).
6. Confirm you see `Success. No rows returned` for each statement (the editor runs the whole script).

**Verify the migration:**

After running, go to **Table Editor** → `tasks` and confirm:

- The table exists with all columns visible.
- **RLS** shows as **enabled** (the shield icon is active).
- Under **Authentication → Policies**, four policies are listed for the `tasks` table.

> **Note:** Never paste your Supabase service-role key into this project or commit it. The anon key (safe to expose) is all the app ever uses; RLS enforces data isolation.

