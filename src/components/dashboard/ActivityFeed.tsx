import { LogIn, LogOut, Key, User, Mail, ShieldAlert, Globe } from "lucide-react";
import { EVENT_LABELS } from "@/lib/supabase/activityLog";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  login: <LogIn size={13} />,
  logout: <LogOut size={13} />,
  google_login: <Globe size={13} />,
  password_change: <Key size={13} />,
  profile_update: <User size={13} />,
  email_verified: <Mail size={13} />,
  account_suspended: <ShieldAlert size={13} />,
};

const EVENT_ACCENT: Record<string, string> = {
  login: "bg-ok/10 text-ok border-ok/20",
  logout: "bg-surface text-ink-ghost border-wire",
  google_login: "bg-ok/10 text-ok border-ok/20",
  password_change: "bg-copper/10 text-copper border-copper/20",
  profile_update: "bg-surface text-ink-dim border-wire",
  email_verified: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  account_suspended: "bg-bad/10 text-bad border-bad/20",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Juuri nyt";
  if (mins < 60) return `${mins} min sitten`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} t sitten`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} pv sitten`;
  return new Date(dateStr).toLocaleDateString("fi-FI", { day: "numeric", month: "short" });
}

interface ActivityFeedProps {
  logs: ActivityLog[];
  emptyText?: string;
}

export function ActivityFeed({ logs, emptyText = "Ei aktiviteettia vielä." }: ActivityFeedProps) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-ink-ghost text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-wire">
      {logs.map((log) => {
        const icon = EVENT_ICONS[log.event_type] ?? <LogIn size={13} />;
        const accent = EVENT_ACCENT[log.event_type] ?? "bg-surface text-ink-dim border-wire";
        const label = EVENT_LABELS[log.event_type] ?? log.event_type;
        return (
          <div key={log.id} className="flex items-center gap-3 py-3">
            <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg border shrink-0", accent)}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink leading-none">{label}</p>
              {log.event_data?.device != null && (
                <p className="text-xs text-ink-ghost mt-0.5 truncate">{String(log.event_data.device)}</p>
              )}
            </div>
            <time className="text-xs text-ink-ghost shrink-0">{timeAgo(log.created_at)}</time>
          </div>
        );
      })}
    </div>
  );
}
