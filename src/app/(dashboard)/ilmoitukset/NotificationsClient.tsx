"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen, Receipt, MessageSquare, Bell, ArrowRight, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  quote: <FileText size={15} />,
  project: <FolderOpen size={15} />,
  invoice: <Receipt size={15} />,
  message: <MessageSquare size={15} />,
  system: <Bell size={15} />,
};

const TYPE_ACCENT: Record<string, string> = {
  quote: "text-copper bg-copper/10 border-copper/20",
  project: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  invoice: "text-ok bg-ok/10 border-ok/20",
  message: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  system: "text-ink-dim bg-surface border-wire",
};

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Juuri nyt";
  if (mins < 60) return `${mins} min sitten`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} t sitten`;
  return new Date(str).toLocaleDateString("fi-FI", { day: "numeric", month: "short" });
}

interface NotificationsClientProps {
  notifications: Notification[];
}

export function NotificationsClient({ notifications: initial }: NotificationsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [markingAll, setMarkingAll] = useState(false);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function markAllRead() {
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setMarkingAll(false);
    router.refresh();
  }

  const unread = items.filter((n) => !n.is_read).length;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ink-ghost rounded-xl border border-wire bg-elevated">
        <Bell size={32} className="mb-3 opacity-30" />
        <p className="text-sm">Ei ilmoituksia vielä.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-ghost">{unread} lukematonta</span>
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-copper transition-colors disabled:opacity-50"
          >
            <CheckCheck size={13} />
            Merkitse kaikki luetuksi
          </button>
        </div>
      )}

      <div className="flex flex-col divide-y divide-wire rounded-xl border border-wire bg-elevated overflow-hidden">
        {items.map((n) => {
          const icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.system;
          const accent = TYPE_ACCENT[n.type] ?? TYPE_ACCENT.system;

          const content = (
            <div
              className={cn(
                "flex items-start gap-3 px-4 py-4 transition-colors",
                !n.is_read ? "bg-copper/3 hover:bg-copper/5" : "hover:bg-surface/50",
                n.href ? "cursor-pointer" : ""
              )}
              onClick={() => { if (!n.is_read) markRead(n.id); }}
            >
              <span className={cn("flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 mt-0.5", accent)}>
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm leading-snug", n.is_read ? "text-ink-dim" : "text-ink font-medium")}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <time className="text-xs text-ink-ghost whitespace-nowrap">{timeAgo(n.created_at)}</time>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-copper shrink-0" />
                    )}
                  </div>
                </div>
                {n.body && <p className="text-xs text-ink-ghost mt-0.5 leading-relaxed">{n.body}</p>}
              </div>
              {n.href && (
                <ArrowRight size={13} className="text-ink-ghost shrink-0 mt-1" />
              )}
            </div>
          );

          if (n.href) {
            return (
              <Link key={n.id} href={n.href} className="block">
                {content}
              </Link>
            );
          }
          return <div key={n.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
