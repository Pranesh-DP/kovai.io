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
    <main className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md glass border border-white/15 p-8 sm:p-10 text-center shadow-2xl rounded-3xl animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-white/10 mx-auto mb-6" />
            <div className="h-8 w-40 bg-white/10 mx-auto mb-2 rounded" />
            <div className="h-4 w-60 bg-white/10 mx-auto mb-8 rounded" />
            <div className="h-12 w-full bg-white/10 rounded-xl" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
