export type TaskStatus = "planned" | "in_progress" | "complete";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  status_changed_at: string; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  complete: "Complete",
};

