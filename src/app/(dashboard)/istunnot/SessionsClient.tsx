"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, Globe, LogOut, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  device_hint: string | null;
  ip_address: string | null;
  created_at: string;
  last_seen: string;
  session_token: string;
}

function formatDate(str: string) {
  return new Date(str).toLocaleString("fi-FI", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DeviceIcon({ hint }: { hint?: string | null }) {
  const h = (hint ?? "").toLowerCase();
  if (h.includes("mobile") || h.includes("android") || h.includes("iphone")) {
    return <Smartphone size={17} className="text-ink-dim" />;
  }
  return <Monitor size={17} className="text-ink-dim" />;
}

interface SessionsClientProps {
  sessions: Session[];
}

export function SessionsClient({ sessions: initial }: SessionsClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initial);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function logoutOthers() {
    setLogoutAllLoading(true);
    setMsg("");
    const res = await fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoutOthers: true }),
    });
    setLogoutAllLoading(false);
    if (res.ok) {
      setSessions((s) => s.slice(0, 1));
      setMsg("Muut istunnot on kirjattu ulos.");
    }
  }

  async function revokeSession(id: string) {
    setRevoking(id);
    setMsg("");
    await fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    });
    setSessions((s) => s.filter((x) => x.id !== id));
    setRevoking(null);
  }

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ink-ghost text-sm rounded-xl border border-wire bg-elevated">
        <Monitor size={32} className="mb-3 opacity-30" />
        <p>Ei aktiivisia istuntoja.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {msg && (
        <p className="text-sm text-ok bg-ok/10 border border-ok/20 rounded-lg px-4 py-2.5">{msg}</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border bg-elevated",
              i === 0 ? "border-copper/30 bg-copper/5" : "border-wire"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface border border-wire shrink-0">
              <DeviceIcon hint={s.device_hint} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ink truncate">
                  {s.device_hint ?? "Tuntematon laite"}
                </p>
                {i === 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-copper/15 text-copper border border-copper/25 leading-none shrink-0">
                    Tämä laite
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-ghost">
                {s.ip_address && (
                  <span className="flex items-center gap-1">
                    <Globe size={11} /> {s.ip_address}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={11} /> Viimeksi {formatDate(s.last_seen)}
                </span>
              </div>
              <p className="text-xs text-ink-ghost mt-0.5">Kirjautunut {formatDate(s.created_at)}</p>
            </div>
            {i !== 0 && (
              <button
                onClick={() => revokeSession(s.id)}
                disabled={revoking === s.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-bad border border-bad/20 hover:bg-bad/5 transition-colors disabled:opacity-50 shrink-0"
              >
                <LogOut size={12} />
                {revoking === s.id ? "..." : "Kirjaudu ulos"}
              </button>
            )}
          </div>
        ))}
      </div>

      {sessions.length > 1 && (
        <button
          onClick={logoutOthers}
          disabled={logoutAllLoading}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-bad/30 text-bad text-sm font-medium hover:bg-bad/5 transition-colors disabled:opacity-50 mt-2"
        >
          <LogOut size={15} />
          {logoutAllLoading ? "Kirjaudutaan ulos..." : "Kirjaudu ulos kaikista muista laitteista"}
        </button>
      )}
    </div>
  );
}
