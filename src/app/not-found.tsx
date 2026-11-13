import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested page could not be found.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-strong border border-emerald-500/25 text-center shadow-2xl flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 border border-emerald-300/40 flex items-center justify-center text-slate-950 mb-6 shadow-xl shadow-emerald-500/25">
          <FileQuestion className="h-8 w-8 stroke-[2.5]" aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-2">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-100 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-slate-300 max-w-xs mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 border border-emerald-200/50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-emerald-500/20 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 min-h-[44px]"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

