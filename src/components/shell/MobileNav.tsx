"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Layers, Menu, X, Plus } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/Button";
import { useTaskDialog } from "@/components/tasks/TaskDialogContext";

export interface MobileNavProps {
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

export function MobileNav({ user }: MobileNavProps) {
  const { openCreateTask } = useTaskDialog();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close drawer on path change (React-recommended pattern for adjusting state based on props/external value)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle escape key and focus trap for drawer
  React.useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        if (!drawerRef.current) return;
        const focusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            event.preventDefault();
          }
        }
      }
    }

    // Auto-focus first element in drawer
    const timer = setTimeout(() => {
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }
    }, 50);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="md:hidden sticky top-0 z-40 w-full px-4 py-3 glass border-b border-white/10 flex items-center justify-between">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-slate-100 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 rounded-lg p-1"
        aria-label="Clearpane Home"
      >
        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
          <Layers className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="font-semibold tracking-tight text-base">Clearpane</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => openCreateTask()}
          aria-label="New task"
          className="gap-1.5 min-h-[44px] px-3"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs">New task</span>
        </Button>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Slide-over Drawer & Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              menuButtonRef.current?.focus();
            }
          }}
        >
          <div
            ref={drawerRef}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] glass-strong border-r border-white/15 p-6 flex flex-col justify-between shadow-2xl focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-slate-100">Clearpane</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                        isActive
                          ? "bg-indigo-500/15 text-indigo-200 font-medium border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-white/10 pt-4">
              <UserMenu
                name={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
                collapsed={false}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
