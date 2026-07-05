"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Quote } from "./types";

export function NewQuoteModal({
  customerId,
  companyId,
  onClose,
  onCreated,
}: {
  customerId: string;
  companyId?: string | null;
  onClose: () => void;
  onCreated: (q: Quote) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    valid_until: "",
    notes: "",
    status: "draft" as "draft" | "sent",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Otsikko vaaditaan");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        customer_id: customerId,
        company_id: companyId ?? null,
        amount: form.amount ? parseFloat(form.amount) : null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
        status: form.status,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Virhe");
      return;
    }
    onCreated(data.quote);
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
          <h2 className="text-base font-semibold text-ink">Uusi tarjous</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Otsikko *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="esim. Verkkosivuprojekti 2025"
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Summa (€)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">
                Voimassa asti
              </label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) =>
                  setForm({ ...form, valid_until: e.target.value })
                }
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">
              Muistiinpanot
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "draft" | "sent" })
              }
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
            >
              <option value="draft">Luonnos</option>
              <option value="sent">Lähetä asiakkaalle</option>
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
              {saving ? "..." : "Luo tarjous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
