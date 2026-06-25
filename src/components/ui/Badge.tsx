import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/lib/types";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-elevated text-ink-dim border border-wire",
  accent: "bg-copper/10 text-copper border border-copper/20",
  teal: "bg-teal-brand/10 text-teal-brand border border-teal-brand/20",
  success: "bg-ok/10 text-ok border border-ok/20",
  error: "bg-bad/10 text-bad border border-bad/20",
  outline: "bg-transparent text-ink-dim border border-wire-bold",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs rounded-md",
  md: "px-2.5 py-1 text-xs rounded-lg",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium leading-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
