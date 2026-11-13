import * as React from "react";
import Link from "next/link";
import { Circle, CircleDot, CheckCircle2, ChevronRight } from "lucide-react";

export interface StatusChipsTileProps {
  planned: number;
  inProgress: number;
  complete: number;
}

export function StatusChipsTile({
  planned,
  inProgress,
  complete,
}: StatusChipsTileProps) {
  const chips = [
    {
      label: "Planned",
      count: planned,
      status: "planned",
      href: "/tasks?status=planned",
      icon: Circle,
      color: "text-slate-400 group-hover:text-slate-300",
      badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    },
    {
      label: "In Progress",
      count: inProgress,
      status: "in_progress",
      href: "/tasks?status=in_progress",
      icon: CircleDot,
      color: "text-amber-400 group-hover:text-amber-300",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      label: "Complete",
      count: complete,
      status: "complete",
      href: "/tasks?status=complete",
      icon: CheckCircle2,
      color: "text-emerald-400 group-hover:text-emerald-300",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <div className="glass gold-card-hover border border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="uppercase tracking-wider text-amber-400">By Status</span>
        <Link
          href="/tasks"
          className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
        >
          <span>View all</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <Link
              key={chip.status}
              href={chip.href}
              className="group flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-900/80 border border-amber-500/15 hover:border-amber-400/35 transition-all shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
              aria-label={`${chip.label}: ${chip.count} tasks (click to filter)`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${chip.color}`} aria-hidden="true" />
                <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                  {chip.label}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${chip.badge}`}
              >
                {chip.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

