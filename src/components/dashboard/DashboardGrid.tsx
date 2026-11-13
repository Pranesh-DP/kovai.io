"use client";

import * as React from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Task } from "@/types/task";
import { computeStats, getRecentActivity } from "@/lib/tasks/stats";
import { useTaskMutations } from "@/lib/tasks/useTaskMutations";
import { useTaskDialog } from "@/components/tasks/TaskDialogContext";
import { GreetingTile } from "./GreetingTile";
import { CompletionRingTile } from "./CompletionRingTile";
import { StatusChipsTile } from "./StatusChipsTile";
import { ProgressBarTile } from "./ProgressBarTile";
import { InFocusTile } from "./InFocusTile";
import { RecentActivityTile } from "./RecentActivityTile";
import { Button } from "@/components/ui/Button";
import { useTabFocusRefresh } from "@/lib/utils/useTabFocusRefresh";

export interface DashboardGridProps {
  initialTasks: Task[];
  userName: string;
}

export function DashboardGrid({ initialTasks, userName }: DashboardGridProps) {
  useTabFocusRefresh();
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [prevInitial, setPrevInitial] = React.useState(initialTasks);

  if (initialTasks !== prevInitial) {
    setPrevInitial(initialTasks);
    setTasks(initialTasks);
  }

  const { openCreateTask, registerOnTaskMutated } = useTaskDialog();
  const { pendingIds, handleStatusChange } = useTaskMutations(setTasks);

  // Subscribe to mutations from the global TaskFormDialog
  React.useEffect(() => {
    return registerOnTaskMutated((mutatedTask, mode) => {
      if (mode === "create") {
        setTasks((prev) => [
          mutatedTask,
          ...prev.filter((t) => t.id !== mutatedTask.id),
        ]);
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === mutatedTask.id ? mutatedTask : t)),
        );
      }
    });
  }, [registerOnTaskMutated]);

  // Compute live stats and activities
  const stats = React.useMemo(() => computeStats(tasks), [tasks]);
  const recentTasks = React.useMemo(() => getRecentActivity(tasks, 5), [tasks]);

  const inProgressTasks = React.useMemo(() => {
    return tasks
      .filter((t) => t.status === "in_progress")
      .sort(
        (a, b) =>
          new Date(b.status_changed_at).getTime() -
          new Date(a.status_changed_at).getTime(),
      )
      .slice(0, 3);
  }, [tasks]);

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* Zero-task friendly welcome hero banner */}
      {tasks.length === 0 && (
        <div className="p-8 sm:p-12 rounded-3xl glass border border-indigo-500/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner shadow-indigo-500/20">
              <ClipboardList className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">
                Welcome to Clearpane
              </h3>
              <p className="text-sm text-slate-400 max-w-md mt-1 leading-relaxed">
                Your workspace is empty and clear. Create your first task to
                start organizing your priorities calmly and deliberately.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => openCreateTask()}
            className="gap-2 shrink-0 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create your first task</span>
          </Button>
        </div>
      )}

      {/* 12-column Bento Grid (≥1024px: 12 cols, 640–1023px: 6 cols, <640px: 1 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-5 w-full">
        {/* Tile 1: Greeting + Quick Add (lg: span 8, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-8 flex flex-col">
          <GreetingTile
            userName={userName}
            onQuickAdd={(title) => openCreateTask(title)}
          />
        </div>

        {/* Tile 2: Completion Ring (lg: span 4, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col">
          <CompletionRingTile
            completed={stats.complete}
            total={stats.total}
            percent={stats.completionPercent}
          />
        </div>

        {/* Tile 3: Status Chips (lg: span 4, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col">
          <StatusChipsTile
            planned={stats.planned}
            inProgress={stats.inProgress}
            complete={stats.complete}
          />
        </div>

        {/* Tile 4: Stacked Progress Bar (lg: span 8, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-8 flex flex-col">
          <ProgressBarTile
            total={stats.total}
            planned={stats.planned}
            inProgress={stats.inProgress}
            complete={stats.complete}
          />
        </div>

        {/* Tile 5: In Focus Now (lg: span 6, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-6 flex flex-col">
          <InFocusTile
            inProgressTasks={inProgressTasks}
            pendingIds={pendingIds}
            onMarkComplete={(task) => handleStatusChange(task, "complete")}
          />
        </div>

        {/* Tile 6: Recent Activity (lg: span 6, sm: span 6) */}
        <div className="col-span-1 sm:col-span-6 lg:col-span-6 flex flex-col">
          <RecentActivityTile recentTasks={recentTasks} />
        </div>
      </div>
    </div>
  );
}

