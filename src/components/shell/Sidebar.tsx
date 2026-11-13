"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Layers } from "lucide-react";
import { UserMenu } from "./UserMenu";

export interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main Navigation"
      className="hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 transition-all duration-200 p-4 md:w-[72px] lg:w-[240px] m-4 glass border border-white/10"
    >
      <div className="flex flex-col gap-6">
        {/* Brand / Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl text-slate-100 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 transition-colors"
          aria-label="Clearpane Home"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-slate-950 border border-emerald-300/40 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <Layers className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <span className="hidden lg:inline text-lg font-bold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
            Clearpane
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5" aria-label="Sidebar Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={item.name}
                aria-label={item.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-300 font-bold border-l-2 border-l-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10"
                    : "text-slate-300 hover:text-emerald-200 hover:bg-emerald-500/[0.08] border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-emerald-400" : ""}`} aria-hidden="true" />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card (Tablet: icon-only avatar, Desktop: full info) */}
      <div className="border-t border-white/10 pt-3">
        {/* On tablet (<1024px) collapsed */}
        <div className="lg:hidden">
          <UserMenu
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            collapsed={true}
          />
        </div>
        {/* On desktop (>=1024px) full */}
        <div className="hidden lg:block">
          <UserMenu
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            collapsed={false}
          />
        </div>
      </div>
    </aside>
  );
}

