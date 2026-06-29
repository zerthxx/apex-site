"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  created_at: string;
  companies?: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<string, string> = { active: "Aktiivinen", inactive: "Ei aktiivinen", lead: "Liidi" };
const STATUS_COLORS: Record<string, string> = {
  active: "bg-ok/10 text-ok border-ok/20",
  inactive: "bg-surface text-ink-ghost border-wire",
  lead: "bg-copper/10 text-copper border-copper/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function NewCustomerModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Customer) => void }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", status: "active", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name && !form.email) { setError("Nimi tai sähköposti vaaditaan"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/crm/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.customer);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi asiakas</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Etunimi</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Sukunimi</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Sähköposti</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Puhelin</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="active">Aktiivinen</option>
              <option value="lead">Liidi</option>
              <option value="inactive">Ei aktiivinen</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Muistiinpanot</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors">
              Peruuta
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Lisää asiakas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CustomersClient({ initial }: { initial: Customer[] }) {
  const [customers, setCustomers] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = customers.filter((c) => {
    const name = `${c.first_name ?? ""} ${c.last_name ?? ""} ${c.email ?? ""}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae asiakkaita..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
        >
          <option value="all">Kaikki tilat</option>
          <option value="active">Aktiivinen</option>
          <option value="lead">Liidi</option>
          <option value="inactive">Ei aktiivinen</option>
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0"
        >
          <Plus size={15} />
          Uusi asiakas
        </button>
      </div>

      {/* Table */}
      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-ghost text-sm">
            {search || statusFilter !== "all" ? "Ei hakutuloksia" : "Ei asiakkaita vielä"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Asiakas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Yritys</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Sähköposti</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Puhelin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Tila</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Luotu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/crm/asiakkaat/${c.id}`} className="font-medium text-ink hover:text-copper transition-colors">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                    {c.companies?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-ink-ghost hidden md:table-cell">
                    {new Date(c.created_at).toLocaleDateString("fi-FI")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <NewCustomerModal
          onClose={() => setShowModal(false)}
          onCreated={(c) => setCustomers((prev) => [c, ...prev])}
        />
      )}
    </div>
  );
}
