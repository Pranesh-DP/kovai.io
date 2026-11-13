"use client";

import * as React from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Circle,
  CircleDot,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Task, TaskStatus } from "@/types/task";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelativeTime, formatFullDateTime } from "@/lib/utils/time";

export interface TaskCardProps {
  task: Task;
  isPending?: boolean;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const STATUS_OPTIONS: {
  status: TaskStatus;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}[] = [
  { status: "planned", label: "Planned", icon: Circle },
  { status: "in_progress", label: "In Progress", icon: CircleDot },
  { status: "complete", label: "Complete", icon: CheckCircle2 },
];

export function TaskCard({
  task,
  isPending = false,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const radioGroupRef = React.useRef<HTMLDivElement>(null);

  // Client-rendered relative time to avoid hydration mismatch
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const relativeTime = isMounted ? formatRelativeTime(task.created_at) : "";
  const fullDateTime = isMounted ? formatFullDateTime(task.created_at) : "";

  // Close overflow menu on outside click or Escape
  React.useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Arrow key navigation for the segmented control radiogroup
  function handleRadioKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (isPending) return;

    let targetIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex =
        (currentIndex - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length;
    }

    if (targetIndex !== -1) {
      const nextOption = STATUS_OPTIONS[targetIndex];
      onStatusChange(task, nextOption.status);
      const buttons = radioGroupRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="radio"]',
      );
      buttons?.[targetIndex]?.focus();
    }
  }

  const isComplete = task.status === "complete";
  const isInProgress = task.status === "in_progress";

  const cardStatusStyle = isInProgress
    ? "border-l-4 border-l-emerald-400 border-emerald-500/35 bg-gradient-to-r from-emerald-500/[0.12] via-slate-950/70 to-slate-950/70 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
    : isComplete
      ? "border-l-4 border-l-white/60 border-emerald-500/20 bg-gradient-to-r from-white/[0.04] via-slate-950/60 to-slate-950/60 opacity-90"
      : "border-l-4 border-l-zinc-700 border-emerald-500/15 bg-slate-950/60";

  return (
    <article
      aria-busy={isPending}
      className={`relative p-5 sm:p-6 rounded-2xl glass emerald-card-hover ${cardStatusStyle} transition-all flex flex-col gap-4 ${
        isPending ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Top row: StatusBadge + Badges + Relative Time + Overflow Menu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <StatusBadge status={task.status} size="sm" />
          {isInProgress && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              ⚡ IN FOCUS
            </span>
          )}
          {isComplete && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-full uppercase">
              ✓ DONE
            </span>
          )}
          <div
            className="flex items-center gap-1 text-xs text-slate-400"
            title={fullDateTime}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{relativeTime || "loading..."}</span>
          </div>
        </div>

        {/* Overflow Menu */}
        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            disabled={isPending}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={`Options for task: ${task.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Task options"
              className="absolute right-0 top-full mt-1.5 w-40 glass-strong border border-emerald-500/25 rounded-xl p-1 shadow-2xl z-20 flex flex-col gap-0.5"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs text-slate-200 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs text-red-300 hover:text-red-200 hover:bg-red-500/15 rounded-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Title & Notes preview */}
      <div className="flex flex-col gap-1.5">
        <h3
          className={`text-base leading-snug break-words line-clamp-2 transition-colors ${
            isComplete
              ? "line-through text-slate-400 decoration-emerald-500/50"
              : isInProgress
                ? "font-bold text-emerald-300"
                : "font-semibold text-slate-100 group-hover:text-emerald-200/90"
          }`}
          title={task.title}
        >
          {task.title}
        </h3>
        {task.notes && (
          <p
            className={`text-xs line-clamp-2 leading-relaxed break-words ${
              isComplete ? "text-slate-500 line-through" : "text-slate-300"
            }`}
            title={task.notes}
          >
            {task.notes}
          </p>
        )}
      </div>

      {/* Bottom: 3-option Segmented Control */}
      <div
        ref={radioGroupRef}
        role="radiogroup"
        aria-label={`Change status for ${task.title}`}
        className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-emerald-500/15 gap-1 mt-1 shadow-inner"
      >
        {STATUS_OPTIONS.map((option, idx) => {
          const isSelected = task.status === option.status;
          const Icon = option.icon;

          return (
            <button
              key={option.status}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isPending}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                if (!isSelected && !isPending) {
                  onStatusChange(task, option.status);
                }
              }}
              onKeyDown={(e) => handleRadioKeyDown(e, idx)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all select-none min-h-[36px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                isSelected
                  ? option.status === "in_progress"
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm"
                    : option.status === "complete"
                      ? "bg-white/15 text-white border border-white/30 shadow-sm"
                      : "bg-white/10 text-white shadow-sm border border-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isSelected
                    ? option.status === "complete"
                      ? "text-white"
                      : option.status === "in_progress"
                        ? "text-emerald-400"
                        : "text-slate-200"
                    : "text-slate-500"
                }`}
                aria-hidden="true"
              />
              <span className="hidden xs:inline">{option.label}</span>
              <span className="xs:hidden">
                {option.status === "in_progress" ? "Progress" : option.label}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

