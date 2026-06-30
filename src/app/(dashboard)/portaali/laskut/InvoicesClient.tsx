"use client";

import { useState } from "react";
import { Plus, X, Check, Receipt, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoice_number?: string | null;
  amount?: number | null;
  status: string;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  customers?: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  projects?: { id: string; name: string } | null;
}

interface Customer { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; }
interface Project { id: string; name: string; customer_id?: string | null; }

const STATUS_LABELS: Record<string, string> = {
  pending: "Odottaa", sent: "Lähetetty", paid: "Maksettu", overdue: "Myöhässä", cancelled: "Peruttu",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-surface text-ink-ghost border-wire",
  sent: "bg-copper/10 text-copper border-copper/20",
  paid: "bg-ok/10 text-ok border-ok/20",
  overdue: "bg-bad/10 text-bad border-bad/20",
  cancelled: "bg-surface text-ink-ghost border-wire",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function NewInvoiceModal({ customers, projects, onClose, onCreated }: {
  customers: Customer[];
  projects: Project[];
  onClose: () => void;
  onCreated: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({
    customer_id: "",
    project_id: "",
    amount: "",
    due_date: "",
    status: "pending" as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProjects = form.customer_id
    ? projects.filter((p) => !p.customer_id || p.customer_id === form.customer_id)
    : projects;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_id) { setError("Asiakas vaaditaan"); return; }
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: form.customer_id,
        project_id: form.project_id || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        due_date: form.due_date || null,
        status: form.status,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.invoice);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi lasku</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Asiakas *</label>
            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value, project_id: "" })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="">Valitse asiakas...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Projekti (valinnainen)</label>
            <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="">Ei projektia</option>
              {filteredProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Summa (€)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" min="0" step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Eräpäivä</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="pending">Luonnos</option>
              <option value="sent">Lähetä asiakkaalle</option>
            </select>
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : "Luo lasku"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  invoices: Invoice[];
  customers: Customer[];
  projects: Project[];
  isStaff: boolean;
}

export function InvoicesClient({ invoices: initial, customers, projects, isStaff, isAdmin }: Props & { isAdmin?: boolean }) {
  const [invoices, setInvoices] = useState(initial);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = statusFilter === "all" ? invoices : invoices.filter((i) => i.status === statusFilter);

  async function markPaid(id: string) {
    setMarkingPaid(id);
    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    const data = await res.json();
    setMarkingPaid(null);
    if (res.ok) setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, ...data.invoice } : i));
  }

  async function deleteInvoice(id: string) {
    const res = await fetch("/api/invoices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      setDeletingId(null);
    }
  }

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + (i.amount ?? 0), 0);
  const pending = invoices.filter((i) => i.status === "pending" || i.status === "sent");

  return (
    <div>
      {isStaff && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-elevated border border-wire rounded-xl p-4">
            <p className="text-xs text-ink-ghost">Laskutettu yhteensä</p>
            <p className="text-2xl font-bold text-ink mt-1">{totalRevenue.toLocaleString("fi-FI")} €</p>
          </div>
          <div className="bg-elevated border border-wire rounded-xl p-4">
            <p className="text-xs text-ink-ghost">Avoimet laskut</p>
            <p className="text-2xl font-bold text-ink mt-1">{pending.length}</p>
          </div>
          <div className="bg-elevated border border-wire rounded-xl p-4">
            <p className="text-xs text-ink-ghost">Laskuja yhteensä</p>
            <p className="text-2xl font-bold text-ink mt-1">{invoices.length}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-1 bg-surface border border-wire rounded-lg p-1 overflow-x-auto">
          {["all","pending","sent","paid","overdue"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                statusFilter === s ? "bg-elevated text-ink border border-wire shadow-sm" : "text-ink-ghost hover:text-ink")}>
              {s === "all" ? "Kaikki" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {isStaff && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0">
            <Plus size={15} />Uusi lasku
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-wire bg-elevated">
          <Receipt size={28} className="text-ink-ghost mb-3" />
          <p className="text-sm text-ink-ghost">Ei laskuja</p>
        </div>
      ) : (
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-wire">
              <tr className="text-xs text-ink-ghost">
                <th className="text-left px-4 py-3 font-medium">Lasku</th>
                {isStaff && <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Asiakas</th>}
                {isStaff && <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Projekti</th>}
                <th className="text-left px-4 py-3 font-medium">Summa</th>
                <th className="text-left px-4 py-3 font-medium">Eräpäivä</th>
                <th className="text-left px-4 py-3 font-medium">Tila</th>
                {isStaff && <th className="text-left px-4 py-3 font-medium">Toiminnot</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((inv) => {
                const customerName = inv.customers
                  ? [inv.customers.first_name, inv.customers.last_name].filter(Boolean).join(" ") || inv.customers.email
                  : "—";
                return (
                  <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{inv.invoice_number ?? "—"}</p>
                      <p className="text-xs text-ink-ghost">{new Date(inv.created_at).toLocaleDateString("fi-FI")}</p>
                    </td>
                    {isStaff && <td className="px-4 py-3 hidden md:table-cell text-ink">{customerName}</td>}
                    {isStaff && <td className="px-4 py-3 hidden lg:table-cell text-ink-ghost">{inv.projects?.name ?? "—"}</td>}
                    <td className="px-4 py-3 font-medium text-ink">
                      {inv.amount != null ? `${inv.amount.toLocaleString("fi-FI")} €` : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-ghost">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("fi-FI") : "—"}
                    </td>
                    <td className="px-4 py-3"><Badge status={inv.status} /></td>
                    {isStaff && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {["pending","sent"].includes(inv.status) && (
                            <button
                              onClick={() => markPaid(inv.id)}
                              disabled={markingPaid === inv.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ok/10 text-ok text-xs font-medium hover:bg-ok/20 border border-ok/20 transition-colors disabled:opacity-50"
                            >
                              <Check size={12} />{markingPaid === inv.id ? "..." : "Maksettu"}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingId(inv.id)}
                              className="p-1.5 rounded-lg text-ink-ghost hover:text-bad hover:bg-bad/5 border border-transparent hover:border-bad/10 transition-colors"
                              title="Poista"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewInvoiceModal
          customers={customers}
          projects={projects}
          onClose={() => setShowNew(false)}
          onCreated={(inv) => setInvoices((prev) => [inv, ...prev])}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
            <h2 className="text-base font-semibold text-ink mb-2">Poista lasku</h2>
            <p className="text-sm text-ink-dim mb-5">Poistetaanko lasku? Toimintoa ei voi kumota.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">
                Peruuta
              </button>
              <button
                onClick={() => deleteInvoice(deletingId)}
                className="flex-1 py-2 rounded-lg bg-bad text-white text-sm font-medium hover:bg-bad/90 transition-colors"
              >
                Poista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
