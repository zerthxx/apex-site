"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

interface Company {
  id: string;
  name: string;
  business_id?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  created_at: string;
  contact_count?: number;
}

function NewCompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Company) => void }) {
  const [form, setForm] = useState({ name: "", business_id: "", email: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Yrityksen nimi vaaditaan"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/crm/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated({ ...data.company, contact_count: 0 });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi yritys</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Yrityksen nimi *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Y-tunnus</label>
              <input value={form.business_id} onChange={(e) => setForm({ ...form, business_id: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Kaupunki</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
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
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors">
              Peruuta
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Lisää yritys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CompaniesClient({ initial }: { initial: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = companies.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae yrityksiä..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0"
        >
          <Plus size={15} />Uusi yritys
        </button>
      </div>

      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-ghost text-sm">
            {search ? "Ei hakutuloksia" : "Ei yrityksiä vielä"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Yritys</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Y-tunnus</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Sähköposti</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Kaupunki</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Kontaktit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/crm/yritykset/${c.id}`} className="font-medium text-ink hover:text-copper transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden md:table-cell">{c.business_id ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">{c.city ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-dim">{c.contact_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <NewCompanyModal
          onClose={() => setShowModal(false)}
          onCreated={(c) => setCompanies((prev) => [c, ...prev])}
        />
      )}
    </div>
  );
}
