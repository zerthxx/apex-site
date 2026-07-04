"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X, Edit2, Trash2, Check } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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

type CompanyForm = {
  name: string;
  business_id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

function CompanyModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: CompanyForm;
  onClose: () => void;
  onSave: (form: CompanyForm) => Promise<void>;
}) {
  const [form, setForm] = useState<CompanyForm>(
    initial ?? {
      name: "",
      business_id: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError("Yrityksen nimi vaaditaan");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Virhe");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={17} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Yrityksen nimi *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Y-tunnus
              </label>
              <input
                value={form.business_id}
                onChange={(e) =>
                  setForm({ ...form, business_id: e.target.value })
                }
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Kaupunki
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Sähköposti
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Puhelin</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors"
            >
              Peruuta
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Tallennetaan..." : "Tallenna"}
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
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const filtered = companies.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  async function createCompany(form: CompanyForm) {
    const res = await fetch("/api/crm/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Virhe");
    setCompanies((prev) => [{ ...data.company, contact_count: 0 }, ...prev]);
  }

  async function updateCompany(id: string, form: CompanyForm) {
    const res = await fetch("/api/crm/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Virhe");
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data.company } : c)),
    );
  }

  async function deleteCompany(id: string) {
    const res = await fetch("/api/crm/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setDeleteSuccess("Yritys siirretty roskakoriin");
    setTimeout(() => setDeleteSuccess(""), 3000);
  }

  const editingCompany = companies.find((c) => c.id === editingId);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae yrityksiä..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
          />
        </div>
        {deleteSuccess && (
          <span className="flex items-center gap-1 text-xs text-ok">
            <Check size={12} />
            {deleteSuccess}
          </span>
        )}
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0"
        >
          <Plus size={15} />
          Uusi yritys
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Yritys
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">
                  Y-tunnus
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">
                  Sähköposti
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">
                  Kaupunki
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Kontaktit
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/crm/yritykset/${c.id}`}
                      className="font-medium text-ink hover:text-copper transition-colors"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                    {c.business_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-dim hidden lg:table-cell">
                    {c.city ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-dim">
                    {c.contact_count ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="p-1.5 rounded-md text-ink-ghost hover:text-ink hover:bg-surface transition-colors"
                        title="Muokkaa"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
                        className="p-1.5 rounded-md text-ink-ghost hover:text-bad hover:bg-bad/5 transition-colors"
                        title="Poista"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <CompanyModal
          title="Uusi yritys"
          onClose={() => setShowNew(false)}
          onSave={createCompany}
        />
      )}

      {editingId && editingCompany && (
        <CompanyModal
          title="Muokkaa yritystä"
          initial={{
            name: editingCompany.name,
            business_id: editingCompany.business_id ?? "",
            email: editingCompany.email ?? "",
            phone: editingCompany.phone ?? "",
            address: "",
            city: editingCompany.city ?? "",
          }}
          onClose={() => setEditingId(null)}
          onSave={(form) => updateCompany(editingId, form)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message={`Yritys "${companies.find((c) => c.id === deleteConfirm)?.name}" siirretään roskakoriin. Vain omistaja voi palauttaa tai poistaa sen pysyvästi.`}
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => deleteCompany(deleteConfirm)}
        />
      )}
    </div>
  );
}
