import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  accent?: "copper" | "ok" | "bad" | "default";
  href?: string;
}

export function StatCard({
  label,
  value,
  icon,
  description,
  accent = "default",
  href,
}: StatCardProps) {
  const accentClasses = {
    copper: "text-copper bg-copper/10 border-copper/20",
    ok: "text-ok bg-ok/10 border-ok/20",
    bad: "text-bad bg-bad/10 border-bad/20",
    default: "text-ink-dim bg-surface border-wire",
  };

  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-ghost">
          {label}
        </span>
        <span
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg border text-sm",
            accentClasses[accent],
          )}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-ink leading-none">{value}</p>
          {description && (
            <p className="text-xs text-ink-ghost mt-1">{description}</p>
          )}
        </div>
        {href && (
          <ArrowRight
            size={14}
            className="text-ink-ghost group-hover:text-copper group-hover:translate-x-0.5 transition-all duration-150 shrink-0 mb-0.5"
          />
        )}
      </div>
    </>
  );

  const className =
    "group flex flex-col gap-3 p-5 rounded-xl bg-elevated border border-wire hover:border-copper/30 hover:shadow-card-hover transition-all duration-200";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
