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
      className="glass emerald-card-hover border border-emerald-500/20 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-between shadow-xl text-center"
    >
      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="uppercase tracking-wider text-emerald-400">Mastery</span>
        <span className="text-white font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">{percent}%</span>
      </div>

      {/* SVG Ring with Luxury Emerald Gradient */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          className="w-36 h-36 -rotate-90 transform drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          viewBox="0 0 128 128"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="emeraldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="50%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="url(#emeraldRingGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={total === 0 ? circumference : offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered number overlay */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
            {percent}%
          </span>
          <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold">
            Complete
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-medium">
        <span className="text-emerald-300 font-bold">{completed}</span> of {total} {total === 1 ? "task" : "tasks"} done
      </p>
    </div>
  );
}

