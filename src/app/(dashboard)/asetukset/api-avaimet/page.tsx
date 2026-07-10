"use client";

import { useEffect, useState } from "react";
import { Ban, Check, Copy, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  ConfirmDialog,
  EmptyState,
  SettingsButton,
  SettingsField,
  SettingsSection,
  StatusBanner,
  settingsInputClass,
} from "@/components/settings/SettingsKit";

interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

type PendingAction = {
  type: "revoke" | "rotate" | "delete";
  key: ApiKey;
} | null;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fi-FI");
}

function keyStatus(key: ApiKey): { label: string; className: string } {
  if (key.revoked_at) {
    return {
      label: "Peruttu",
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    };
  }
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return {
      label: "Vanhentunut",
      className: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    };
  }
  return {
    label: "Aktiivinen",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  };
}

export default function ApiAvaimetPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    expiresInDays: "",
  });
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/account/api-keys")
      .then((r) => r.json())
      .then(({ keys }) => setKeys(keys ?? []))
      .finally(() => setLoading(false));
  }, []);

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/account/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        expiresInDays: form.expiresInDays ? Number(form.expiresInDays) : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      showStatus("error", data.error ?? "Avaimen luonti epäonnistui.");
      return;
    }
    setCreatedKey(data.key);
    setKeys((prev) => [data.record, ...prev]);
    setForm({ name: "", description: "", expiresInDays: "" });
  }

  async function runPending() {
    if (!pending) return;
    setActionLoading(true);
    const { type, key } = pending;

    const res =
      type === "delete"
        ? await fetch("/api/account/api-keys", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: key.id }),
          })
        : await fetch("/api/account/api-keys", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: key.id, action: type }),
          });
    const data = await res.json().catch(() => ({}));
    setActionLoading(false);
    setPending(null);
    if (!res.ok) {
      showStatus("error", data.error ?? "Toiminto epäonnistui.");
      return;
    }

    if (type === "delete") {
      setKeys((prev) => prev.filter((k) => k.id !== key.id));
      showStatus("success", "Avain poistettu.");
    } else if (type === "revoke") {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === key.id ? { ...k, revoked_at: new Date().toISOString() } : k,
        ),
      );
      showStatus("success", "Avain peruttu — se ei enää toimi.");
    } else {
      // rotate: new record in, old one marked revoked, new secret shown once
      setCreatedKey(data.key);
      setKeys((prev) => [
        data.record,
        ...prev.map((k) =>
          k.id === key.id ? { ...k, revoked_at: new Date().toISOString() } : k,
        ),
      ]);
      showStatus("success", "Avain kierrätetty — kopioi uusi avain nyt.");
    }
  }

  function copy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {status && <StatusBanner type={status.type} message={status.message} />}

      <SettingsSection
        icon={Key}
        title="Luo uusi API-avain"
        description="Avaimella voit integroida Apex Siten omiin sovelluksiisi. Avain näytetään vain kerran luonnin jälkeen."
      >
        <form onSubmit={createKey} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsField label="Nimi" htmlFor="key-name">
              <input
                id="key-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="esim. Tuotantopalvelin"
                maxLength={100}
                className={settingsInputClass}
              />
            </SettingsField>
            <SettingsField label="Vanheneminen" htmlFor="key-expiry">
              <select
                id="key-expiry"
                value={form.expiresInDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresInDays: e.target.value }))
                }
                className={settingsInputClass}
              >
                <option value="">Ei vanhene</option>
                <option value="30">30 päivää</option>
                <option value="90">90 päivää</option>
                <option value="365">1 vuosi</option>
              </select>
            </SettingsField>
          </div>
          <SettingsField
            label="Kuvaus (valinnainen)"
            htmlFor="key-description"
            helper="Mihin avainta käytetään — auttaa tunnistamaan avaimen myöhemmin."
          >
            <input
              id="key-description"
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="esim. Verkkokaupan tilausintegraatio"
              maxLength={200}
              className={settingsInputClass}
            />
          </SettingsField>
          <SettingsButton
            type="submit"
            loading={creating}
            loadingLabel="Luodaan..."
            disabled={!form.name.trim()}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Luo avain
          </SettingsButton>
        </form>

        {createdKey && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-xs font-semibold text-green-400 mb-2">
              Uusi API-avain — kopioi se nyt, sitä ei näytetä uudelleen!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-surface border border-wire rounded-lg px-3 py-2 text-ink font-mono truncate">
                {createdKey}
              </code>
              <button
                onClick={copy}
                aria-label="Kopioi avain"
                className="p-2 rounded-lg bg-surface border border-wire text-ink-ghost hover:text-ink transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <button
              onClick={() => setCreatedKey(null)}
              className="text-xs text-ink-ghost hover:text-ink mt-2 transition-colors cursor-pointer"
            >
              Olen tallentanut avaimen — sulje
            </button>
          </div>
        )}
      </SettingsSection>

      <SettingsSection icon={Key} title={`Avaimet (${keys.length})`}>
        {loading ? (
          <p className="text-sm text-ink-ghost text-center py-6">Ladataan...</p>
        ) : keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="Ei API-avaimia"
            description="Luo ensimmäinen avain yllä olevalla lomakkeella."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {keys.map((key) => {
              const st = keyStatus(key);
              const active = !key.revoked_at;
              return (
                <div
                  key={key.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl border border-wire bg-surface/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-ink">{key.name}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    {key.description && (
                      <p className="text-xs text-ink-ghost mt-0.5">
                        {key.description}
                      </p>
                    )}
                    <p className="text-xs text-ink-ghost mt-0.5 font-mono">
                      {key.key_prefix}••••••••
                    </p>
                    <p className="text-[11px] text-ink-ghost mt-1">
                      Luotu {formatDate(key.created_at)} · Käytetty{" "}
                      {formatDate(key.last_used_at)}
                      {key.expires_at
                        ? ` · Vanhenee ${formatDate(key.expires_at)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {active && (
                      <>
                        <button
                          onClick={() => setPending({ type: "rotate", key })}
                          title="Kierrätä avain (uusi salaisuus, vanha perutaan)"
                          className="p-2 rounded-lg text-ink-ghost hover:text-copper hover:bg-copper/5 border border-wire transition-colors cursor-pointer"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          onClick={() => setPending({ type: "revoke", key })}
                          title="Peru avain"
                          className="p-2 rounded-lg text-ink-ghost hover:text-orange-300 hover:bg-orange-400/5 border border-wire transition-colors cursor-pointer"
                        >
                          <Ban size={13} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPending({ type: "delete", key })}
                      title="Poista avain"
                      className="p-2 rounded-lg text-ink-ghost hover:text-red-400 hover:bg-red-500/5 border border-wire transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsSection>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.type === "delete"
            ? `Poista avain "${pending.key.name}"?`
            : pending?.type === "revoke"
              ? `Peru avain "${pending?.key.name}"?`
              : `Kierrätä avain "${pending?.key.name}"?`
        }
        description={
          pending?.type === "delete"
            ? "Avain poistetaan pysyvästi. Sitä käyttävät integraatiot lakkaavat toimimasta heti."
            : pending?.type === "revoke"
              ? "Avain lakkaa toimimasta heti, mutta jää näkyviin listaan. Tätä ei voi perua."
              : "Avaimelle luodaan uusi salaisuus ja vanha perutaan heti. Päivitä uusi avain integraatioihisi."
        }
        confirmLabel={
          pending?.type === "delete"
            ? "Poista pysyvästi"
            : pending?.type === "revoke"
              ? "Peru avain"
              : "Kierrätä avain"
        }
        danger={pending?.type !== "rotate"}
        loading={actionLoading}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
