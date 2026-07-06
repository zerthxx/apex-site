"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Invoice, Project } from "./types";

export function NewInvoiceModal({
  customerId,
  projects,
  invoice,
  onClose,
  onSaved,
}: {
  customerId: string;
  projects: Project[];
  invoice?: Invoice;
  onClose: () => void;
  onSaved: (inv: Invoice) => void;
}) {
  const isEdit = !!invoice;
  const [form, setForm] = useState({
    project_id: "",
    amount: invoice?.amount != null ? String(invoice.amount) : "",
    due_date: invoice?.due_date ? invoice.due_date.slice(0, 10) : "",
    status: invoice?.status ?? "pending",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = isEdit
      ? {
          id: invoice!.id,
          amount: form.amount ? parseFloat(form.amount) : null,
          due_date: form.due_date || null,
          status: form.status,
        }
      : {
          customer_id: customerId,
          project_id: form.project_id || null,
          amount: form.amount ? parseFloat(form.amount) : null,
          due_date: form.due_date || null,
          status: form.status,
        };
    const res = await fetch("/api/invoices", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Virhe");
      return;
    }
    onSaved(data.invoice);
    onClose();
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
            {isEdit ? "Muokkaa laskua" : "Uusi lasku"}
          </h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {!isEdit && (
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Projekti
              </label>
              <select
                value={form.project_id}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value })
                }
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              >
                <option value="">Ei projektia</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Summa (€)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="0"
                step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Eräpäivä
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            >
              <option value="pending">Odottaa</option>
              <option value="sent">Lähetetty</option>
              {isEdit && (
                <>
                  <option value="paid">Maksettu</option>
                  <option value="overdue">Myöhässä</option>
                  <option value="refunded">Palautettu</option>
                  <option value="cancelled">Peruttu</option>
                </>
              )}
            </select>
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
              {saving ? "..." : isEdit ? "Tallenna" : "Luo lasku"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
