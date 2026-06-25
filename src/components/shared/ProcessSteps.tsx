import { cn } from "@/lib/utils";
import type { ProcessStep } from "@/lib/types";

interface ProcessStepsProps {
  steps: ProcessStep[];
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function ProcessSteps({
  steps,
  variant = "horizontal",
  className,
}: ProcessStepsProps) {
  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col gap-0", className)}>
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-6">
            {/* Left column: number + connector line */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-copper bg-copper/10 text-copper font-heading font-bold text-base shrink-0">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-linear-to-b from-copper/40 to-wire my-2" />
              )}
            </div>
            {/* Right column: content */}
            <div className={cn("pb-10", i === steps.length - 1 && "pb-0")}>
              <h3 className="font-heading font-semibold text-ink text-xl mb-2 mt-3">
                {step.title}
              </h3>
              <p className="text-ink-dim leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative",
        className
      )}
    >
      {/* Dashed connector (desktop only) */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-wire-bold"
        style={{ zIndex: 0 }}
      />
      {steps.map((step) => (
        <div key={step.number} className="flex flex-col items-center text-center gap-4 relative">
          {/* Background number */}
          <span
            aria-hidden
            className="absolute -top-4 font-display font-bold text-8xl text-copper/5 leading-none select-none pointer-events-none"
          >
            {step.number}
          </span>
          <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 border-copper bg-copper/10 text-copper font-heading font-bold text-xl">
            {step.number}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-ink text-lg mb-1">{step.title}</h3>
            <p className="text-ink-dim text-sm leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
