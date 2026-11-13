"use client";

import * as React from "react";

export interface CompletionRingTileProps {
  completed: number;
  total: number;
  percent: number;
}

export function CompletionRingTile({
  completed,
  total,
  percent,
}: CompletionRingTileProps) {
  const [animatedPercent, setAnimatedPercent] = React.useState(0);

  React.useEffect(() => {
    // Animate ring from 0 to percent on mount
    const timer = setTimeout(() => {
      setAnimatedPercent(percent);
    }, 50);
    return () => clearTimeout(timer);
  }, [percent]);

  const radius = 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div
      role="region"
      aria-label={`${percent} percent complete`}
      className="glass border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-between shadow-xl text-center"
    >
      <div className="w-full flex items-center justify-between text-xs font-medium text-slate-400">
        <span>Completion</span>
        <span className="text-emerald-400 font-semibold">{percent}%</span>
      </div>

      {/* SVG Ring */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          className="w-36 h-36 -rotate-90 transform"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={total === 0 ? circumference : offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered number overlay */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tracking-tight text-slate-50">
            {percent}%
          </span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
            Done
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-medium">
        {completed} of {total} {total === 1 ? "task" : "tasks"} complete
      </p>
    </div>
  );
}

