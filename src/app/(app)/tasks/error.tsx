"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Tasks page error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl glass border border-red-500/20 text-center my-6"
    >
      <div className="h-16 w-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-inner shadow-red-500/20">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-semibold text-slate-100 mb-2">
        Unable to load tasks
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        We encountered an error communicating with the database. Please check
        your connection and try again.
      </p>

      <Button onClick={() => reset()} className="gap-2">
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        <span>Try again</span>
      </Button>
    </div>
  );
}

