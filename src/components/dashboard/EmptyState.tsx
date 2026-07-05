import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface border border-wire flex items-center justify-center text-ink-ghost mb-4">
          <Icon size={22} strokeWidth={1.5} />
        </div>
      )}
      <p className="font-heading font-semibold text-ink text-sm">{title}</p>
      {description && (
        <p className="text-ink-ghost text-xs mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
