"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Loader2, Layers, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "auth_failed";
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleGoogleSignIn() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md glass border border-white/15 p-8 sm:p-10 text-center shadow-2xl rounded-3xl flex flex-col items-center">
      {/* Brand Icon */}
      <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-6 shadow-inner shadow-indigo-500/20">
        <Layers className="h-7 w-7" aria-hidden="true" />
      </div>

      {/* Header & Tagline */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Clearpane
        </h1>
        <p className="text-sm text-slate-300 max-w-xs mx-auto">
          A minimal, focused task manager for calm and deliberate productivity.
        </p>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div
          role="alert"
          className="w-full flex items-center gap-2.5 rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-200 mb-6 text-left"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          <span>Sign-in failed or was cancelled. Please try again.</span>
        </div>
      )}

      {/* Google Sign-in Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        aria-busy={loading}
        aria-label="Continue with Google"
        className="w-full flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-xl font-medium text-sm text-slate-100 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 transition-all shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-slate-200" aria-hidden="true" />
            <span>Connecting to Google…</span>
          </>
        ) : (
          <>
            {/* Inline Google "G" SVG Mark */}
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <p className="mt-8 text-xs text-slate-500">
        By continuing, you agree to our terms of service and privacy policy.
      </p>
    </div>
  );
}
