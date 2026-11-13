"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Flame, ArrowRight } from "lucide-react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/Button";

export interface InFocusTileProps {
  inProgressTasks: Task[];
  pendingIds: Set<string>;
  onMarkComplete: (task: Task) => void;
}

export function InFocusTile({
  inProgressTasks,
  pendingIds,
  onMarkComplete,
}: InFocusTileProps) {
  return (
    <div className="glass gold-card-hover border border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Flame className="h-4 w-4 fill-amber-400/20" aria-hidden="true" />
          <h3 className="font-bold text-slate-100 tracking-wide uppercase">In Focus Now</h3>
        </div>
        <span className="text-amber-400 font-mono text-[11px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{inProgressTasks.length} active</span>
      </div>

      {inProgressTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 my-2">
          <p className="text-sm text-slate-200 font-semibold mb-1">
            Nothing in progress
          </p>
          <p className="text-xs text-slate-400 mb-4 max-w-xs">
            Start one from your Planned tasks to focus your effort.
          </p>
          <Link
            href="/tasks?status=planned"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 rounded p-1"
          >
            <span>View planned tasks</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {inProgressTasks.map((task) => {
            const isPending = pendingIds.has(task.id);

            return (
              <div
                key={task.id}
                aria-busy={isPending}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-amber-500/15 hover:border-amber-400/35 transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4
                    className="text-sm font-semibold text-slate-100 truncate break-words"
                    title={task.title}
                  >
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p
                      className="text-xs text-slate-400 truncate break-words mt-0.5"
                      title={task.notes}
                    >
                      {task.notes}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  loading={isPending}
                  onClick={() => onMarkComplete(task)}
                  aria-label={`Mark task complete: ${task.title}`}
                  className="gap-1.5 shrink-0 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Complete</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

