"use client";

import { Plus, Receipt, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Invoice } from "../types";

export function InvoicesTab({
  invoices,
  canModerate,
  onNewInvoice,
  onMarkPaid,
  onEdit,
  onDelete,
  onDeleteAll,
}: {
  invoices: Invoice[];
  canModerate: boolean;
  onNewInvoice: () => void;
  onMarkPaid: (id: string) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onDeleteAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2 mb-1">
        {canModerate && invoices.length > 0 && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-wire text-xs font-medium text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors"
          >
            <Trash2 size={12} />
            Poista kaikki
          </button>
        )}
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
              <button
                onClick={() => onEdit(inv)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-wire text-xs text-ink-ghost hover:text-ink hover:border-copper transition-colors"
              >
                <Pencil size={12} />
                Muokkaa
              </button>
              {canModerate && (
                <button
                  onClick={() => onDelete(inv)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-wire text-xs text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors"
                >
                  <Trash2 size={12} />
                  Poista
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
