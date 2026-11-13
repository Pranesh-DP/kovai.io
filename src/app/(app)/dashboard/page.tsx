import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listTasks, AuthError } from "@/lib/tasks/queries";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your personal productivity metrics, progress ring, and active tasks.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let tasks;
  try {
    tasks = await listTasks();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    throw error;
  }

  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";

  return <DashboardGrid initialTasks={tasks} userName={userName} />;
}
