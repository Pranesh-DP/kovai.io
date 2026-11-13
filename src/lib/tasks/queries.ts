import { createClient } from "@/lib/supabase/server";
import { Task } from "@/types/task";

export class AuthError extends Error {
  constructor(message = "Unauthenticated") {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Server-only query to fetch the current user's tasks.
 * Row-level security guarantees users can only access their own tasks.
 */
export async function listTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("Your session has expired. Please sign in again.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, user_id, title, notes, status, status_changed_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to list tasks from Supabase:", error);
    throw new Error("Failed to load tasks");
  }

  return (data ?? []) as Task[];
}

