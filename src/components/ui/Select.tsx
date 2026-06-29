"use client";

import { forwardRef, useId, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    useEffect(() => {
      setHasValue(!!props.value || !!props.defaultValue);
    }, [props.value, props.defaultValue]);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-dim">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-10 rounded-lg bg-elevated border text-sm appearance-none",
              "pl-3 pr-8 transition-colors duration-150",
              "focus:outline-none focus:ring-1",
              error
                ? "border-bad focus:border-bad focus:ring-bad/30"
                : "border-wire focus:border-copper focus:ring-copper/30",
              hasValue ? "text-ink" : "text-ink-ghost",
              className
            )}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              onChange?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-elevated text-ink">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-bad">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-ghost">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
