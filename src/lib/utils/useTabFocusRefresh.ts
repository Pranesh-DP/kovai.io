"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Automatically refreshes server data via router.refresh() when the
 * browser tab regains focus or becomes visible, throttled to at most
 * once every 10 seconds to avoid unnecessary load.
 */
export function useTabFocusRefresh(throttleMs = 10000) {
  const router = useRouter();
  const lastRefreshRef = React.useRef<number>(0);

  React.useEffect(() => {
    lastRefreshRef.current = Date.now();

    function refreshIfStale() {
      const now = Date.now();
      if (now - lastRefreshRef.current >= throttleMs) {
        lastRefreshRef.current = now;
        router.refresh();
      }
    }

    function onFocus() {
      refreshIfStale();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshIfStale();
      }
    }

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router, throttleMs]);
}

