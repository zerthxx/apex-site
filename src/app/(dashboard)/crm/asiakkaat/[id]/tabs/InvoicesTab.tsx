"use client";

import { Plus, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Invoice } from "../types";

export function InvoicesTab({
  invoices,
  onNewInvoice,
  onMarkPaid,
}: {
  invoices: Invoice[];
  onNewInvoice: () => void;
  onMarkPaid: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end mb-1">
        <button
          onClick={onNewInvoice}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 transition-colors"
        >
          <Plus size={12} />
          Uusi lasku
        </button>
      </div>
      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="Ei laskuja" />
      ) : (
        invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-ink">
                {inv.invoice_number ?? "Lasku"}
              </p>
              {inv.due_date && (
                <p className="text-xs text-ink-ghost">
                  Eräpäivä: {new Date(inv.due_date).toLocaleDateString("fi-FI")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {inv.amount != null && (
                <span className="text-sm text-ink">
                  {inv.amount.toLocaleString("fi-FI")} €
                </span>
              )}
              <StatusBadge status={inv.status} />
              {(inv.status === "pending" || inv.status === "sent") && (
                <button
                  onClick={() => onMarkPaid(inv.id)}
                  className="px-2.5 py-1 rounded-lg border border-ok/30 text-ok text-xs font-medium hover:bg-ok/10 transition-colors"
                >
                  Merkitse maksetuksi
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
