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
    <div className="glass border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5 text-indigo-400">
          <History className="h-4 w-4" aria-hidden="true" />
          <h3 className="font-semibold text-slate-200">Recent Activity</h3>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 rounded"
        >
          <span>All tasks</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {recentTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 my-2">
          <p className="text-sm text-slate-200 font-medium mb-1">
            No recent activity
          </p>
          <p className="text-xs text-slate-300">
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
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4
                    className="text-sm font-medium text-slate-100 truncate break-words"
                    title={task.title}
                  >
                    {task.title}
                  </h4>
                  <div
                    className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5"
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

