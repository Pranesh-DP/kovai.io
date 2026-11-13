"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  message: string;
  type?: "info" | "success" | "error";
  duration?: number; // ms, defaults to 5000
  action?: ToastAction;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id || Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...options, id };

      setToasts((prev) => [...prev.filter((t) => t.id !== id), newToast]);

      const duration = options.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Accessible container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const typeIcons = {
            success: (
              <CheckCircle2
                className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ),
            error: (
              <AlertCircle
                className="h-4 w-4 text-red-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ),
            info: (
              <Info
                className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ),
          };

          const typeStyles = {
            success: "border-emerald-500/30",
            error: "border-red-500/30",
            info: "border-white/15",
          };

          const toastType = toast.type ?? "info";
          const isError = toastType === "error";

          return (
            <div
              key={toast.id}
              role={isError ? "alert" : "status"}
              aria-live={isError ? "assertive" : "polite"}
              aria-atomic="true"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-strong border ${typeStyles[toastType]} shadow-xl text-slate-100 text-sm transition-all`}
            >
              {typeIcons[toastType]}
              <div className="flex-1 text-slate-200 leading-snug break-words min-w-0">
                {toast.message}
              </div>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 shrink-0 text-xs px-2 py-1 min-h-[44px] flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 rounded"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-200 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

