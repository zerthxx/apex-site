"use client";

import { Check } from "lucide-react";

/** Horizontal progress indicator for multi-step recovery/verification wizards. */
export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 0-based index of the active step
}) {
  return (
    <div
      className="flex items-center justify-center gap-0 select-none"
      aria-label="Vaiheet"
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 sm:w-10 h-px mx-1 ${done || active ? "bg-copper/60" : "bg-wire"}`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  done
                    ? "bg-copper text-[#0A0C10] border-copper"
                    : active
                      ? "bg-copper/10 text-copper border-copper/60"
                      : "bg-surface text-ink-ghost border-wire"
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  active ? "text-ink" : "text-ink-ghost"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
