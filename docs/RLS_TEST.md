# RLS Manual Test Script

This script verifies that Row Level Security is working correctly: each user can
only see and mutate their own tasks.

## Prerequisites

- The `0001_tasks.sql` migration has been run.
- You have **two** separate Google accounts to sign in with (call them **Account A** and **Account B**).
- The app is running (locally or deployed).

---

## Part 1 — Account A creates a task

1. Open the app in a browser tab (private/incognito recommended).
2. Sign in with **Account A** via Google.
3. Create a new task — give it a distinctive title, e.g. `"Account A secret task"`.
4. Note the task's **ID** from the URL or browser DevTools Network tab
   (look for the `id` field in the Supabase response). Save it as `TASK_A_ID`.
5. Confirm the task appears in Account A's task list.

---

## Part 2 — Account B cannot see Account A's task

1. Open a **second** browser tab (or a different browser / private window).
2. Sign in with **Account B** via Google.
3. Confirm Account B's task list is **empty** (or contains only B's own tasks).
4. Account A's task (`"Account A secret task"`) must **not** appear.

---

## Part 3 — Programmatic RLS verification from the browser console

Still signed in as **Account B**, open DevTools (F12) on the app page and run
each of the following snippets in the **Console** tab.

> Replace `TASK_A_ID` with the UUID you noted in Part 1.

### 3a — Attempt SELECT by explicit ID

```js
const { createClient } = await import(
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"
);
// Use the anon key from your .env.example / deployed env
const sb = createClient(
  document.querySelector("meta[name=supabase-url]")?.content ??
    prompt("Paste NEXT_PUBLIC_SUPABASE_URL"),
  document.querySelector("meta[name=supabase-anon-key]")?.content ??
    prompt("Paste NEXT_PUBLIC_SUPABASE_ANON_KEY")
);
// Sign in as B first so the client carries B's JWT
// (If the app already set a session cookie you can skip the signIn call and
//  use the existing session by calling sb.auth.getSession() instead.)
const { data, error } = await sb
  .from("tasks")
  .select("*")
  .eq("id", "TASK_A_ID"); // <- replace
console.log("rows returned:", data?.length ?? 0, error);
// EXPECTED: rows returned: 0,  error: null
// RLS silently filters the row; it does NOT throw a permission error.
```

### 3b — Attempt UPDATE on Account A's task

```js
const { data, error } = await sb
  .from("tasks")
  .update({ title: "HACKED" })
  .eq("id", "TASK_A_ID"); // <- replace
console.log("rows affected:", data?.length ?? 0, error);
// EXPECTED: rows affected: 0,  error: null
```

### 3c — Attempt DELETE on Account A's task

```js
const { data, error } = await sb
  .from("tasks")
  .delete()
  .eq("id", "TASK_A_ID"); // <- replace
console.log("rows affected:", data?.length ?? 0, error);
// EXPECTED: rows affected: 0,  error: null
```

---

## Expected results

| Test | Expected outcome |
|---|---|
| Part 2 — UI task list as B | Account A's task is **not visible** |
| 3a SELECT by id | `data.length === 0`, no error |
| 3b UPDATE by id | `data.length === 0`, no error |
| 3c DELETE by id | `data.length === 0`, no error |

> **Why no error?** Postgres RLS filters silently — it treats invisible rows as
> non-existent. A `0 rows affected` result is the correct, secure behaviour.

---

## Final confirmation

Switch back to **Account A** and reload. Confirm the task still exists and was
not modified — proving Account B's attempts had no effect.

