"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, LifeBuoy, User } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

type RecoveryRequest = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone_hint: string | null;
  description: string;
  status: "open" | "in_progress" | "resolved" | "rejected";
  resolution: string | null;
  created_at: string;
};

const STATUS_META: Record<
  RecoveryRequest["status"],
  { label: string; className: string }
> = {
  open: {
    label: "Avoin",
    className: "bg-orange-400/10 text-orange-300 border-orange-400/20",
  },
  in_progress: {
    label: "Käsittelyssä",
    className: "bg-copper/10 text-copper border-copper/20",
  },
  resolved: {
    label: "Ratkaistu",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  rejected: {
    label: "Hylätty",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export function RecoveryRequestsClient({
  initialRequests,
  canModerate,
}: {
  initialRequests: RecoveryRequest[];
  canModerate: boolean;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({
    status: "in_progress",
    resolution: "",
    reason: "",
  });
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(id: string) {
    setError(null);
    setWorking(true);
    const res = await fetch("/api/admin/recovery-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: form.status,
        resolution: form.resolution || undefined,
        reason: form.reason,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setWorking(false);
    if (!res.ok) {
      setError(data.error ?? "Päivitys epäonnistui");
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: form.status as RecoveryRequest["status"],
              resolution: form.resolution || r.resolution,
            }
          : r,
      ),
    );
    setOpenId(null);
    setForm({ status: "in_progress", resolution: "", reason: "" });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink flex items-center gap-2.5">
          <LifeBuoy size={19} className="text-copper" />
          Tilin palautuspyynnöt
        </h1>
        <p className="text-sm text-ink-dim mt-1">
          Kadonneen puhelimen tukipyynnöt. Varmista henkilöllisyys huolellisesti
          ennen numeron vaihtoa käyttäjän hallintasivulta.
        </p>
      </div>

      {requests.length === 0 && (
        <div className="rounded-2xl bg-surface/50 border border-wire p-10 text-center text-sm text-ink-ghost">
          Ei palautuspyyntöjä.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {requests.map((r) => {
          const meta = STATUS_META[r.status];
          const isOpen = openId === r.id;
          return (
            <div
              key={r.id}
              className="rounded-2xl bg-surface/50 border border-wire p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-ink-ghost truncate">
                    {r.email}
                    {r.phone_hint ? ` · vanha numero: ${r.phone_hint}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.className}`}
                >
                  {meta.label}
                </span>
                <span className="text-[11px] text-ink-ghost">
                  {new Date(r.created_at).toLocaleString("fi-FI")}
                </span>
              </div>

              <p className="text-xs text-ink-dim mt-3 whitespace-pre-wrap">
                {r.description}
              </p>
              {r.resolution && (
                <p className="text-[11px] text-ink-ghost mt-2">
                  Ratkaisu: {r.resolution}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {r.user_id && (
                  <Link
                    href={`/admin/kayttajat/${r.user_id}`}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-copper/30 text-copper hover:bg-copper/5 transition-colors"
                  >
                    <User size={12} /> Avaa käyttäjä
                  </Link>
                )}
                {canModerate && !isOpen && r.status !== "resolved" && (
                  <button
                    onClick={() => {
                      setOpenId(r.id);
                      setForm({
                        status: "in_progress",
                        resolution: "",
                        reason: "",
                      });
                      setError(null);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-wire text-ink hover:border-copper/40 transition-colors"
                  >
                    Käsittele
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-wire/50 flex flex-col gap-3">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="in_progress">Käsittelyssä</option>
                      <option value="resolved">Ratkaistu</option>
                      <option value="rejected">Hylätty</option>
                      <option value="open">Avoin</option>
                    </select>
                    <input
                      value={form.resolution}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, resolution: e.target.value }))
                      }
                      placeholder="Ratkaisu (esim. numero vaihdettu)"
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reason: e.target.value }))
                    }
                    placeholder="Perustelu auditlokiin (pakollinen, esim. miten henkilöllisyys varmistettiin) *"
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                  {error && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle size={15} className="shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => update(r.id)}
                      disabled={working || form.reason.trim().length < 5}
                      className="flex-1 py-2.5 rounded-lg bg-copper text-[#0A0C10] text-xs font-semibold hover:bg-copper-light transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={13} />
                      {working
                        ? "Tallennetaan..."
                        : "Tallenna ja kirjaa auditlokiin"}
                    </button>
                    <button
                      onClick={() => setOpenId(null)}
                      disabled={working}
                      className="px-3.5 py-2.5 rounded-lg bg-surface border border-wire text-xs text-ink-dim hover:border-copper/40 transition-colors"
                    >
                      Peruuta
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
