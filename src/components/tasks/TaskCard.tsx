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

  return (
    <article
      aria-busy={isPending}
      className={`relative p-5 sm:p-6 rounded-2xl glass border border-white/10 transition-all flex flex-col gap-4 ${
        isPending ? "opacity-60 pointer-events-none" : "hover:border-white/20"
      }`}
    >
      {/* Top row: StatusBadge + Relative Time + Overflow Menu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} size="sm" />
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
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Task options"
              className="absolute right-0 top-full mt-1.5 w-40 glass-strong border border-white/15 rounded-xl p-1 shadow-2xl z-20 flex flex-col gap-0.5"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs text-slate-200 hover:text-white hover:bg-white/10 rounded-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
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
                className="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs text-red-300 hover:text-red-200 hover:bg-red-500/15 rounded-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
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
          className="text-base font-medium text-slate-100 leading-snug break-words line-clamp-2"
          title={task.title}
        >
          {task.title}
        </h3>
        {task.notes && (
          <p
            className="text-xs text-slate-300 line-clamp-2 leading-relaxed break-words"
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
        className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-white/10 gap-1 mt-1"
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all select-none min-h-[36px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                isSelected
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isSelected
                    ? option.status === "complete"
                      ? "text-emerald-400"
                      : option.status === "in_progress"
                        ? "text-indigo-400"
                        : "text-slate-300"
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

