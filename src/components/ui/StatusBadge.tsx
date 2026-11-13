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
      className: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    },
    in_progress: {
      icon: CircleDot,
      className: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-semibold",
    },
    complete: {
      icon: CheckCircle2,
      className: "bg-white/10 text-white border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-semibold",
    },
  };

  const current = configs[status];
  const Icon = current.icon;
  const label = STATUS_LABELS[status];

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2.5 py-0.5 gap-1.5"
      : "text-xs font-semibold px-3 py-1 gap-1.5";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.className} ${sizeClasses} ${className}`}
    >
      {status === "in_progress" && (
        <span className="relative flex h-1.5 w-1.5 mr-0.5 shrink-0" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
        </span>
      )}
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

