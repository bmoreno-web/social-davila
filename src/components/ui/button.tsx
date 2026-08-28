import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "gold" | "glass" | "emerald" | "warning";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 select-none";
    
    const variants = {
      default: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 active:scale-[0.98]",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50",
      outline: "border border-zinc-700/80 hover:border-zinc-500 hover:bg-zinc-800/50 text-zinc-200",
      ghost: "hover:bg-zinc-800/60 text-zinc-300 hover:text-white",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
      emerald: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",
      warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20",
      gold: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-md shadow-amber-500/20",
      glass: "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-md"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-10 w-10 rounded-lg p-0"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
