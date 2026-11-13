"use client";

import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnlineStatus } from "@/lib/utils/useOnlineStatus";

export interface GreetingTileProps {
  userName: string;
  onQuickAdd: (title: string) => void;
}

export function GreetingTile({ userName, onQuickAdd }: GreetingTileProps) {
  const isOnline = useOnlineStatus();
  const [quickTitle, setQuickTitle] = React.useState("");

  // Client-rendered time of day to avoid SSR hydration mismatch
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const greeting = React.useMemo(() => {
    if (!isMounted) return "Welcome back";
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [isMounted]);

  const firstName = userName ? userName.split(" ")[0] : "there";

  function handleAdd(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = quickTitle.trim();
    if (trimmed) {
      onQuickAdd(trimmed);
      setQuickTitle("");
    }
  }

  return (
    <div className="glass border border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Overview</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
          {greeting}, {firstName}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
          Here is your calm workspace summary. Focus on what matters most today.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2 w-full mt-2">
        <label htmlFor="quick-add-input" className="sr-only">
          What needs doing?
        </label>
        <input
          id="quick-add-input"
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="What needs doing?"
          maxLength={120}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-900/60 border border-white/10 text-slate-100 placeholder-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 transition-colors"
        />
        <Button
          type="submit"
          disabled={!quickTitle.trim() || !isOnline}
          size="md"
          className="gap-1.5 shrink-0"
          title={!isOnline ? "Unavailable while offline" : undefined}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add</span>
        </Button>
      </form>
    </div>
  );
}

