import * as React from "react";
import { Circle, CircleDot, CheckCircle2 } from "lucide-react";
import { TaskStatus, STATUS_LABELS } from "@/types/task";

export interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const configs: Record<
    TaskStatus,
    {
      icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
      className: string;
    }
  > = {
    planned: {
      icon: Circle,
      className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    },
    in_progress: {
      icon: CircleDot,
      className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    },
    complete: {
      icon: CheckCircle2,
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
  };

  const current = configs[status];
  const Icon = current.icon;
  const label = STATUS_LABELS[status];

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5 gap-1.5"
      : "text-xs font-medium px-2.5 py-1 gap-1.5";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.className} ${sizeClasses} ${className}`}
    >
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

