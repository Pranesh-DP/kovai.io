import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.E2E_USER_EMAIL;
const testPassword = process.env.E2E_USER_PASSWORD;

/**
 * Extracts the Supabase project reference id from the URL:
 * e.g. "https://abcdefghijklmnopqrst.supabase.co" -> "abcdefghijklmnopqrst"
 */
function getProjectRef(url?: string): string {
  if (!url) return "default";
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".")[0] || "default";
  } catch {
    return "default";
  }
}

test.describe("Unauthenticated Access Protection", () => {
  test("unauthenticated visit to /dashboard redirects to /login", async ({
    page,
  }) => {
    // Attempt visiting protected /dashboard directly
    await page.goto("/dashboard");

    // Expect redirection to /login with next query parameter
    await expect(page).toHaveURL(/\/login(\?next=.*)?/);

    // Verify login page elements are displayed
    await expect(page.locator("h1")).toHaveText("Clearpane");
    await expect(
      page.getByRole("button", { name: /Continue with Google/i }),
    ).toBeVisible();
  });
});

test.describe("Authenticated Task Management", () => {
  test.skip(
    !testEmail || !testPassword || !supabaseUrl || !supabaseAnonKey,
    "Authenticated suite skipped by default: requires test user credentials in environment. See e2e/README.md.",
  );

  test.beforeEach(async ({ context }) => {

    // Authenticate through Supabase client directly in the test runner
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail!,
      password: testPassword!,
    });

    if (error || !data.session) {
      throw new Error(`Failed to authenticate test user: ${error?.message}`);
    }

    const projectRef = getProjectRef(supabaseUrl);
    const cookieName = `sb-${projectRef}-auth-token`;
    const sessionStr = JSON.stringify(data.session);
    const sessionBase64 = Buffer.from(sessionStr).toString("base64");

    // Inject Supabase session cookie into Playwright browser context
    await context.addCookies([
      {
        name: cookieName,
        value: `base64-${sessionBase64}`,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });

  test("full task lifecycle: create, list, status transitions, dashboard counts, filters, search, delete with undo", async ({
    page,
  }) => {
    const taskTitle = `E2E Task ${Date.now()}`;
    const taskNotes = "Automated test notes for deliberation";

    // 1. Visit /tasks and open create dialog
    await page.goto("/tasks");
    await expect(page).toHaveURL("/tasks");

    // Press 'N' shortcut or click New task button
    const newTaskBtn = page.getByRole("button", { name: /New task/i }).first();
    await newTaskBtn.click();

    // 2. Fill dialog and submit
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.fill("#task-title-input", taskTitle);
    await page.fill("#task-notes-input", taskNotes);

    const createBtn = page.getByRole("button", { name: "Create Task" });
    await createBtn.click();

    // Dialog closes and toast appears
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Task created")).toBeVisible();

    // 3. See task in the list
    const taskCard = page.locator("article").filter({ hasText: taskTitle });
    await expect(taskCard).toBeVisible();
    await expect(taskCard.getByText(taskNotes)).toBeVisible();

    // 4. Change status to "In Progress"
    const inProgressRadio = taskCard.getByRole("radio", {
      name: /In Progress/i,
    });
    await inProgressRadio.click();
    await expect(inProgressRadio).toHaveAttribute("aria-checked", "true");

    // 5. Change status to "Complete"
    const completeRadio = taskCard.getByRole("radio", { name: /Complete/i });
    await completeRadio.click();
    await expect(completeRadio).toHaveAttribute("aria-checked", "true");

    // 6. Confirm dashboard metrics reflect the completion
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(/tasks? complete/i)).toBeVisible();

    // 7. Return to /tasks and filter by status
    await page.goto("/tasks");
    const completeTab = page.getByRole("tab", { name: /Complete/i });
    await completeTab.click();
    await expect(taskCard).toBeVisible();

    const plannedTab = page.getByRole("tab", { name: /Planned/i });
    await plannedTab.click();
    await expect(taskCard).not.toBeVisible();

    // 8. Search by title
    const allTab = page.getByRole("tab", { name: /All/i });
    await allTab.click();
    const searchInput = page.getByPlaceholder("Search tasks…");
    await searchInput.fill(taskTitle);
    await expect(taskCard).toBeVisible();

    // 9. Delete task and click Undo
    const menuBtn = taskCard.getByLabel(`Options for task: ${taskTitle}`);
    await menuBtn.click();
    const deleteMenuItem = page.getByRole("menuitem", { name: /Delete/i });
    await deleteMenuItem.click();

    // Task disappears optimistically and Undo toast appears
    await expect(taskCard).not.toBeVisible();
    const undoBtn = page.getByRole("button", { name: "Undo" });
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();

    // Task is restored!
    await expect(taskCard).toBeVisible();

    // 10. Delete permanently (wait out the 6-second undo window)
    const menuBtnAgain = taskCard.getByLabel(`Options for task: ${taskTitle}`);
    await menuBtnAgain.click();
    await page.getByRole("menuitem", { name: /Delete/i }).click();

    await expect(taskCard).not.toBeVisible();
    // Wait for the 6-second timer to finalize deletion on the server
    await page.waitForTimeout(6500);

    // Refresh page to confirm it is permanently deleted from server state
    await page.reload();
    await expect(
      page.locator("article").filter({ hasText: taskTitle }),
    ).not.toBeVisible();
  });
});

