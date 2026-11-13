"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  deleteTaskSchema,
} from "@/lib/validation/task";
import { Task } from "@/types/task";

export type ActionErrorCode =
  | "unauthenticated"
  | "validation"
  | "not_found"
  | "unknown";

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: ActionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function revalidateTaskPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}

export async function createTask(input: unknown): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: "Please check the form inputs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, notes, status, clientId } = parsed.data;

  // Insert payload: user_id is deliberately omitted so Postgres defaults to auth.uid()
  const payload: {
    title: string;
    notes: string | null;
    status: "planned" | "in_progress" | "complete";
    id?: string;
  } = {
    title,
    notes,
    status,
  };

  if (clientId) {
    payload.id = clientId;
  }

  const { data, error } = await supabase.from("tasks").insert(payload).select();

  if (error) {
    // If idempotent retry with same clientId resulted in a unique violation, return existing
    if (clientId && (error.code === "23505" || error.message.includes("duplicate key"))) {
      const { data: existing } = await supabase
        .from("tasks")
        .select()
        .eq("id", clientId)
        .single();

      if (existing) {
        return { ok: true, data: existing as Task };
      }
    }

    console.error("Error creating task in Supabase:", error);
    return {
      ok: false,
      code: "unknown",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      code: "unknown",
      message: "Failed to create task. Please try again.",
    };
  }

  revalidateTaskPaths();
  return { ok: true, data: data[0] as Task };
}

export async function updateTask(input: unknown): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: "Please check the form inputs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, title, notes } = parsed.data;

  const { data, error } = await supabase
    .from("tasks")
    .update({ title, notes })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating task in Supabase:", error);
    return {
      ok: false,
      code: "unknown",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      code: "not_found",
      message: "This task no longer exists.",
    };
  }

  revalidateTaskPaths();
  return { ok: true, data: data[0] as Task };
}

export async function updateTaskStatus(
  input: unknown,
): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: "Please check the form inputs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, status } = parsed.data;

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating task status in Supabase:", error);
    return {
      ok: false,
      code: "unknown",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      code: "not_found",
      message: "This task no longer exists.",
    };
  }

  revalidateTaskPaths();
  return { ok: true, data: data[0] as Task };
}

export async function deleteTask(input: unknown): Promise<ActionResult<Task>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: "unauthenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const parsed = deleteTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: "Invalid task ID.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id } = parsed.data;

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error deleting task in Supabase:", error);
    return {
      ok: false,
      code: "unknown",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      code: "not_found",
      message: "This task no longer exists.",
    };
  }

  revalidateTaskPaths();
  return { ok: true, data: data[0] as Task };
}

