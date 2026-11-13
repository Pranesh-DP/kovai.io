import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

/**
 * Root page — proxy.ts redirects authenticated users to /dashboard and
 * unauthenticated users to /login before this renders. This component
 * provides a server-side fallback for both cases.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
