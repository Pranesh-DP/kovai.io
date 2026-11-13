import * as React from "react";

export interface ProgressBarTileProps {
  total: number;
  planned: number;
  inProgress: number;
  complete: number;
}

export function ProgressBarTile({
  total,
  planned,
  inProgress,
  complete,
}: ProgressBarTileProps) {
  const completePct = total > 0 ? (complete / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const plannedPct = total > 0 ? (planned / total) * 100 : 0;

  const altText =
    total === 0
      ? "No tasks created yet"
      : `Task distribution: ${complete} complete (${Math.round(completePct)}%), ${inProgress} in progress (${Math.round(inProgressPct)}%), ${planned} planned (${Math.round(plannedPct)}%)`;

  return (
    <div className="glass border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
        <span>Progress Breakdown</span>
        <span>{total} Total Tasks</span>
      </div>

      {/* Stacked Bar */}
      <div
        role="img"
        aria-label={altText}
        className="h-3 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden flex"
      >
        {total === 0 ? (
          <div className="h-full w-full bg-white/5" />
        ) : (
          <>
            {complete > 0 && (
              <div
                style={{ width: `${completePct}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Complete: ${complete}`}
              />
            )}
            {inProgress > 0 && (
              <div
                style={{ width: `${inProgressPct}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
                title={`In Progress: ${inProgress}`}
              />
            )}
            {planned > 0 && (
              <div
                style={{ width: `${plannedPct}%` }}
                className="h-full bg-slate-500 transition-all duration-500"
                title={`Planned: ${planned}`}
              />
            )}
          </>
        )}
      </div>

      {/* Legend with counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
          <span>Complete</span>
          <span className="font-semibold text-slate-100">({complete})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />
          <span>In Progress</span>
          <span className="font-semibold text-slate-100">({inProgress})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500 shrink-0" aria-hidden="true" />
          <span>Planned</span>
          <span className="font-semibold text-slate-100">({planned})</span>
        </div>
      </div>
    </div>
  );
}

