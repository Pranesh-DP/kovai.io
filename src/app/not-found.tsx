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
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass border border-white/15 text-center shadow-2xl flex flex-col items-center">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-400 mb-6 shadow-inner shadow-indigo-500/20">
          <FileQuestion className="h-8 w-8" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-50 mb-2">
          404
        </h1>
        <h2 className="text-lg font-medium text-slate-200 mb-2">
          Page not found
        </h2>
        <p className="text-sm text-slate-300 max-w-xs mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 min-h-[44px]"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

