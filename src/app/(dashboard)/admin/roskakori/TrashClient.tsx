"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface TrashItem {
  id: string;
  entity_type: string;
  entity_label: string;
  label: string;
  deleted_at: string;
  deleted_by: string | null;
  deleted_by_name: string | null;
}

const ENTITY_TYPES = [
  { value: "", label: "Kaikki tyypit" },
  { value: "customers", label: "Asiakkaat / Liidit" },
  { value: "companies", label: "Yritykset" },
  { value: "quotes", label: "Tarjoukset" },
  { value: "projects", label: "Projektit" },
  { value: "invoices", label: "Laskut" },
  { value: "payments", label: "Maksut" },
  { value: "tasks", label: "Tehtävät" },
  { value: "calendar_events", label: "Kalenteritapahtumat" },
  { value: "project_files", label: "Tiedostot" },
  { value: "project_comments", label: "Kommentit" },
  { value: "notifications", label: "Ilmoitukset" },
  { value: "lead_requests", label: "Tarjouspyynnöt" },
  { value: "customer_notes", label: "Muistiinpanot" },
];

export function TrashClient() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [permanentTarget, setPermanentTarget] = useState<TrashItem | null>(
    null,
  );
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/admin/trash?${params.toString()}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Virhe");
      return;
    }
    setError("");
    setItems(data.items ?? []);
  }, [typeFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function restore(item: TrashItem) {
    setRestoring(item.id);
    const res = await fetch("/api/admin/trash/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type: item.entity_type, id: item.id }),
    });
    setRestoring(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Palautus epäonnistui");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function permanentlyDelete(item: TrashItem) {
    const res = await fetch("/api/admin/trash/permanent-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type: item.entity_type, id: item.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    // Permanently deleting a customer or project also purges its already-
    // trashed children in the database — reload the whole list rather than
    // just splicing this one row, or those children would linger as stale
    // ghost rows until the next search/filter change.
    if (item.entity_type === "customers" || item.entity_type === "projects") {
      await load();
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae roskakorista..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-bad mb-3">{error}</p>}

      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-ink-ghost">
            Ladataan...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-ghost">
            Roskakori on tyhjä
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Tyyppi
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Kohde
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">
                  Poistanut
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">
                  Poistettu
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {items.map((item) => (
                <tr
                  key={`${item.entity_type}-${item.id}`}
                  className="hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-surface text-ink-ghost border-wire">
                      {item.entity_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{item.label}</td>
                  <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                    {item.deleted_by_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-ghost hidden md:table-cell">
                    {new Date(item.deleted_at).toLocaleString("fi-FI")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => restore(item)}
                        disabled={restoring === item.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-wire text-xs text-ink-ghost hover:text-ok hover:border-ok/30 disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw size={12} />
                        Palauta
                      </button>
                      <button
                        onClick={() => setPermanentTarget(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-wire text-xs text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors"
                      >
                        <Trash2 size={12} />
                        Poista pysyvästi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {permanentTarget && (
        <ConfirmDialog
          title="Poista pysyvästi"
          message={`"${permanentTarget.label}" poistetaan pysyvästi tietokannasta. Tätä ei voi kumota.`}
          confirmLabel="Poista pysyvästi"
          danger
          onClose={() => setPermanentTarget(null)}
          onConfirm={() => permanentlyDelete(permanentTarget)}
        />
      )}
    </div>
  );
}
