import { Task, TaskStatus } from "@/types/task";

export interface TaskStats {
  total: number;
  planned: number;
  inProgress: number;
  complete: number;
  completionPercent: number;
}

/**
 * Computes aggregate counts and completion percentage for a list of tasks.
 */
export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      planned: 0,
      inProgress: 0,
      complete: 0,
      completionPercent: 0,
    };
  }

  let planned = 0;
  let inProgress = 0;
  let complete = 0;

  for (const task of tasks) {
    if (task.status === "planned") planned++;
    else if (task.status === "in_progress") inProgress++;
    else if (task.status === "complete") complete++;
  }

  const completionPercent = Math.round((complete / total) * 100);

  return {
    total,
    planned,
    inProgress,
    complete,
    completionPercent,
  };
}

/**
 * Returns tasks sorted by status_changed_at descending, optionally limited.
 */
export function getRecentActivity(tasks: Task[], limit?: number): Task[] {
  const sorted = [...tasks].sort(
    (a, b) =>
      new Date(b.status_changed_at).getTime() -
      new Date(a.status_changed_at).getTime(),
  );

  return limit !== undefined ? sorted.slice(0, limit) : sorted;
}

/**
 * Filters tasks by status tab and case-insensitive title search.
 * Ignores surrounding whitespace in the search string.
 */
export function filterTasks(
  tasks: Task[],
  status: TaskStatus | "all",
  search = "",
): Task[] {
  const term = search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesStatus = status === "all" || task.status === status;
    const matchesSearch =
      term === "" || task.title.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });
}

