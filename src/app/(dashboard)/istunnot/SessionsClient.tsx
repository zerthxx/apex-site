"use client";

import { useState } from "react";
import {
  Clock,
  Globe,
  LogOut,
  MapPin,
  Monitor,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ConfirmDialog,
  EmptyState,
  StatusBanner,
} from "@/components/settings/SettingsKit";

interface Session {
  id: string;
  device_hint: string | null;
  ip_address: string | null;
  country_code: string | null;
  city: string | null;
  created_at: string;
  last_seen: string;
}

function formatDate(str: string) {
  return new Date(str).toLocaleString("fi-FI", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function locationLabel(s: Session): string | null {
  if (s.city && s.country_code) return `${s.city}, ${s.country_code}`;
  return s.city ?? s.country_code;
}

function DeviceIcon({ hint }: { hint?: string | null }) {
  const h = (hint ?? "").toLowerCase();
  if (h.includes("ios") || h.includes("android")) {
    return <Smartphone size={17} className="text-ink-dim" />;
  }
  return <Monitor size={17} className="text-ink-dim" />;
}

function SessionRow({
  session,
  isCurrent,
  onRevoke,
  revoking,
}: {
  session: Session;
  isCurrent: boolean;
  onRevoke?: () => void;
  revoking?: boolean;
}) {
  const location = locationLabel(session);
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border bg-elevated",
        isCurrent ? "border-copper/30 bg-copper/5" : "border-wire",
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface border border-wire shrink-0">
        <DeviceIcon hint={session.device_hint} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink truncate">
            {session.device_hint ?? "Tuntematon laite"}
          </p>
          {isCurrent && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-copper/15 text-copper border border-copper/25 leading-none shrink-0">
              Tämä laite
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-ink-ghost">
          {session.ip_address && (
            <span className="flex items-center gap-1">
              <Globe size={11} /> {session.ip_address}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} /> Viimeksi {formatDate(session.last_seen)}
          </span>
        </div>
        <p className="text-xs text-ink-ghost mt-0.5">
          Kirjautunut {formatDate(session.created_at)}
        </p>
      </div>
      {onRevoke && (
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-bad border border-bad/20 hover:bg-bad/5 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <LogOut size={12} />
          {revoking ? "..." : "Kirjaudu ulos"}
        </button>
      )}
    </div>
  );
}

export function SessionsClient({
  sessions: initial,
  currentSessionId,
}: {
  sessions: Session[];
  currentSessionId: string | null;
}) {
  const [sessions, setSessions] = useState(initial);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const current = sessions.find((s) => s.id === currentSessionId) ?? null;
  const others = sessions.filter((s) => s.id !== currentSessionId);

  async function logoutOthers() {
    setLogoutAllLoading(true);
    setMsg("");
    const res = await fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoutOthers: true }),
    });
    setLogoutAllLoading(false);
    setLogoutAllOpen(false);
    if (res.ok) {
      setSessions((s) => (current ? s.filter((x) => x.id === current.id) : []));
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
      <EmptyState
        icon={Monitor}
        title="Ei aktiivisia istuntoja"
        description="Istunnot kirjataan tähän seuraavan kirjautumisen yhteydessä."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {msg && <StatusBanner type="success" message={msg} />}

      {current && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-dim">Nykyinen laite</p>
          <SessionRow session={current} isCurrent />
        </div>
      )}

      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-dim">
            Muut istunnot ({others.length})
          </p>
          <div className="flex flex-col gap-3">
            {others.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                isCurrent={false}
                onRevoke={() => revokeSession(s.id)}
                revoking={revoking === s.id}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <button
          onClick={() => setLogoutAllOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-bad/30 text-bad text-sm font-medium hover:bg-bad/5 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Kirjaudu ulos kaikista muista laitteista
        </button>
      )}

      <ConfirmDialog
        open={logoutAllOpen}
        title="Kirjaa ulos muut laitteet?"
        description="Kaikki muut istunnot päätetään välittömästi. Tämä laite pysyy kirjautuneena. Jos epäilet tilisi joutuneen vääriin käsiin, vaihda myös salasanasi."
        confirmLabel="Kirjaa ulos muut laitteet"
        danger
        loading={logoutAllLoading}
        onConfirm={logoutOthers}
        onCancel={() => setLogoutAllOpen(false)}
      />
    </div>
  );
}
