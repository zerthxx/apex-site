"use client";

import { useState } from "react";
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

export function QuoteDetailClient({ quote: initial, isStaff }: { quote: Quote; isStaff: boolean }) {
  const [quote, setQuote] = useState(initial);
  const [updating, setUpdating] = useState(false);

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
      setQuote({ ...quote, ...data.quote });
    }
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
          </div>
        </div>
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
    </div>
  );
}
