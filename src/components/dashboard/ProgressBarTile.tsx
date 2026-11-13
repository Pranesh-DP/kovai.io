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
    <div className="glass emerald-card-hover border border-emerald-500/20 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-xl gap-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="uppercase tracking-wider text-emerald-400">Distribution</span>
        <span className="font-mono text-white">{total} Total Tasks</span>
      </div>

      {/* Stacked Bar with Emerald & Mint */}
      <div
        role="img"
        aria-label={altText}
        className="h-3.5 w-full rounded-full bg-slate-950/70 border border-emerald-500/20 overflow-hidden flex shadow-inner"
      >
        {total === 0 ? (
          <div className="h-full w-full bg-white/5" />
        ) : (
          <>
            {complete > 0 && (
              <div
                style={{ width: `${completePct}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                title={`Complete: ${complete}`}
              />
            )}
            {inProgress > 0 && (
              <div
                style={{ width: `${inProgressPct}%` }}
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-300 transition-all duration-500"
                title={`In Progress: ${inProgress}`}
              />
            )}
            {planned > 0 && (
              <div
                style={{ width: `${plannedPct}%` }}
                className="h-full bg-zinc-700 transition-all duration-500"
                title={`Planned: ${planned}`}
              />
            )}
          </>
        )}
      </div>

      {/* Legend with counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-1 font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0 shadow-sm" aria-hidden="true" />
          <span>Complete</span>
          <span className="font-bold text-white">({complete})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-300 shrink-0 shadow-sm shadow-teal-500/20" aria-hidden="true" />
          <span>In Progress</span>
          <span className="font-bold text-emerald-300">({inProgress})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600 shrink-0" aria-hidden="true" />
          <span>Planned</span>
          <span className="font-bold text-slate-400">({planned})</span>
        </div>
      </div>
    </div>
  );
}

