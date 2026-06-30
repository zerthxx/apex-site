"use client";

import { useState } from "react";
import { Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  title: string;
  status: string;
  amount?: number | null;
  valid_until?: string | null;
  notes?: string | null;
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

function EditQuoteModal({ quote, onClose, onSaved }: { quote: Quote; onClose: () => void; onSaved: (q: Partial<Quote>) => void }) {
  const [form, setForm] = useState({
    title: quote.title,
    amount: quote.amount != null ? String(quote.amount) : "",
    valid_until: quote.valid_until ?? "",
    notes: quote.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Otsikko vaaditaan"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: quote.id,
        title: form.title,
        amount: form.amount ? parseFloat(form.amount) : null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onSaved(data.quote);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Muokkaa tarjousta</h2>
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
                min="0" step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Voimassa asti</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Muistiinpanot</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuoteDetailClient({ quote: initial, isStaff }: { quote: Quote; isStaff: boolean }) {
  const [quote, setQuote] = useState(initial);
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function updateStatus(status: string) {
    setUpdating(true);
    const res = await fetch("/api/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: quote.id, status }),
    });
    setUpdating(false);
    if (res.ok) {
      const data = await res.json();
      setQuote((prev) => ({ ...prev, ...data.quote }));
    }
  }

  function handleSaved(updated: Partial<Quote>) {
    setQuote((prev) => ({ ...prev, ...updated }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  const customerName = quote.customers
    ? [quote.customers.first_name, quote.customers.last_name].filter(Boolean).join(" ") || quote.customers.email
    : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">{quote.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[quote.status] ?? "bg-surface text-ink-ghost border-wire")}>
              {STATUS_LABELS[quote.status] ?? quote.status}
            </span>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-ok"><Check size={12} />Tallennettu</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-wire rounded-lg text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors"
            >
              <Edit2 size={13} />Muokkaa
            </button>
          )}
          {!isStaff && quote.status === "sent" && (
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus("rejected")}
                disabled={updating}
                className="px-3 py-2 rounded-lg border border-bad/30 text-bad text-sm font-medium hover:bg-bad/10 disabled:opacity-50 transition-colors"
              >
                Hylkää
              </button>
              <button
                onClick={() => updateStatus("accepted")}
                disabled={updating}
                className="px-3 py-2 rounded-lg bg-ok text-white text-sm font-medium hover:bg-ok/90 disabled:opacity-50 transition-colors"
              >
                Hyväksy
              </button>
            </div>
          )}
          {isStaff && (
            <div className="flex gap-2">
              {(["draft","sent","accepted","rejected"] as const).filter((s) => s !== quote.status).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 transition-colors",
                    STATUS_COLORS[s]
                  )}
                >
                  → {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-elevated border border-wire rounded-xl p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            { label: "Asiakas", value: customerName },
            { label: "Yritys", value: quote.companies?.name },
            { label: "Summa", value: quote.amount != null ? `${quote.amount.toLocaleString("fi-FI")} €` : null },
            { label: "Voimassa asti", value: quote.valid_until ? new Date(quote.valid_until).toLocaleDateString("fi-FI") : null },
            { label: "Luotu", value: new Date(quote.created_at).toLocaleDateString("fi-FI") },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-ink-ghost">{label}</dt>
              <dd className="text-ink mt-0.5">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
        {quote.notes && (
          <div className="mt-5 pt-5 border-t border-wire">
            <p className="text-xs text-ink-ghost mb-1">Muistiinpanot</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>

      {showEdit && (
        <EditQuoteModal
          quote={quote}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
