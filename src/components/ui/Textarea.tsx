import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, minRows = 4, className, id, style, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink-dim">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={minRows}
          className={cn(
            "w-full rounded-lg bg-elevated border text-ink text-sm placeholder:text-ink-ghost",
            "px-3 py-2.5 resize-none transition-colors duration-150",
            "focus:outline-none focus:ring-1",
            error
              ? "border-bad focus:border-bad focus:ring-bad/30"
              : "border-wire focus:border-copper focus:ring-copper/30",
            className
          )}
          style={style}
          {...props}
        />
        {error && <p className="text-xs text-bad">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-ghost">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
