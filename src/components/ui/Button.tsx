import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 border border-amber-300/40 active:scale-[0.98]",
      secondary:
        "bg-white/[0.06] hover:bg-white/[0.12] text-amber-100/90 border border-amber-500/20 hover:border-amber-400/40 shadow-sm active:scale-[0.98]",
      ghost: "bg-transparent hover:bg-amber-500/10 text-slate-300 hover:text-amber-200",
      danger:
        "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30",
    };

    const sizeStyles = {
      sm: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

