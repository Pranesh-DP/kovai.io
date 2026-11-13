"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/utils/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-amber-500/20 border-b border-amber-500/30 backdrop-blur-md px-4 py-2 text-center text-xs font-medium text-amber-200 flex items-center justify-center gap-2"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>You&apos;re offline. Changes can&apos;t be saved.</span>
    </div>
  );
}

