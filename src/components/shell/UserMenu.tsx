"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export interface UserMenuProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  collapsed?: boolean;
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  collapsed = false,
}: UserMenuProps) {
  const [imageError, setImageError] = React.useState(false);

  // Compute initials from name or email
  const initials = React.useMemo(() => {
    if (name && name !== "User") {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "CP";
  }, [name, email]);

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
        collapsed ? "justify-center" : "justify-between"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="relative h-9 w-9 rounded-full overflow-hidden bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-xs font-semibold text-indigo-200"
          title={`${name} (${email})`}
        >
          {avatarUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-100 truncate">
              {name}
            </p>
            <p className="text-xs text-slate-400 truncate" title={email}>
              {email}
            </p>
          </div>
        )}
      </div>

      <form action={signOut} className={collapsed ? "mt-2" : ""}>
        <button
          type="submit"
          title="Sign out"
          aria-label="Sign out"
          className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 transition-colors"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

