"use client";

import * as React from "react";
import { Task } from "@/types/task";
import { Sidebar } from "@/components/shell/Sidebar";
import { MobileNav } from "@/components/shell/MobileNav";
import { AppHeader } from "@/components/shell/AppHeader";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskDialogProvider } from "@/components/tasks/TaskDialogContext";
import { LayoutDashboard, CheckSquare, Eye } from "lucide-react";

const DEMO_USER = {
  name: "Alex Vance",
  email: "alex.vance@clearpane.io",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
};

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    user_id: "demo-user",
    title: "⚡ Finalize Obsidian & Emerald Design System",
    notes: "Calibrate electric emerald borders, pulse indicators, and responsive bento grid.",
    status: "in_progress",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date().toISOString(),
  },
  {
    id: "task-2",
    user_id: "demo-user",
    title: "Ship Q1 Product Roadmap & Strategy Deck",
    notes: "Review priority milestones, resource allocation, and Q2 budget projections.",
    status: "in_progress",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date().toISOString(),
  },
  {
    id: "task-3",
    user_id: "demo-user",
    title: "Database Indexing & PostgreSQL RLS Security Audit",
    notes: "Verify zero security vulnerabilities, search_path isolation, and sub-10ms query execution.",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "task-4",
    user_id: "demo-user",
    title: "Configure Automated Google Cloud OAuth Consent Screen",
    notes: "Add authorized redirect URIs and verification scopes for seamless team onboarding.",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "task-5",
    user_id: "demo-user",
    title: "Quarterly Systems Infrastructure Review",
    notes: "Audit microservice latencies, Vercel edge caching rules, and serverless bundle sizes.",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "task-6",
    user_id: "demo-user",
    title: "Draft Developer API Documentation & SDK Guides",
    notes: "Write TypeScript SDK quickstart with code snippets and error code reference table.",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updated_at: new Date().toISOString(),
    status_changed_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export default function PreviewPage() {
  const [activeView, setActiveView] = React.useState<"dashboard" | "tasks">("dashboard");
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);

  function handleMarkAllComplete() {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: "complete" as const,
        status_changed_at: new Date().toISOString(),
      })),
    );
  }

  function handleResetDemo() {
    setTasks(INITIAL_TASKS);
  }

  return (
    <TaskDialogProvider>
      <div className="min-h-screen flex flex-col relative z-10">
        {/* Preview Mode Sticky Top Banner */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-emerald-500/20 backdrop-blur-lg border-b border-emerald-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-emerald-200 tracking-wide uppercase flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-emerald-400" />
              Live Interactive Preview Mode (No Login Required)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Demo Actions */}
            <button
              type="button"
              onClick={handleMarkAllComplete}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30 transition-colors shadow-sm"
            >
              ✓ Mark All Done (100% Mastery)
            </button>
            <button
              type="button"
              onClick={handleResetDemo}
              className="text-[11px] font-medium px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Reset
            </button>

            {/* Toggle between Dashboard & Tasks views */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-emerald-500/30 gap-1">
              <button
                type="button"
                onClick={() => setActiveView("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === "dashboard"
                    ? "bg-emerald-400 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-emerald-200"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("tasks")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === "tasks"
                    ? "bg-emerald-400 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-emerald-200"
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Tasks Board</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <MobileNav user={DEMO_USER} />

        {/* Desktop Sidebar */}
        <Sidebar user={DEMO_USER} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-[104px] lg:pl-[272px] transition-all duration-200">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex-1 flex flex-col">
            <AppHeader />
            <main id="main-content" className="flex-1 flex flex-col">
              {activeView === "dashboard" ? (
                <DashboardGrid initialTasks={tasks} userName={DEMO_USER.name} />
              ) : (
                <TaskBoard initialTasks={tasks} />
              )}
            </main>
          </div>
        </div>
      </div>
    </TaskDialogProvider>
  );
}

