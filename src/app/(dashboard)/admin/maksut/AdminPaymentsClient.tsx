"use client";

import { useState } from "react";
import { Search, Download, RefreshCcw, Receipt, ExternalLink, X, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  receipt_url?: string | null;
  created_at: string;
  paid_at?: string | null;
  refunded_at?: string | null;
  invoices?: { invoice_number?: string | null; amount?: number | null } | null;
  customers?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
}

interface Stats {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  count: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Odottaa",
  completed: "Maksettu",
  failed: "Epäonnistui",
  refunded: "Palautettu",
  cancelled: "Peruutettu",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-copper/10 text-copper border-copper/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  failed: "bg-bad/10 text-bad border-bad/20",
  refunded: "bg-surface text-ink-ghost border-wire",
  cancelled: "bg-surface text-ink-ghost border-wire",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function RefundModal({ payment, onClose, onRefunded }: {
  payment: Payment;
  onClose: () => void;
  onRefunded: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRefund() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/payments/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: payment.id, reason: "requested_by_customer" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onRefunded(payment.id);
    onClose();
  }

  const inv = payment.invoices as any;
  const cus = payment.customers as any;
  const cusName = [cus?.first_name, cus?.last_name].filter(Boolean).join(" ") || cus?.email || "Tuntematon";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Vahvista palautus</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <div className="flex items-start gap-3 mb-4 p-3 bg-bad/10 border border-bad/20 rounded-lg">
          <AlertTriangle size={16} className="text-bad mt-0.5 shrink-0" />
          <p className="text-xs text-bad">
            Tätä toimintoa ei voi peruuttaa. Stripeä veloitetaan palautuksesta.
          </p>
        </div>
        <div className="space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-ghost">Asiakas</span>
            <span className="text-ink font-medium">{cusName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-ghost">Lasku</span>
            <span className="text-ink">{inv?.invoice_number ? `#${inv.invoice_number}` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-ghost">Palautettava summa</span>
            <span className="text-ink font-bold">{payment.amount.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
        {error && <p className="text-xs text-bad mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">
            Peruuta
          </button>
          <button onClick={handleRefund} disabled={loading} className="flex-1 py-2 rounded-lg bg-bad text-white text-sm font-medium hover:bg-bad/90 disabled:opacity-50 transition-colors">
            {loading ? "Käsitellään..." : "Tee palautus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ payment, onClose, onDeleted }: {
  payment: Payment;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: payment.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onDeleted(payment.id);
    onClose();
  }

  const inv = payment.invoices as any;
  const cus = payment.customers as any;
  const cusName = [cus?.first_name, cus?.last_name].filter(Boolean).join(" ") || cus?.email || "Tuntematon";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Poista maksutapahtuma</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <div className="flex items-start gap-3 mb-4 p-3 bg-bad/10 border border-bad/20 rounded-lg">
          <AlertTriangle size={16} className="text-bad mt-0.5 shrink-0" />
          <p className="text-xs text-bad">
            Tämä poistaa maksutapahtuman pysyvästi tietokannasta.
          </p>
        </div>
        <div className="space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-ghost">Asiakas</span>
            <span className="text-ink font-medium">{cusName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-ghost">Lasku</span>
            <span className="text-ink">{inv?.invoice_number ? `#${inv.invoice_number}` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-ghost">Summa</span>
            <span className="text-ink font-bold">{payment.amount?.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
        {error && <p className="text-xs text-bad mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">
            Peruuta
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2 rounded-lg bg-bad text-white text-sm font-medium hover:bg-bad/90 disabled:opacity-50 transition-colors">
            {loading ? "Poistetaan..." : "Poista"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  payments: Payment[];
  stats: Stats;
}

export function AdminPaymentsClient({ payments: initial, stats }: Props) {
  const [payments, setPayments] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [exporting, setExporting] = useState(false);

  const filtered = payments.filter((p) => {
    const inv = p.invoices as any;
    const cus = p.customers as any;
    const text = [
      inv?.invoice_number,
      cus?.first_name,
      cus?.last_name,
      cus?.email,
      p.id,
    ].filter(Boolean).join(" ").toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function customerName(p: Payment) {
    const cus = p.customers as any;
    if (!cus) return "—";
    return [cus.first_name, cus.last_name].filter(Boolean).join(" ") || cus.email || "—";
  }

  function handleRefunded(paymentId: string) {
    setPayments((prev) =>
      prev.map((p) => p.id === paymentId ? { ...p, status: "refunded" } : p)
    );
  }

  function handleDeleted(paymentId: string) {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/payments/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maksut_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Kerätty yhteensä", value: `${stats.totalCollected.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`, color: "text-ok" },
          { label: "Odottaa", value: `${stats.totalPending.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`, color: "text-copper" },
          { label: "Palautettu", value: `${stats.totalRefunded.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`, color: "text-bad" },
          { label: "Tapahtumia", value: stats.count, color: "text-ink" },
        ].map((s) => (
          <div key={s.label} className="bg-elevated border border-wire rounded-xl px-4 py-3">
            <p className="text-xs text-ink-ghost mb-1">{s.label}</p>
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae nimellä, sähköpostilla, laskunumerolla..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
        >
          <option value="all">Kaikki tilat</option>
          <option value="pending">Odottaa</option>
          <option value="completed">Maksettu</option>
          <option value="failed">Epäonnistui</option>
          <option value="refunded">Palautettu</option>
        </select>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-3 py-2 bg-surface border border-wire rounded-lg text-sm text-ink hover:bg-elevated disabled:opacity-50 transition-colors shrink-0"
        >
          <Download size={14} />
          {exporting ? "Viedään..." : "Vie CSV"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-ink-ghost">
            <Receipt size={28} className="opacity-30" />
            {search || statusFilter !== "all" ? "Ei hakutuloksia" : "Ei maksutapahtumia"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Lasku</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Asiakas</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Summa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Tila</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Päivämäärä</th>
                <th className="px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider text-right">Toiminnot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((p) => {
                const inv = p.invoices as any;
                return (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      {inv?.invoice_number ? `#${inv.invoice_number}` : p.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                      {customerName(p)}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {p.amount != null
                        ? `${p.amount.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-ghost hidden lg:table-cell">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString("fi-FI")
                        : new Date(p.created_at).toLocaleDateString("fi-FI")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.receipt_url && (
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-ink-ghost hover:text-copper transition-colors"
                            title="Avaa kuitti"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {p.status === "completed" && (
                          <button
                            onClick={() => setRefundTarget(p)}
                            className="inline-flex items-center gap-1 text-xs text-ink-ghost hover:text-bad transition-colors"
                            title="Tee palautus"
                          >
                            <RefreshCcw size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="inline-flex items-center gap-1 text-xs text-ink-ghost hover:text-bad transition-colors"
                          title="Poista"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {refundTarget && (
        <RefundModal
          payment={refundTarget}
          onClose={() => setRefundTarget(null)}
          onRefunded={handleRefunded}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          payment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
