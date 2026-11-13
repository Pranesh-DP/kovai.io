"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLElement | null>;
  closeOnClickOutside?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  triggerRef,
  closeOnClickOutside = true,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Save last active element and restore on close
  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current =
        (triggerRef?.current as HTMLElement | null) ??
        (document.activeElement as HTMLElement | null);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus trap setup: focus the dialog container or first focusable
      const timer = setTimeout(() => {
        if (!dialogRef.current) return;
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, triggerRef]);

  // Handle Escape key and focus trap loop
  React.useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        if (!dialogRef.current) return;
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  const titleId = "dialog-title";
  const descId = description ? "dialog-description" : undefined;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="w-full sm:max-w-lg glass-strong border border-amber-500/25 p-6 sm:p-8 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto focus:outline-none flex flex-col pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        {/* Mobile bottom sheet drag handle visual */}
        <div
          className="sm:hidden w-12 h-1.5 bg-amber-400/30 rounded-full mx-auto mb-4 shrink-0"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-slate-50">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-sm text-slate-300 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
