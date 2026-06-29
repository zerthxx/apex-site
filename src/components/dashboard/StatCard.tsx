import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  accent?: "copper" | "ok" | "bad" | "default";
  href?: string;
}

export function StatCard({ label, value, icon, description, accent = "default" }: StatCardProps) {
  const accentClasses = {
    copper: "text-copper bg-copper/10 border-copper/20",
    ok: "text-ok bg-ok/10 border-ok/20",
    bad: "text-bad bg-bad/10 border-bad/20",
    default: "text-ink-dim bg-surface border-wire",
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-elevated border border-wire hover:border-wire-bold transition-colors duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-ghost">{label}</span>
        <span className={cn("flex items-center justify-center w-8 h-8 rounded-lg border text-sm", accentClasses[accent])}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-ink leading-none">{value}</p>
        {description && (
          <p className="text-xs text-ink-ghost mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
