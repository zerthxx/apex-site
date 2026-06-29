"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, X, Check, FileText, FolderOpen, Receipt, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  quote:   <FileText size={13} />,
  project: <FolderOpen size={13} />,
  invoice: <Receipt size={13} />,
  message: <MessageSquare size={13} />,
  system:  <Info size={13} />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Juuri nyt";
  if (mins < 60) return `${mins} min sitten`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} t sitten`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days} pv sitten` : new Date(dateStr).toLocaleDateString("fi-FI", { day: "numeric", month: "short" });
}

interface NotificationDropdownProps {
  unreadCount: number;
}

export function NotificationDropdown({ unreadCount: initialCount }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    if (!open) fetchNotifications();
    setOpen((v) => !v);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-ink-ghost hover:text-ink hover:bg-surface transition-all duration-150"
        aria-label="Ilmoitukset"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-copper" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[380px] bg-elevated border border-wire rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-wire">
            <span className="text-sm font-semibold text-ink">Ilmoitukset</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-ink-ghost hover:text-ink transition-colors"
                >
                  <Check size={12} />
                  Merkitse kaikki luetuksi
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-ink-ghost hover:text-ink transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-ink-ghost text-sm">
                Ladataan...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-ink-ghost text-sm">
                Ei ilmoituksia
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b border-wire/50 last:border-0 transition-colors",
                    !n.is_read && "bg-copper/5"
                  )}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface border border-wire text-ink-ghost shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] ?? <Info size={13} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-snug", n.is_read ? "text-ink-dim" : "text-ink font-medium")}>
                      {n.href ? (
                        <Link href={n.href} onClick={() => { if (!n.is_read) markRead(n.id); setOpen(false); }}>
                          {n.title}
                        </Link>
                      ) : n.title}
                    </p>
                    {n.body && <p className="text-xs text-ink-ghost mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[11px] text-ink-ghost mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-ink-ghost hover:text-ink transition-colors shrink-0 mt-0.5"
                      title="Merkitse luetuksi"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-wire">
            <Link
              href="/ilmoitukset"
              onClick={() => setOpen(false)}
              className="text-xs text-ink-ghost hover:text-ink transition-colors"
            >
              Näytä kaikki ilmoitukset →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
