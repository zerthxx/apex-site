"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  Ban,
  CheckCircle,
  History,
  KeyRound,
  LifeBuoy,
  Lock,
  LockOpen,
  Monitor,
  ScrollText,
  ShieldAlert,
} from "lucide-react";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { EVENT_LABELS } from "@/lib/supabase/activityLog";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

type Detail = {
  user: {
    id: string;
    email: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    provider: string;
    has_password: boolean;
  };
  profile: {
    role: string;
    is_suspended: boolean;
    is_locked: boolean;
    locked_reason: string | null;
    locked_at: string | null;
    force_password_reset: boolean;
    email_verified: boolean;
    email_verified_at: string | null;
    phone: string | null;
    phone_verified: boolean;
    phone_verified_at: string | null;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
  } | null;
  sessions: {
    id: string;
    device_hint: string | null;
    ip_address: string | null;
    last_seen: string;
    created_at: string;
    logged_out_at: string | null;
  }[];
  activity: {
    id: string;
    event_type: string;
    ip_address: string | null;
    created_at: string;
  }[];
  recoveryHistory: {
    id: string;
    purpose: string;
    channel: string;
    target: string;
    attempts: number;
    used_at: string | null;
    created_at: string;
  }[];
  auditLog: {
    id: string;
    admin_email: string;
    action: string;
    old_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
    reason: string;
    support_ticket_id: string | null;
    screenshot_url: string | null;
    created_at: string;
  }[];
  recoveryRequests: {
    id: string;
    status: string;
    description: string;
    created_at: string;
  }[];
};

type ActionId =
  | "change_email"
  | "change_phone"
  | "force_password_reset"
  | "lock"
  | "unlock"
  | "suspend"
  | "unsuspend";

const ACTION_META: Record<
  ActionId,
  { label: string; description: string; danger?: boolean }
> = {
  change_email: {
    label: "Vaihda sähköposti",
    description:
      "Korvaa tilin sähköpostiosoitteen välittömästi. Kaikki istunnot kirjataan ulos.",
  },
  change_phone: {
    label: "Vaihda puhelinnumero",
    description:
      "Asettaa uuden numeron vahvistamattomana ja lähettää siihen vahvistuskoodin tekstiviestillä.",
  },
  force_password_reset: {
    label: "Pakota salasanan vaihto",
    description:
      "Kirjaa käyttäjän ulos kaikilta laitteilta ja vaatii uuden salasanan ennen käytön jatkamista.",
    danger: true,
  },
  lock: {
    label: "Lukitse tili",
    description:
      "Estää tilin käytön turvalukituksella, kunnes lukitus poistetaan.",
    danger: true,
  },
  unlock: {
    label: "Poista lukitus",
    description: "Palauttaa lukitun tilin käyttöön.",
  },
  suspend: {
    label: "Jäädytä tili",
    description:
      "Estää tilin käytön toistaiseksi (ei-turvallisuusperusteinen esto).",
    danger: true,
  },
  unsuspend: {
    label: "Poista jäädytys",
    description: "Palauttaa jäädytetyn tilin käyttöön.",
  },
};

function fmt(date: string | null | undefined) {
  return date ? new Date(date).toLocaleString("fi-FI") : "—";
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface/50 border border-wire p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-copper">{icon}</span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatusPill({
  ok,
  okLabel,
  badLabel,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
}) {
  return ok ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
      <CheckCircle size={11} /> {okLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-400/10 text-orange-300 border border-orange-400/20">
      <AlertCircle size={11} /> {badLabel}
    </span>
  );
}

export function UserDetailClient({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId: string;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [action, setAction] = useState<ActionId | null>(null);
  const [form, setForm] = useState({
    reason: "",
    supportTicketId: "",
    screenshotUrl: "",
    newEmail: "",
    newPhone: "",
  });
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(
    () =>
      fetch(`/api/admin/users/${userId}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setLoadError(data.error ?? "Lataus epäonnistui");
            return;
          }
          setDetail(data);
        })
        .catch(() => setLoadError("Lataus epäonnistui")),
    [userId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction() {
    if (!action) return;
    setActionError(null);
    setWorking(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        reason: form.reason,
        supportTicketId: form.supportTicketId || undefined,
        screenshotUrl: form.screenshotUrl || undefined,
        newEmail: action === "change_email" ? form.newEmail : undefined,
        newPhone: action === "change_phone" ? form.newPhone : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setWorking(false);
    if (!res.ok) {
      setActionError(data.error ?? "Toiminto epäonnistui");
      return;
    }
    setFlash(
      `${ACTION_META[action].label} — suoritettu ja kirjattu auditlokiin.`,
    );
    setTimeout(() => setFlash(null), 6000);
    setAction(null);
    setForm({
      reason: "",
      supportTicketId: "",
      screenshotUrl: "",
      newEmail: "",
      newPhone: "",
    });
    load();
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-bad">{loadError}</p>
        <Link
          href="/admin/kayttajat"
          className="text-sm text-copper hover:underline mt-2 inline-block"
        >
          ← Takaisin käyttäjiin
        </Link>
      </div>
    );
  }

  if (!detail) {
    return <div className="p-6 text-sm text-ink-ghost">Ladataan…</div>;
  }

  const { user, profile } = detail;
  const isSelf = userId === currentUserId;
  const name =
    profile?.first_name || profile?.last_name
      ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
      : (user.email ?? "—");

  const availableActions: ActionId[] = [
    "change_email",
    "change_phone",
    "force_password_reset",
    profile?.is_locked ? "unlock" : "lock",
    profile?.is_suspended ? "unsuspend" : "suspend",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/admin/kayttajat"
          className="inline-flex items-center gap-1.5 text-xs text-ink-ghost hover:text-copper transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Kaikki käyttäjät
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-ink">{name}</h1>
          <RoleBadge role={profile?.role ?? "customer"} />
          {profile?.is_locked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <Lock size={11} /> Lukittu
            </span>
          )}
          {profile?.is_suspended && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <Ban size={11} /> Jäädytetty
            </span>
          )}
          {profile?.force_password_reset && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-400/10 text-orange-300 border border-orange-400/20">
              <KeyRound size={11} /> Salasanan vaihto vaadittu
            </span>
          )}
        </div>
        <p className="text-sm text-ink-ghost mt-1">
          {user.email} · Rekisteröitynyt {fmt(user.created_at)} · Viimeisin
          kirjautuminen {fmt(user.last_sign_in_at)}
        </p>
      </div>

      {flash && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-green-500/10 border border-green-500/20 text-green-400">
          <CheckCircle size={15} /> {flash}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card icon={<AtSign size={15} />} title="Vahvistukset">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink truncate">{user.email}</p>
                <p className="text-[11px] text-ink-ghost">
                  Vahvistettu: {fmt(profile?.email_verified_at)}
                </p>
              </div>
              <StatusPill
                ok={profile?.email_verified ?? false}
                okLabel="Vahvistettu"
                badLabel="Vahvistamaton"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink truncate">
                  {profile?.phone ?? "Ei puhelinnumeroa"}
                </p>
                <p className="text-[11px] text-ink-ghost">
                  Vahvistettu: {fmt(profile?.phone_verified_at)}
                </p>
              </div>
              <StatusPill
                ok={profile?.phone_verified ?? false}
                okLabel="Vahvistettu"
                badLabel="Vahvistamaton"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink">Salasana</p>
              <StatusPill
                ok={user.has_password}
                okLabel="Asetettu"
                badLabel="Ei asetettu"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-ink">Kirjautumistapa</p>
              <span className="text-xs text-ink-ghost">{user.provider}</span>
            </div>
            {profile?.is_locked && (
              <div className="px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-300">
                Lukittu {fmt(profile.locked_at)}: {profile.locked_reason ?? "—"}
              </div>
            )}
          </div>
        </Card>

        <Card icon={<ShieldAlert size={15} />} title="Tukitoiminnot">
          {isSelf ? (
            <p className="text-xs text-ink-ghost">
              Et voi kohdistaa tukitoimintoja omaan tiliisi.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableActions.map((a) => {
                const meta = ACTION_META[a];
                return (
                  <button
                    key={a}
                    onClick={() => {
                      setAction(a);
                      setActionError(null);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      meta.danger
                        ? "border-red-500/20 text-red-300 hover:bg-red-500/5"
                        : "border-wire text-ink hover:border-copper/40"
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-ink-ghost mt-3">
            Jokainen toiminto vaatii perustelun ja kirjataan auditlokiin (admin,
            kohde, vanha ja uusi arvo, aika, IP).
          </p>
        </Card>
      </div>

      <Card
        icon={<Monitor size={15} />}
        title={`Laitteet ja istunnot (${detail.sessions.length})`}
      >
        {detail.sessions.length === 0 ? (
          <p className="text-xs text-ink-ghost">Ei kirjattuja istuntoja.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-wire/50 text-sm">
            {detail.sessions.map((s) => (
              <li
                key={s.id}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-ink text-xs">
                    {s.device_hint ?? "Tuntematon laite"}
                  </p>
                  <p className="text-[11px] text-ink-ghost">
                    {s.ip_address ?? "—"} · {fmt(s.created_at)}
                  </p>
                </div>
                {s.logged_out_at ? (
                  <span className="text-[11px] text-ink-ghost">
                    Kirjautunut ulos
                  </span>
                ) : (
                  <span className="text-[11px] text-green-400">Aktiivinen</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card
          icon={<History size={15} />}
          title="Kirjautumis- ja tapahtumahistoria"
        >
          {detail.activity.length === 0 ? (
            <p className="text-xs text-ink-ghost">Ei tapahtumia.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-wire/50 max-h-80 overflow-y-auto">
              {detail.activity.map((a) => (
                <li key={a.id} className="py-2">
                  <p className="text-xs text-ink">
                    {EVENT_LABELS[a.event_type] ?? a.event_type}
                  </p>
                  <p className="text-[11px] text-ink-ghost">
                    {fmt(a.created_at)}
                    {a.ip_address ? ` · ${a.ip_address}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card icon={<LifeBuoy size={15} />} title="Palautushistoria">
          {detail.recoveryHistory.length === 0 ? (
            <p className="text-xs text-ink-ghost">
              Ei palautus- tai vahvistustapahtumia.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-wire/50 max-h-80 overflow-y-auto">
              {detail.recoveryHistory.map((r) => (
                <li
                  key={r.id}
                  className="py-2 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs text-ink">
                      {r.purpose} · {r.channel} · {r.target}
                    </p>
                    <p className="text-[11px] text-ink-ghost">
                      {fmt(r.created_at)} · {r.attempts} yritystä
                    </p>
                  </div>
                  {r.used_at ? (
                    <span className="text-[11px] text-green-400">Käytetty</span>
                  ) : (
                    <span className="text-[11px] text-ink-ghost">
                      Käyttämätön
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {detail.recoveryRequests.length > 0 && (
            <div className="mt-3 pt-3 border-t border-wire/50">
              <p className="text-[11px] font-medium text-ink-dim mb-2">
                Tukipyynnöt
              </p>
              {detail.recoveryRequests.map((r) => (
                <p key={r.id} className="text-[11px] text-ink-ghost">
                  {fmt(r.created_at)} · {r.status} —{" "}
                  <Link
                    href="/admin/palautuspyynnot"
                    className="text-copper hover:underline"
                  >
                    avaa jono
                  </Link>
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        icon={<ScrollText size={15} />}
        title={`Auditloki (${detail.auditLog.length})`}
      >
        {detail.auditLog.length === 0 ? (
          <p className="text-xs text-ink-ghost">
            Ei admin-toimenpiteitä tälle tilille.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-wire/50 max-h-96 overflow-y-auto">
            {detail.auditLog.map((a) => (
              <li key={a.id} className="py-2.5">
                <p className="text-xs text-ink font-medium">
                  {ACTION_META[a.action as ActionId]?.label ?? a.action}
                  <span className="text-ink-ghost font-normal">
                    {" "}
                    — {a.admin_email}
                  </span>
                </p>
                <p className="text-[11px] text-ink-ghost mt-0.5">
                  {fmt(a.created_at)} · Perustelu: {a.reason}
                  {a.support_ticket_id
                    ? ` · Tiketti: ${a.support_ticket_id}`
                    : ""}
                </p>
                {(a.old_value || a.new_value) && (
                  <p className="text-[11px] text-ink-ghost mt-0.5 font-mono break-all">
                    {a.old_value ? JSON.stringify(a.old_value) : "—"} →{" "}
                    {a.new_value ? JSON.stringify(a.new_value) : "—"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ---- Confirmation modal ---- */}
      {action && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/90 backdrop-blur-sm p-6">
          <div className="max-w-md w-full rounded-2xl bg-surface border border-wire p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {ACTION_META[action].danger ? (
                <ShieldAlert size={18} className="text-red-400" />
              ) : (
                <LockOpen size={18} className="text-copper" />
              )}
              <h3 className="text-base font-semibold text-ink">
                {ACTION_META[action].label}
              </h3>
            </div>
            <p className="text-xs text-ink-ghost">
              {ACTION_META[action].description}
            </p>

            {action === "change_email" && (
              <input
                type="email"
                value={form.newEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, newEmail: e.target.value }))
                }
                placeholder="Uusi sähköpostiosoite *"
                className={inputClass}
              />
            )}
            {action === "change_phone" && (
              <input
                type="tel"
                value={form.newPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, newPhone: e.target.value }))
                }
                placeholder="Uusi puhelinnumero (esim. +358 40 123 4567) *"
                className={inputClass}
              />
            )}
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              placeholder="Perustelu (pakollinen, kirjataan auditlokiin) *"
              rows={2}
              className={`${inputClass} resize-none`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.supportTicketId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supportTicketId: e.target.value }))
                }
                placeholder="Tiketin ID (valinnainen)"
                className={inputClass}
              />
              <input
                type="url"
                value={form.screenshotUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, screenshotUrl: e.target.value }))
                }
                placeholder="Kuvakaappaus-URL (valinn.)"
                className={inputClass}
              />
            </div>

            {actionError && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                {actionError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={runAction}
                disabled={
                  working ||
                  form.reason.trim().length < 5 ||
                  (action === "change_email" && !form.newEmail) ||
                  (action === "change_phone" && !form.newPhone)
                }
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${
                  ACTION_META[action].danger
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-copper text-[#0A0C10] hover:bg-copper-light"
                }`}
              >
                {working
                  ? "Suoritetaan..."
                  : `Vahvista: ${ACTION_META[action].label}`}
              </button>
              <button
                onClick={() => setAction(null)}
                disabled={working}
                className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink-dim hover:border-copper/40 transition-colors"
              >
                Peruuta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
