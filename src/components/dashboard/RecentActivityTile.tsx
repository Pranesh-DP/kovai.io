"use client";

import * as React from "react";
import Link from "next/link";
import { History, Clock, ArrowRight } from "lucide-react";
import { Task } from "@/types/task";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelativeTime, formatFullDateTime } from "@/lib/utils/time";

export interface RecentActivityTileProps {
  recentTasks: Task[];
}

export function RecentActivityTile({ recentTasks }: RecentActivityTileProps) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="glass gold-card-hover border border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-1.5 text-amber-400">
          <History className="h-4 w-4" aria-hidden="true" />
          <h3 className="font-bold text-slate-100 tracking-wide uppercase">Recent Activity</h3>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
        >
          <span>All tasks</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {recentTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 my-2">
          <p className="text-sm text-slate-200 font-semibold mb-1">
            No recent activity
          </p>
          <p className="text-xs text-slate-400">
            Task status changes and updates will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recentTasks.map((task) => {
            const relTime = isMounted
              ? formatRelativeTime(task.status_changed_at)
              : "";
            const fullTime = isMounted
              ? formatFullDateTime(task.status_changed_at)
              : "";

            // Check if task was created and never changed status
            const isCreatedOnly =
              Math.abs(
                new Date(task.status_changed_at).getTime() -
                  new Date(task.created_at).getTime(),
              ) < 1000;

            const timeLabel = isCreatedOnly
              ? `Created ${relTime}`
              : relTime;

            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/50 border border-amber-500/15 hover:border-amber-400/35 transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4
                    className="text-sm font-semibold text-slate-100 truncate break-words"
                    title={task.title}
                  >
                    {task.title}
                  </h4>
                  <div
                    className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5"
                    title={fullTime}
                  >
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{timeLabel || "recently"}</span>
                  </div>
                </div>

                <StatusBadge status={task.status} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

