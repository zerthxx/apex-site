import {
  LogIn,
  LogOut,
  Key,
  User,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Globe,
  UserPlus,
  UserCog,
  Trash2,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  FolderPlus,
  FolderCog,
  Receipt,
  CreditCard,
  RotateCcw,
  Paperclip,
  CheckSquare,
  Activity,
} from "lucide-react";
import { EVENT_LABELS } from "@/lib/supabase/activityLog";
import { EmptyState } from "@/components/dashboard/EmptyState";
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
  account_unsuspended: <ShieldCheck size={13} />,
  role_changed: <UserCog size={13} />,
  user_suspended: <ShieldAlert size={13} />,
  user_unsuspended: <ShieldCheck size={13} />,
  customer_created: <UserPlus size={13} />,
  customer_updated: <User size={13} />,
  customer_deleted: <Trash2 size={13} />,
  quote_created: <FileText size={13} />,
  quote_sent: <Send size={13} />,
  quote_accepted: <CheckCircle2 size={13} />,
  quote_rejected: <XCircle size={13} />,
  quote_deleted: <Trash2 size={13} />,
  project_created: <FolderPlus size={13} />,
  project_updated: <FolderCog size={13} />,
  project_deleted: <Trash2 size={13} />,
  invoice_created: <Receipt size={13} />,
  invoice_paid: <CheckCircle2 size={13} />,
  invoice_paid_via_stripe: <CreditCard size={13} />,
  payment_refunded: <RotateCcw size={13} />,
  file_uploaded: <Paperclip size={13} />,
  file_deleted: <Trash2 size={13} />,
  task_created: <CheckSquare size={13} />,
  task_updated: <CheckSquare size={13} />,
};

const EVENT_ACCENT: Record<string, string> = {
  login: "bg-ok/10 text-ok border-ok/20",
  logout: "bg-surface text-ink-ghost border-wire",
  google_login: "bg-ok/10 text-ok border-ok/20",
  password_change: "bg-copper/10 text-copper border-copper/20",
  profile_update: "bg-surface text-ink-dim border-wire",
  email_verified: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  account_suspended: "bg-bad/10 text-bad border-bad/20",
  account_unsuspended: "bg-ok/10 text-ok border-ok/20",
  role_changed: "bg-copper/10 text-copper border-copper/20",
  user_suspended: "bg-bad/10 text-bad border-bad/20",
  user_unsuspended: "bg-ok/10 text-ok border-ok/20",
  customer_created: "bg-ok/10 text-ok border-ok/20",
  customer_updated: "bg-surface text-ink-dim border-wire",
  customer_deleted: "bg-bad/10 text-bad border-bad/20",
  quote_created: "bg-copper/10 text-copper border-copper/20",
  quote_sent: "bg-copper/10 text-copper border-copper/20",
  quote_accepted: "bg-ok/10 text-ok border-ok/20",
  quote_rejected: "bg-bad/10 text-bad border-bad/20",
  quote_deleted: "bg-bad/10 text-bad border-bad/20",
  project_created: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  project_updated: "bg-surface text-ink-dim border-wire",
  project_deleted: "bg-bad/10 text-bad border-bad/20",
  invoice_created: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  invoice_paid: "bg-ok/10 text-ok border-ok/20",
  invoice_paid_via_stripe: "bg-ok/10 text-ok border-ok/20",
  payment_refunded: "bg-caution/10 text-caution border-caution/20",
  file_uploaded: "bg-teal-brand/10 text-teal-brand border-teal-brand/20",
  file_deleted: "bg-bad/10 text-bad border-bad/20",
  task_created: "bg-copper/10 text-copper border-copper/20",
  task_updated: "bg-surface text-ink-dim border-wire",
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
  return new Date(dateStr).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "short",
  });
}

interface ActivityFeedProps {
  logs: ActivityLog[];
  emptyText?: string;
}

export function ActivityFeed({
  logs,
  emptyText = "Ei aktiviteettia vielä.",
}: ActivityFeedProps) {
  if (!logs.length) {
    return <EmptyState icon={Activity} title={emptyText} />;
  }

  return (
    <div className="flex flex-col divide-y divide-wire">
      {logs.map((log) => {
        const icon = EVENT_ICONS[log.event_type] ?? <LogIn size={13} />;
        const accent =
          EVENT_ACCENT[log.event_type] ?? "bg-surface text-ink-dim border-wire";
        const label = EVENT_LABELS[log.event_type] ?? log.event_type;
        return (
          <div key={log.id} className="flex items-center gap-3 py-3">
            <span
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg border shrink-0",
                accent,
              )}
            >
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink leading-none">{label}</p>
              {log.event_data?.device != null && (
                <p className="text-xs text-ink-ghost mt-0.5 truncate">
                  {String(log.event_data.device)}
                </p>
              )}
            </div>
            <time className="text-xs text-ink-ghost shrink-0">
              {timeAgo(log.created_at)}
            </time>
          </div>
        );
      })}
    </div>
  );
}
