"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Task, TaskStatus } from "@/types/task";
import { updateTaskStatus } from "@/lib/tasks/actions";
import { useToast } from "@/components/ui/Toast";

export function useTaskMutations(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    if (task.status === newStatus) return;

    const previousStatus = task.status;
    const nowIso = new Date().toISOString();

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: newStatus, status_changed_at: nowIso }
          : t,
      ),
    );

    setPendingIds((prev) => new Set(prev).add(task.id));

    try {
      const res = await updateTaskStatus({ id: task.id, status: newStatus });

      if (!res.ok) {
        // Rollback to previous status
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: previousStatus } : t,
          ),
        );

        if (res.code === "unauthenticated") {
          showToast({
            message: "Your session has expired. Please sign in again.",
            type: "error",
          });
          const currentPath =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/dashboard";
          router.push(`/login?next=${encodeURIComponent(currentPath)}`);
          return;
        }

        if (res.code === "not_found") {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          showToast({
            message: "This task no longer exists.",
            type: "error",
          });
          return;
        }

        showToast({
          message: res.message || "Failed to update task status.",
          type: "error",
          action: {
            label: "Retry",
            onClick: () => handleStatusChange(task, newStatus),
          },
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: previousStatus } : t,
        ),
      );
      showToast({
        message: "Network error updating task status.",
        type: "error",
        action: {
          label: "Retry",
          onClick: () => handleStatusChange(task, newStatus),
        },
      });
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  return {
    pendingIds,
    handleStatusChange,
  };
}

