"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Layers,
  AlertCircle,
  CheckSquare,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";

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
      const rawSiteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      // Clean siteUrl to prevent accidental nested /login or trailing slashes
      const siteUrl = rawSiteUrl.replace(/\/+$/, "").replace(/\/login$/, "");
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
    <div className="w-full max-w-md glass-strong border border-emerald-500/30 p-8 sm:p-10 text-center shadow-[0_20px_70px_rgba(0,0,0,0.85)] rounded-3xl flex flex-col items-center relative overflow-hidden">
      {/* Decorative Emerald Top Shimmer Arc */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_18px_rgba(16,185,129,0.2)]">
        <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
        <span>Focus & Task Studio</span>
      </div>

      {/* Brand Crest with Radiant Orbital Aura */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-emerald-600/40 blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 border-2 border-emerald-300/70 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.45)]">
          <Layers className="h-10 w-10 stroke-[2.5]" aria-hidden="true" />
        </div>
      </div>

      {/* Header & Tagline */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
          Clearpane
        </h1>
        <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
          Your personal task manager. Organize, track, and complete your priorities with calm clarity.
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
        className="w-full flex items-center justify-center gap-3.5 py-4 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:via-emerald-400 hover:to-teal-400 border border-emerald-200/60 transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed select-none animate-shimmer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" aria-hidden="true" />
            <span>Connecting to Google…</span>
          </>
        ) : (
          <>
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

      {/* 3 Pillar Feature Cards */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-8 pt-6 border-t border-emerald-500/20">
        <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/15 text-center">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">Secure</span>
          <span className="text-[9px] text-slate-400">Google PKCE</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/15 text-center">
          <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">Instant</span>
          <span className="text-[9px] text-slate-400">Optimistic UI</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/15 text-center">
          <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">Private</span>
          <span className="text-[9px] text-slate-400">Postgres RLS</span>
        </div>
      </div>

      {/* Instant Demo Preview Link */}
      <div className="mt-6 pt-4 border-t border-white/5 w-full">
        <Link
          href="/preview"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded px-2 py-1"
        >
          <span>Explore Live Demo (No Login Required)</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
