"use client";

import { forwardRef, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const checkId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={checkId} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              id={checkId}
              type="checkbox"
              className="sr-only"
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150",
                props.checked
                  ? "bg-copper border-copper"
                  : "bg-elevated border-wire group-hover:border-copper/50",
                error && "border-bad",
                className
              )}
            >
              {props.checked && <Check size={12} className="text-ink-flip" strokeWidth={3} />}
            </div>
          </div>
          {label && <span className="text-sm text-ink-dim group-hover:text-ink transition-colors">{label}</span>}
        </label>
        {error && <p className="text-xs text-bad pl-8">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
