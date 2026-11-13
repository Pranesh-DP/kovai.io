"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTaskDialog } from "@/components/tasks/TaskDialogContext";

export function AppHeader() {
  const pathname = usePathname();
  const { openCreateTask } = useTaskDialog();

  const title = React.useMemo(() => {
    if (pathname.startsWith("/tasks")) return "Tasks";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    return "Clearpane";
  }, [pathname]);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 mb-6 rounded-2xl glass border border-emerald-500/20 shadow-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>{title}</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase">
            WORKSPACE
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="md"
          variant="primary"
          onClick={() => openCreateTask()}
          aria-label="New task (press N)"
          title="New task (Press N)"
          className="gap-2 font-bold shadow-md shadow-emerald-500/25"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New task</span>
          <kbd className="hidden lg:inline-block text-[10px] font-mono bg-slate-950/40 text-slate-950 px-1.5 py-0.5 rounded border border-emerald-900/40 font-bold">
            N
          </kbd>
        </Button>
      </div>
    </header>
  );
}

