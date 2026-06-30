"use client";

import { useState } from "react";
import { Receipt, ExternalLink, Search } from "lucide-react";
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

interface Props {
  payments: Payment[];
  isStaff: boolean;
}

export function PaymentsClient({ payments: initial, isStaff }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initial.filter((p) => {
    const inv = p.invoices as any;
    const cus = p.customers as any;
    const text = [
      inv?.invoice_number,
      cus?.first_name,
      cus?.last_name,
      cus?.email,
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

  const totalPaid = initial
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Yhteensä maksettu", value: `${totalPaid.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`, highlight: true },
          { label: "Maksuja", value: initial.length },
          { label: "Maksettu", value: initial.filter((p) => p.status === "completed").length },
          { label: "Palautettu", value: initial.filter((p) => p.status === "refunded").length },
        ].map((s) => (
          <div key={s.label} className="bg-elevated border border-wire rounded-xl px-4 py-3">
            <p className="text-xs text-ink-ghost mb-1">{s.label}</p>
            <p className={cn("text-lg font-bold", s.highlight ? "text-copper" : "text-ink")}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {isStaff && (
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hae asiakasta tai laskua..."
              className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors"
            />
          </div>
        )}
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
      </div>

      {/* Table */}
      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-ink-ghost">
            <Receipt size={28} className="opacity-30" />
            {search || statusFilter !== "all" ? "Ei hakutuloksia" : "Ei maksutapahtumia vielä"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Lasku</th>
                {isStaff && <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Asiakas</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Summa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Tila</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Päivämäärä</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((p) => {
                const inv = p.invoices as any;
                return (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      {inv?.invoice_number ? `#${inv.invoice_number}` : "—"}
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                        {customerName(p)}
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-ink">
                      {p.amount != null
                        ? `${p.amount.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-ghost hidden md:table-cell">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString("fi-FI")
                        : new Date(p.created_at).toLocaleDateString("fi-FI")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.receipt_url && (
                        <a
                          href={p.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-copper hover:text-copper/80 transition-colors"
                        >
                          <Receipt size={13} />
                          Kuitti
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
