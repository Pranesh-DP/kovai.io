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
      className="glass gold-card-hover border border-amber-500/20 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-between shadow-xl text-center"
    >
      <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="uppercase tracking-wider text-amber-400">Mastery</span>
        <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{percent}%</span>
      </div>

      {/* SVG Ring with Luxury Gold Gradient */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          className="w-36 h-36 -rotate-90 transform drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="goldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="url(#goldRingGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={total === 0 ? circumference : offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered number overlay */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            {percent}%
          </span>
          <span className="text-[10px] text-amber-300/80 uppercase tracking-widest font-bold">
            Complete
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-medium">
        <span className="text-amber-300 font-bold">{completed}</span> of {total} {total === 1 ? "task" : "tasks"} done
      </p>
    </div>
  );
}

