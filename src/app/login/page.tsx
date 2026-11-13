import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in with your Google account to manage your tasks.",
  openGraph: {
    title: "Sign In | Clearpane",
    description: "Sign in with your Google account to manage your tasks.",
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 relative z-10 overflow-hidden">
      {/* Planetary golden horizon arc behind card (inspired by reference Image 5) */}
      <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[400px] rounded-[100%] bg-gradient-to-t from-amber-500/25 via-yellow-500/10 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md glass-strong border border-amber-500/20 p-8 sm:p-10 text-center shadow-2xl rounded-3xl animate-pulse">
            <div className="h-20 w-20 rounded-3xl bg-amber-500/10 mx-auto mb-6" />
            <div className="h-8 w-40 bg-white/10 mx-auto mb-2 rounded" />
            <div className="h-4 w-60 bg-white/10 mx-auto mb-8 rounded" />
            <div className="h-12 w-full bg-amber-500/20 rounded-2xl" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
