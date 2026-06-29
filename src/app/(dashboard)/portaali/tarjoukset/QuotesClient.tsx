"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  title: string;
  status: string;
  amount?: number | null;
  valid_until?: string | null;
  created_at: string;
  customers?: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  companies?: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Luonnos", sent: "Lähetetty", accepted: "Hyväksytty", rejected: "Hylätty",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-surface text-ink-ghost border-wire",
  sent: "bg-copper/10 text-copper border-copper/20",
  accepted: "bg-ok/10 text-ok border-ok/20",
  rejected: "bg-bad/10 text-bad border-bad/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function NewQuoteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (q: Quote) => void }) {
  const [form, setForm] = useState({ title: "", amount: "", valid_until: "", notes: "", status: "draft" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Otsikko vaaditaan"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: form.amount ? parseFloat(form.amount) : null,
        valid_until: form.valid_until || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.quote);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi tarjous</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Otsikko *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Summa (€)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Voimassa asti</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="draft">Luonnos</option>
              <option value="sent">Lähetetty</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Muistiinpanot</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Luo tarjous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  initial: Quote[];
  isStaff: boolean;
}

export function QuotesClient({ initial, isStaff }: Props) {
  const [quotes, setQuotes] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = quotes.filter((q) => {
    const text = `${q.title} ${q.customers?.email ?? ""} ${q.companies?.name ?? ""}`.toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function customerName(q: Quote) {
    if (!q.customers) return "—";
    const name = [q.customers.first_name, q.customers.last_name].filter(Boolean).join(" ");
    return name || q.customers.email || "—";
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hae tarjouksia..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
          <option value="all">Kaikki tilat</option>
          <option value="draft">Luonnos</option>
          <option value="sent">Lähetetty</option>
          <option value="accepted">Hyväksytty</option>
          <option value="rejected">Hylätty</option>
        </select>
        {isStaff && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0">
            <Plus size={15} />Uusi tarjous
          </button>
        )}
      </div>

      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-ink-ghost">
            {search || statusFilter !== "all" ? "Ei hakutuloksia" : "Ei tarjouksia vielä"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Otsikko</th>
                {isStaff && <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Asiakas</th>}
                {isStaff && <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Yritys</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Summa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Tila</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Voimassa asti</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Luotu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/portaali/tarjoukset/${q.id}`} className="font-medium text-ink hover:text-copper transition-colors">
                      {q.title}
                    </Link>
                  </td>
                  {isStaff && <td className="px-4 py-3 text-ink-dim hidden md:table-cell">{customerName(q)}</td>}
                  {isStaff && <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">{q.companies?.name ?? "—"}</td>}
                  <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                    {q.amount != null ? `${q.amount.toLocaleString("fi-FI")} €` : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-ink-ghost hidden lg:table-cell">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString("fi-FI") : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-ghost hidden md:table-cell">
                    {new Date(q.created_at).toLocaleDateString("fi-FI")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <NewQuoteModal
          onClose={() => setShowModal(false)}
          onCreated={(q) => setQuotes((prev) => [q, ...prev])}
        />
      )}
    </div>
  );
}
