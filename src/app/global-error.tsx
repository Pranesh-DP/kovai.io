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
      <body className="min-h-full bg-[#0B1020] text-slate-50 flex items-center justify-center p-4">
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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Try again</span>
          </button>
        </div>
      </body>
    </html>
  );
}

