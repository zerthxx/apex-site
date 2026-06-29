"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Copy, Check, Key } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fi-FI");
}

export default function ApiAvaimetPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, last_used_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setKeys(data ?? []);
    setLoading(false);
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError("");

    const res = await fetch("/api/account/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    setCreatedKey(data.key);
    setNewKeyName("");
    setKeys((prev) => [data.record, ...prev]);
  }

  async function deleteKey(id: string) {
    if (!confirm("Poista API-avain?")) return;
    await supabase.from("api_keys").delete().eq("id", id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface border border-wire">
        <Key size={15} className="text-ink-ghost mt-0.5 shrink-0" />
        <p className="text-xs text-ink-ghost">API-avaimet mahdollistavat Apex Siten integroinnin omiin sovelluksiisi. Avainta ei näytetä uudelleen luomisen jälkeen — tallenna se turvallisesti.</p>
      </div>

      <form onSubmit={createKey} className="flex gap-2">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Avaimen nimi (esim. Tuotantopalvelin)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-wire text-ink text-sm placeholder:text-ink-ghost focus:outline-none focus:border-copper/50 transition-colors"
        />
        <button type="submit" disabled={creating || !newKeyName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors shrink-0">
          <Plus size={15} /> Luo avain
        </button>
      </form>
      {error && <p className="text-xs text-bad -mt-3">{error}</p>}

      {createdKey && (
        <div className="p-4 rounded-xl bg-ok/10 border border-ok/30">
          <p className="text-xs font-semibold text-ok mb-2">Uusi API-avain luotu — kopioi se nyt!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-surface border border-wire rounded-lg px-3 py-2 text-ink font-mono truncate">{createdKey}</code>
            <button onClick={copy} className="p-2 rounded-lg bg-surface border border-wire text-ink-ghost hover:text-ink transition-colors shrink-0">
              {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-ink-ghost hover:text-ink mt-2 transition-colors">Sulje</button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {loading && <p className="text-sm text-ink-ghost text-center py-6">Ladataan...</p>}
        {!loading && keys.length === 0 && (
          <p className="text-sm text-ink-ghost text-center py-6">Ei API-avaimia. Luo ensimmäinen avain yllä.</p>
        )}
        {keys.map((key) => (
          <div key={key.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-wire bg-surface/30">
            <Key size={14} className="text-copper shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{key.name}</p>
              <p className="text-xs text-ink-ghost mt-0.5 font-mono">{key.key_prefix}••••••••</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-ink-ghost">Luotu {formatDate(key.created_at)}</p>
              {key.last_used_at && <p className="text-xs text-ink-ghost">Käytetty {formatDate(key.last_used_at)}</p>}
            </div>
            <button onClick={() => deleteKey(key.id)} className="p-1.5 rounded-lg text-ink-ghost hover:text-bad hover:bg-bad/5 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
