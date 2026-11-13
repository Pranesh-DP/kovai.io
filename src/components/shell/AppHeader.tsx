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
    <header className="sr-only md:not-sr-only md:flex items-center justify-between px-6 py-4 mb-6 rounded-2xl glass border border-white/10">
      <div>
        <h1 className="text-xl font-semibold text-slate-50 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Button
          size="md"
          variant="primary"
          onClick={() => openCreateTask()}
          aria-label="New task (press N)"
          title="New task (Press N)"
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New task</span>
          <kbd className="hidden lg:inline-block text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white/80">
            N
          </kbd>
        </Button>
      </div>
    </header>
  );
}

