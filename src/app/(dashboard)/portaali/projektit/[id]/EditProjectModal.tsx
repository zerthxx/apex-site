"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  PROJECT_STATUS_LABELS,
  type Customer,
  type Project,
  type StaffMember,
} from "./types";

export function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: project.name,
    customer_id: project.customers?.id ?? "",
    assigned_to: project.assigned_to ?? "",
    status: project.status,
    deadline: project.deadline ? project.deadline.slice(0, 10) : "",
    budget: project.budget != null ? String(project.budget) : "",
    progress_pct: project.progress_pct,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/crm/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false));
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.staff ?? []))
      .catch(() => {})
      .finally(() => setLoadingStaff(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id,
        name: form.name,
        customer_id: form.customer_id || null,
        assigned_to: form.assigned_to || null,
        status: form.status,
        deadline: form.deadline || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        progress_pct: form.progress_pct,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Virhe");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">
            Muokkaa projektia
          </h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={17} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Projektin nimi *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Asiakas</label>
            <select
              value={form.customer_id}
              onChange={(e) =>
                setForm({ ...form, customer_id: e.target.value })
              }
              disabled={loadingCustomers}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors disabled:opacity-60"
            >
              <option value="">
                {loadingCustomers ? "Ladataan..." : "Ei asiakasta"}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.first_name, c.last_name].filter(Boolean).join(" ") ||
                    c.email ||
                    c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Tila</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              >
                {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Budjetti (€)
            </label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Vastuuhenkilö
            </label>
            <select
              value={form.assigned_to}
              onChange={(e) =>
                setForm({ ...form, assigned_to: e.target.value })
              }
              disabled={loadingStaff}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors disabled:opacity-60"
            >
              <option value="">
                {loadingStaff ? "Ladataan..." : "Ei vastuuhenkilöä"}
              </option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {[s.first_name, s.last_name].filter(Boolean).join(" ") ||
                    s.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Edistyminen — {form.progress_pct}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress_pct}
              onChange={(e) =>
                setForm({ ...form, progress_pct: parseInt(e.target.value) })
              }
              className="w-full accent-copper"
            />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors"
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
