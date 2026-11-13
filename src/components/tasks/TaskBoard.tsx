"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  Plus,
  ClipboardList,
  FilterX,
  FileQuestion,
  Layers,
  Circle,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { computeStats, filterTasks } from "@/lib/tasks/stats";
import { deleteTask } from "@/lib/tasks/actions";
import { useTaskMutations } from "@/lib/tasks/useTaskMutations";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useTaskDialog } from "./TaskDialogContext";
import { useTabFocusRefresh } from "@/lib/utils/useTabFocusRefresh";

export interface TaskBoardProps {
  initialTasks: Task[];
  onOpenCreateModal?: () => void;
  onOpenEditModal?: (task: Task) => void;
}

type FilterTab = TaskStatus | "all";

export function TaskBoard({
  initialTasks,
  onOpenCreateModal,
  onOpenEditModal,
}: TaskBoardProps) {
  useTabFocusRefresh();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { openCreateTask, openEditTask, registerOnTaskMutated } =
    useTaskDialog();

  const urlStatus = searchParams.get("status");
  const initialFilter: FilterTab =
    urlStatus === "planned" ||
    urlStatus === "in_progress" ||
    urlStatus === "complete"
      ? urlStatus
      : "all";

  // Local state seeded from props, re-syncs if initialTasks change
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [prevInitial, setPrevInitial] = React.useState(initialTasks);
  if (initialTasks !== prevInitial) {
    setPrevInitial(initialTasks);
    setTasks(initialTasks);
  }

  // Active filter tab & search query
  const [activeTab, setActiveTab] = React.useState<FilterTab>(initialFilter);
  const [prevUrlStatus, setPrevUrlStatus] = React.useState(urlStatus);
  if (urlStatus !== prevUrlStatus) {
    setPrevUrlStatus(urlStatus);
    if (
      urlStatus === "planned" ||
      urlStatus === "in_progress" ||
      urlStatus === "complete"
    ) {
      setActiveTab(urlStatus);
    }
  }

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Pagination for large lists (> 200 tasks matching current filter)
  const [displayLimit, setDisplayLimit] = React.useState(100);

  // Reset pagination limit when filter or search changes
  const [prevFilterKey, setPrevFilterKey] = React.useState(`${activeTab}:${debouncedSearch}`);
  const currentFilterKey = `${activeTab}:${debouncedSearch}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setDisplayLimit(100);
  }

  // Shared optimistic status mutations
  const { pendingIds, handleStatusChange } = useTaskMutations(setTasks);

  // Pending delete ref for 6-second undo window
  // Safe failure mode: closing the tab within the 6-second window cancels the delete (task remains on the server).
  const pendingDeleteRef = React.useRef<{
    task: Task;
    timerId: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Listen for task mutations from the global TaskFormDialog
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

  // Debounce search input by 200ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Compute live stats from the complete task list
  const stats = React.useMemo(() => computeStats(tasks), [tasks]);

  // Filter tasks based on activeTab and debounced search
  const visibleTasks = React.useMemo(() => {
    return filterTasks(tasks, activeTab, debouncedSearch);
  }, [tasks, activeTab, debouncedSearch]);

  // If >200 tasks match, slice to displayLimit (starting at 100)
  const displayedTasks = React.useMemo(() => {
    if (visibleTasks.length > 200) {
      return visibleTasks.slice(0, displayLimit);
    }
    return visibleTasks;
  }, [visibleTasks, displayLimit]);

  // Commit any currently pending delete immediately
  const commitPendingDelete = React.useCallback(() => {
    if (pendingDeleteRef.current) {
      const { task, timerId } = pendingDeleteRef.current;
      clearTimeout(timerId);
      pendingDeleteRef.current = null;
      // Fire and forget delete on the server
      deleteTask({ id: task.id }).catch((err) => {
        console.error("Failed to commit pending delete:", err);
      });
    }
  }, []);

  // Ref for recursive retry access without immutability rule violations
  const handleDeleteRef = React.useRef<(task: Task) => void>(() => {});

  // Delete Handler with 6-Second Undo
  const handleDelete = React.useCallback(
    (task: Task) => {
      // If there's an existing pending delete, commit it immediately before starting the next
      commitPendingDelete();

      // Immediately remove from local state
      setTasks((prev) => prev.filter((t) => t.id !== task.id));

      // Start 6-second timer
      const timerId = setTimeout(async () => {
        if (pendingDeleteRef.current?.task.id === task.id) {
          pendingDeleteRef.current = null;
          const res = await deleteTask({ id: task.id });
          if (!res.ok && res.code !== "not_found") {
            // Rollback on delete failure
            setTasks((prev) => {
              const restored = [...prev, task];
              return restored.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              );
            });

            if (res.code === "unauthenticated") {
              showToast({
                message: "Your session has expired. Please sign in again.",
                type: "error",
              });
              const currentPath =
                typeof window !== "undefined"
                  ? window.location.pathname + window.location.search
                  : "/tasks";
              router.push(`/login?next=${encodeURIComponent(currentPath)}`);
              return;
            }

            showToast({
              message: "Failed to delete task.",
              type: "error",
              action: {
                label: "Retry",
                onClick: () => handleDeleteRef.current(task),
              },
            });
          }
        }
      }, 6000);

      pendingDeleteRef.current = { task, timerId };

      // Show toast with Undo button
      showToast({
        message: "Task deleted",
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => {
            if (pendingDeleteRef.current?.task.id === task.id) {
              clearTimeout(pendingDeleteRef.current.timerId);
              pendingDeleteRef.current = null;
              // Restore task in local state maintaining created_at desc order
              setTasks((prev) => {
                const restored = [...prev, task];
                return restored.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                );
              });
              showToast({
                message: "Task restored",
                type: "info",
                duration: 3000,
              });
            }
          },
        },
      });
    },
    [commitPendingDelete, router, showToast],
  );

  React.useEffect(() => {
    handleDeleteRef.current = handleDelete;
  });

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timerId);
        // Note: Closing tab/unmounting cancels deletion without sendBeacon
      }
    };
  }, []);

  const tabList: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "planned", label: "Planned", count: stats.planned },
    { key: "in_progress", label: "In Progress", count: stats.inProgress },
    { key: "complete", label: "Complete", count: stats.complete },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* 4 Status Metric Cards (Reference: TaskPilot UI) */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`p-4 sm:p-5 rounded-2xl glass transition-all text-left flex flex-col justify-between border ${
              activeTab === "all"
                ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30"
                : "border-emerald-500/15 hover:border-emerald-500/30 bg-slate-950/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">Total</span>
              <Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-50">{stats.total}</span>
              <span className="text-[11px] text-slate-400 font-medium">tasks</span>
            </div>
          </button>

          {/* Card 2: Planned */}
          <button
            type="button"
            onClick={() => setActiveTab("planned")}
            className={`p-4 sm:p-5 rounded-2xl glass transition-all text-left flex flex-col justify-between border ${
              activeTab === "planned"
                ? "border-zinc-400/50 bg-zinc-800/40 shadow-md ring-1 ring-zinc-400/30"
                : "border-zinc-800 hover:border-zinc-700 bg-slate-950/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-zinc-400">Planned</span>
              <Circle className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-200">{stats.planned}</span>
              <span className="text-[11px] text-zinc-500 font-medium">queued</span>
            </div>
          </button>

          {/* Card 3: In Progress (Radiant Emerald) */}
          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`p-4 sm:p-5 rounded-2xl glass transition-all text-left flex flex-col justify-between border ${
              activeTab === "in_progress"
                ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50"
                : "border-emerald-500/30 hover:border-emerald-400/50 bg-gradient-to-br from-emerald-500/[0.08] to-slate-950/60 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                In Progress
              </span>
              <CircleDot className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{stats.inProgress}</span>
              <span className="text-[11px] text-emerald-400/80 font-bold uppercase tracking-wider">active</span>
            </div>
          </button>

          {/* Card 4: Completed (Crisp White / Emerald) */}
          <button
            type="button"
            onClick={() => setActiveTab("complete")}
            className={`p-4 sm:p-5 rounded-2xl glass transition-all text-left flex flex-col justify-between border ${
              activeTab === "complete"
                ? "border-white/50 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/30"
                : "border-white/20 hover:border-white/40 bg-slate-950/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-white">
              <span className="font-semibold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.complete}</span>
              <span className="text-[11px] text-emerald-400/80 font-medium">done</span>
            </div>
          </button>
        </div>
      )}

      {/* Top Controls: Filter Tabs + Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Accessible Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="flex items-center p-1 rounded-xl glass border border-emerald-500/20 gap-1 overflow-x-auto scrollbar-none"
        >
          {tabList.map((tab) => {
            const isSelected = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-teal-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm shadow-emerald-500/10"
                    : "text-slate-300 hover:text-emerald-200 hover:bg-emerald-500/[0.08] border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-emerald-400 text-slate-950 shadow-sm"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Debounced Search Input */}
        <div className="relative w-full sm:w-72">
          <label htmlFor="task-search-input" className="sr-only">
            Search tasks by title
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-slate-950/70 border border-emerald-500/20 text-slate-100 placeholder-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus:border-emerald-400/50 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Task List or Specific Empty States */}
      {tasks.length === 0 ? (
        /* Empty State (a): No tasks at all */
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 rounded-3xl glass border border-emerald-500/20 text-center my-6">
          <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 border border-emerald-300/40 flex items-center justify-center text-slate-950 mb-6 shadow-xl shadow-emerald-500/20">
            <ClipboardList className="h-10 w-10 stroke-[2.5]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            No tasks yet
          </h2>
          <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
            Keep your mind clear. Create your first task to start organizing
            your priorities calmly and deliberately.
          </p>
          <Button
            onClick={() => (onOpenCreateModal ? onOpenCreateModal() : openCreateTask())}
            title="Create task"
            className="gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create your first task</span>
          </Button>
        </div>
      ) : visibleTasks.length === 0 && debouncedSearch ? (
        /* Empty State (c): No tasks match search query */
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl glass border border-white/10 text-center my-6">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
            <FileQuestion className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-medium text-slate-200 mb-1">
            No tasks matching &ldquo;{debouncedSearch}&rdquo;
          </h2>
          <p className="text-xs text-slate-300 mb-4">
            Try adjusting your search terms or clearing the filter.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear search</span>
          </Button>
        </div>
      ) : visibleTasks.length === 0 ? (
        /* Empty State (b): Tasks exist, but none match current filter tab */
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl glass border border-white/10 text-center my-6">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
            <FilterX className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-medium text-slate-200 mb-1">
            No {activeTab.replace("_", " ")} tasks
          </h2>
          <p className="text-xs text-slate-300 mb-4">
            You don&apos;t have any tasks in this status right now.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            View all tasks
          </Button>
        </div>
      ) : (
        /* Task Cards Grid / List (newest first) */
        <div className="flex flex-col gap-6">
          <div
            role="region"
            aria-label="Tasks list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isPending={pendingIds.has(task.id)}
                onStatusChange={handleStatusChange}
                onEdit={(t) =>
                  onOpenEditModal ? onOpenEditModal(t) : openEditTask(t)
                }
                onDelete={handleDelete}
              />
            ))}
          </div>

          {visibleTasks.length > 200 && visibleTasks.length > displayLimit && (
            <div className="flex justify-center pt-2 pb-6">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDisplayLimit((prev) => prev + 100)}
                aria-label={`Show 100 more tasks (${visibleTasks.length - displayLimit} remaining)`}
              >
                Show more ({visibleTasks.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
