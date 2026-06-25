import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink-dim"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg bg-elevated border text-ink text-sm placeholder:text-ink-ghost",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-1",
              leftIcon ? "pl-10 pr-3" : "px-3",
              error
                ? "border-bad focus:border-bad focus:ring-bad/30"
                : "border-wire focus:border-copper focus:ring-copper/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-bad">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-ghost">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
