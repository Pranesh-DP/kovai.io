"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full bg-[#060709] text-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-strong border border-red-500/30 text-center shadow-2xl flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-inner shadow-red-500/20">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-50 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mb-8 leading-relaxed">
            A critical error occurred while rendering the application. Please try
            refreshing the page.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 border border-emerald-300/40 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Try again</span>
          </button>
        </div>
      </body>
    </html>
  );
}

