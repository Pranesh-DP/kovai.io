import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shell/Sidebar";
import { MobileNav } from "@/components/shell/MobileNav";
import { AppHeader } from "@/components/shell/AppHeader";
import { TaskDialogProvider } from "@/components/tasks/TaskDialogContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export const metadata: Metadata = {
  description: "Manage your tasks in Clearpane.",
};

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userData = {
    name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "User",
    email: user.email ?? "",
    avatarUrl:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      null,
  };

  return (
    <TaskDialogProvider>
      {/* Skip navigation link — visible on focus only */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-400 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:outline-none focus:outline-2 focus:outline-emerald-400"
      >
        Skip to content
      </a>

      <div className="min-h-screen flex flex-col relative z-10">
        {/* Offline indicator — sticky at the top */}
        <OfflineBanner />

        {/* Mobile Top Bar & Drawer (<768px) */}
        <MobileNav user={userData} />

        {/* Desktop/Tablet Sidebar (>=768px) */}
        <Sidebar user={userData} />

        {/* Main Content Area: symmetrically centered inside remaining canvas */}
        <div className="flex-1 flex flex-col md:pl-[104px] lg:pl-[272px] transition-all duration-200">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex-1 flex flex-col">
            <AppHeader />
            <main id="main-content" className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </div>
      </div>
    </TaskDialogProvider>
  );
}

